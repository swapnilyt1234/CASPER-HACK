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
# HTTPS endpoints only — port 7777 is ISP-blocked
# ─────────────────────────────────────────────
TESTNET_RPC_URL = "https://node.testnet.casper.network/rpc"
REQUEST_TIMEOUT = 30


def probe_https_node(url: str) -> bool:
    """Confirm the HTTPS endpoint is alive."""
    try:
        r = requests.post(
            url,
            json={"jsonrpc": "2.0", "method": "info_get_status", "params": [], "id": 1},
            timeout=10,
        )
        return r.status_code == 200 and "result" in r.json()
    except Exception:
        return False


def send_deploy_https(deploy, rpc_url: str) -> str:
    """
    Bypass pycspr's NodeRpcClient (which doesn't handle HTTPS properly)
    and POST the signed deploy directly via requests.
    Returns the deploy hash string.
    """
    # Try different serialisation methods depending on pycspr version
    deploy_dict = None
    for method in [
        lambda: deploy.to_json(),
        lambda: pycspr.serialisation.to_json(deploy),
        lambda: pycspr.serializer.to_json(deploy),
    ]:
        try:
            deploy_dict = method()
            break
        except Exception:
            continue

    if deploy_dict is None:
        raise RuntimeError("Could not serialise deploy — check pycspr version.")

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "account_put_deploy",
        "params": {"deploy": deploy_dict},
    }

    r = requests.post(
        rpc_url,
        json=payload,
        timeout=REQUEST_TIMEOUT,
        headers={"Content-Type": "application/json"},
    )
    data = r.json()

    if "error" in data:
        raise RuntimeError(f"RPC error {data['error'].get('code')}: {data['error'].get('message')}")

    return data["result"]["deploy_hash"]


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

    print("[*] Initialising Testnet Deployment...")

    # Confirm HTTPS endpoint is up
    print(f"[*] Probing {TESTNET_RPC_URL} ...", end=" ", flush=True)
    if probe_https_node(TESTNET_RPC_URL):
        print("[+] ONLINE")
    else:
        print("[-] UNREACHABLE")
        print("    Fallback: sign up at cspr.cloud for a managed endpoint.")
        return

    rpc_url = TESTNET_RPC_URL
    print(f"[*] Locked to: {rpc_url}\n")

    # ── Key path ────────────────────────────────────────────────────────
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

    # ── WASM path ────────────────────────────────────────────────────────
    WASM_PATH = "target/wasm32-unknown-unknown/release/derisk_vault_build_contract_clean.wasm"
    if not os.path.exists(WASM_PATH):
        # fallback to unstripped if clean version not present
        WASM_PATH = "target/wasm32-unknown-unknown/release/derisk_vault_build_contract.wasm"
        if not os.path.exists(WASM_PATH):
            print(f"[-] Error: Compiled WASM not found. Run build.ps1 first.")
            return
        print(f"[!] Warning: Using unstripped WASM — run wasm-opt first or node may reject it.")

    print(f"[*] WASM: {WASM_PATH}")

    # ── Load key ─────────────────────────────────────────────────────────
    try:
        keypair = pycspr.parse_private_key(KEY_PATH, KeyAlgorithm.SECP256K1.name)
        print("[+] Loaded Private Key.")
    except Exception as e:
        print(f"[-] Failed to load key: {e}")
        return

    with open(WASM_PATH, "rb") as f:
        wasm_bytes = f.read()

    session = build_session_object(wasm_bytes)
    payment = pycspr.create_standard_payment(500 * (10 ** 9))

    # ── Broadcast with High-S retry loop ─────────────────────────────────
    print("\n[+] Signing and broadcasting (auto-retrying High-S signatures)...")
    hash_str = None

    for attempt in range(10):
        deploy_params = pycspr.create_deploy_parameters(
            account=keypair,
            chain_name="casper-test",
        )
        deploy = pycspr.create_deploy(deploy_params, payment, session)
        deploy.approve(keypair)

        try:
            hash_str = send_deploy_https(deploy, rpc_url)
            print(f"[+] Broadcasted on attempt {attempt + 1}!")
            print(f"[+] Deploy Hash : {hash_str}")
            print(f"[+] Track at   : https://testnet.cspr.live/deploy/{hash_str}")
            break

        except Exception as e:
            err = str(e).lower()
            if "invalid approval" in err or "high" in err:
                print(f"   -> [Attempt {attempt + 1}] High-S signature hit. Recalculating...")
                time.sleep(1)
                continue
            else:
                print(f"[-] Failed to broadcast: {e}")
                return

    if not hash_str:
        print("[-] Could not produce a valid signature after 10 attempts.")
        return

    # ── Poll for finality ─────────────────────────────────────────────────
    print("\n[*] Polling for finality (up to 60 s)...")
    contract_hash = None

    for poll in range(30):
        await asyncio.sleep(2)
        try:
            response = requests.post(
                rpc_url,
                json={
                    "jsonrpc": "2.0", "id": 1,
                    "method": "info_get_deploy",
                    "params": {"deploy_hash": hash_str},
                },
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
                    print(f"[+] Execution confirmed on poll {poll + 1}.")
                    break
                elif "Failure" in result_data:
                    print(f"[-] Deploy failed on-chain: {result_data['Failure']['error_message']}")
                    return
        except Exception:
            pass

    if contract_hash:
        print(f"\n[+] Contract deployed! Contract hash: {contract_hash}")
        print("    -> Add DERISK_CONTRACT_HASH to your .env file.")
    else:
        print("\n[-] Polling timed out — deploy may still be processing.")
        print(f"    Check: https://testnet.cspr.live/deploy/{hash_str}")


if __name__ == "__main__":
    asyncio.run(main())