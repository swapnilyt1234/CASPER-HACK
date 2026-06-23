import os
import asyncio
import requests
import inspect
import pkgutil
import importlib
import time
from dotenv import load_dotenv

import pycspr
from pycspr import NodeRpcClient, NodeRpcConnectionInfo

try:
    from pycspr.types.crypto import KeyAlgorithm
except ImportError:
    from pycspr.crypto import KeyAlgorithm

# ─────────────────────────────────────────────
# TESTNET NODE LIST — Scraped from active P2P peers
# ─────────────────────────────────────────────
TESTNET_RPC_NODES = [
    {"host": "65.109.89.88",   "port": 7777, "scheme": "http"},
    {"host": "65.109.35.210",  "port": 7777, "scheme": "http"},
    {"host": "37.27.110.49",   "port": 7777, "scheme": "http"},
    {"host": "65.109.104.245", "port": 7777, "scheme": "http"},
    {"host": "51.161.87.206",  "port": 7777, "scheme": "http"},
    {"host": "65.108.74.94",   "port": 7777, "scheme": "http"},
    {"host": "54.39.243.231",  "port": 7777, "scheme": "http"},
    {"host": "3.1.36.138",     "port": 7777, "scheme": "http"},
    {"host": "65.109.95.50",   "port": 7777, "scheme": "http"},
    {"host": "135.181.17.229", "port": 7777, "scheme": "http"},
    {"host": "node.testnet.casper.network", "port": 7777, "scheme": "http"} 
]

CONNECT_TIMEOUT = 3
REQUEST_TIMEOUT = 15

def probe_node(node: dict) -> bool:
    url = f"{node['scheme']}://{node['host']}:{node['port']}/rpc"
    try:
        r = requests.post(
            url,
            json={"jsonrpc": "2.0", "method": "info_get_status", "params": [], "id": 1},
            timeout=CONNECT_TIMEOUT,
        )
        return r.status_code == 200 and "result" in r.json()
    except Exception:
        return False

def find_live_node() -> dict:
    print("🔍 Scanning your scraped peer list for an open RPC port...")
    for node in TESTNET_RPC_NODES:
        label = f"{node['host']}:{node['port']}"
        print(f"   ↳ Pinging {label} ...", end=" ", flush=True)
        if probe_node(node):
            print("✅ ONLINE")
            return node
        print("❌ closed or unreachable")
    raise RuntimeError("All scraped peers have their public RPC ports closed.")

def build_session_object(wasm_bytes):
    module_bytes_class = None
    for loader, module_name, is_pkg in pkgutil.walk_packages(pycspr.__path__, pycspr.__name__ + "."):
        try:
            mod = importlib.import_module(module_name)
            for attr_name in dir(mod):
                if "modulebytes" in attr_name.lower() and not attr_name.startswith("_"):
                    attr = getattr(mod, attr_name)
                    if inspect.isclass(attr):
                        module_bytes_class = attr
                        break
            if module_bytes_class:
                break
        except Exception:
            continue

    if not module_bytes_class:
        raise RuntimeError("FATAL: Could not find the ModuleBytes wrapper.")

    for attempt in [
        lambda: module_bytes_class(module_bytes=wasm_bytes, args=[]),
        lambda: module_bytes_class(module_bytes=wasm_bytes, args={}),
        lambda: module_bytes_class(wasm_bytes, []),
        lambda: module_bytes_class(wasm_bytes, {}),
        lambda: module_bytes_class(wasm_bytes),
    ]:
        try:
            return attempt()
        except Exception:
            continue
    raise RuntimeError(f"Found {module_bytes_class.__name__} but could not initialise it.")

async def main():
    load_dotenv(dotenv_path="../.env")

    print("🚀 Initialising Testnet Deployment...")
    try:
        node = find_live_node()
    except RuntimeError as e:
        print(e)
        return

    host   = node["host"]
    port   = node["port"]
    scheme = node["scheme"]
    rpc_url = f"{scheme}://{host}:{port}/rpc"
    print(f"\n📡 Locking network route to: {rpc_url}\n")

    key_candidates = [
        os.environ.get("HOST_SECRET_KEY_PATH"),
        os.environ.get("CONTAINER_SECRET_KEY_PATH"),
        "../secret_key.pem",
        "secret_key.pem",
    ]
    KEY_PATH = next((p for p in key_candidates if p and os.path.exists(p)), None)
    if not KEY_PATH:
        print("[-] Error: Could not find secret_key.pem.")
        return

    WASM_PATH = "target/wasm32-unknown-unknown/release/derisk_onchain_build_contract_clean.wasm"
    if not os.path.exists(WASM_PATH):
        print(f"[-] Error: Compiled WASM not found at {WASM_PATH}.")
        return

    try:
        keypair = pycspr.parse_private_key(KEY_PATH, KeyAlgorithm.SECP256K1.name)
        print("✅ Loaded Private Key.")
    except Exception as e:
        print(f"[-] Failed to load key: {e}")
        return

    with open(WASM_PATH, "rb") as f:
        wasm_bytes = f.read()

    # Pre-build static elements to keep the loop fast
    session = build_session_object(wasm_bytes)
    payment = pycspr.create_standard_payment(500 * (10 ** 9))
    client = NodeRpcClient(NodeRpcConnectionInfo(host=host, port=port))
    deploy_func = getattr(client, "send_deploy", None) or client.deploys.send

    # ── THE MAGIC RETRY LOOP ─────────────────────────────────────────────
    print("\n[+] Signing and broadcasting deploy (Auto-retrying High-S signatures if needed)...")
    hash_str = None
    
    for attempt in range(10):
        # We MUST rebuild the deploy parameters inside the loop so the timestamp changes.
        # A new timestamp = a new hash = a fresh ECDSA signature math attempt.
        deploy_params = pycspr.create_deploy_parameters(
            account=keypair,
            chain_name="casper-test",
        )
        
        deploy = pycspr.create_deploy(deploy_params, payment, session)
        deploy.approve(keypair)
        
        try:
            result = deploy_func(deploy)
            if inspect.isawaitable(result):
                await result

            hash_str = deploy.hash.hex() if hasattr(deploy.hash, "hex") else str(deploy.hash)
            print(f"✅ Deploy broadcasted successfully on attempt {attempt + 1}!")
            print(f"✅ Deploy Hash: {hash_str}")
            break # Success! Exit the loop.
            
        except Exception as e:
            if "invalid approval" in str(e).lower():
                print(f"   ↳ [Attempt {attempt + 1}] Hit Python's SECP256K1 'High-S' signature quirk. Recalculating...")
                time.sleep(1) # Wait 1 second so the timestamp is completely different
                continue
            else:
                print(f"[-] Failed to broadcast: {e}")
                return

    if not hash_str:
        print("[-] Failed to generate a mathematically valid signature after 10 attempts.")
        return

    # ── Poll for finality ─────────────────────────────────────────────
    print("\n⏳ Polling for block finality (up to 60 s)...")
    contract_hash = None

    for attempt in range(30):
        await asyncio.sleep(2)
        try:
            response = requests.post(
                rpc_url,
                json={"jsonrpc": "2.0", "id": 1, "method": "info_get_deploy", "params": {"deploy_hash": hash_str}},
                timeout=REQUEST_TIMEOUT,
            ).json()

            exec_results = response.get("result", {}).get("execution_results", [])
            if exec_results:
                result_data = exec_results[0]["result"]
                if "Success" in result_data:
                    for effect in result_data["Success"]["effect"]["transforms"]:
                        if effect.get("transform") == "WriteContract":
                            contract_hash = effect["key"]
                            break
                    print(f"\n✅ Execution confirmed on attempt {attempt + 1}.")
                    break
                elif "Failure" in result_data:
                    print(f"\n❌ Deploy failed on-chain: {result_data['Failure']['error_message']}")
                    return
        except Exception:
            pass

    if contract_hash:
        print(f"\n✅ Contract deployed!  Hash : {contract_hash}")
        print("   → Add DERISK_CONTRACT_HASH to your .env file.")
    else:
        print("\n[-] Polling timed out — deploy may still be processing.")
        print(f"    Check manually: https://testnet.cspr.live/deploy/{hash_str}")

if __name__ == "__main__":
    asyncio.run(main())