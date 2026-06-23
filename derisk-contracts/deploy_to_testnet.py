import os
import time
from dotenv import load_dotenv

# We assume casper-python-sdk exposes these standard modules for serialization and deployment
from casper_sdk import NodeClient, Deploy, DeployParameters, ModuleBytes, StandardPayment
from casper_sdk.keys import PrivateKey

def main():
    load_dotenv(dotenv_path="../.env")
    
    RPC_URL = os.environ.get("CASPER_TESTNET_RPC", "http://node.testnet.casperlabs.io:7777")
    # If running inside docker, this will use the container path. Otherwise, host path.
    KEY_PATH = os.environ.get("CONTAINER_SECRET_KEY_PATH") or os.environ.get("HOST_SECRET_KEY_PATH")
    
    if not KEY_PATH or not os.path.exists(KEY_PATH):
        print(f"[-] Error: Secret key not found at {KEY_PATH}")
        return

    WASM_PATH = "target/casper/release/derisk_vault.wasm"
    if not os.path.exists(WASM_PATH):
        print(f"[-] Error: Compiled WASM not found at {WASM_PATH}. Did you run 'cargo odra build -b casper --release'?")
        return

    print("🚀 Initializing Testnet Deployment...")
    print(f"  RPC Node: {RPC_URL}")
    print(f"  Key File: {KEY_PATH}")
    print(f"  WASM File: {WASM_PATH}")
    
    # 1. Initialize SDK Client
    client = NodeClient(RPC_URL)
    
    # 2. Load Private Key
    try:
        pk = PrivateKey.from_pem_file(KEY_PATH)
        print(f"  Loaded Public Key: {pk.public_key.to_hex()}")
    except Exception as e:
        print(f"[-] Failed to load key: {e}")
        return

    # 3. Construct Payload
    with open(WASM_PATH, "rb") as f:
        wasm_bytes = f.read()

    # Increase Gas to 500 CSPR (500,000,000,000 motes) to prevent Out of Gas on Odra contracts
    payment = StandardPayment(500 * (10**9))
    session = ModuleBytes(wasm_bytes)
    
    deploy_params = DeployParameters(
        account_public_key=pk.public_key,
        chain_name="casper-test",
        dependencies=[],
        ttl="1h"
    )

    deploy = Deploy(
        header=deploy_params,
        payment=payment,
        session=session
    )
    
    deploy.sign(pk)
    
    # 4. Broadcast
    try:
        deploy_hash = client.put_deploy(deploy)
        print(f"\n[+] Deploy successfully broadcasted!\n[+] Deploy Hash: {deploy_hash}")
    except Exception as e:
        print(f"[-] Failed to broadcast deploy: {e}")
        return

    # 5. Poll for Block Finality
    print("\n⏳ Polling for block finality...")
    contract_hash = None
    
    for i in range(30): # Poll up to 30 times (~1 minute)
        time.sleep(2) # Wait 2 seconds between polls
        try:
            status = client.get_deploy(deploy_hash)
            if status.get("execution_results"):
                result = status["execution_results"][0]["result"]
                if "Success" in result:
                    # Extract contract hash from the execution effects
                    effects = result["Success"]["effect"]["transforms"]
                    for effect in effects:
                        if effect.get("transform") == "WriteContract":
                            contract_hash = effect["key"]
                            break
                    break
                else:
                    print(f"\n[-] Transaction Failed on-chain: {result['Failure']['error_message']}")
                    return
        except Exception as e:
            # Node might not have the deploy yet
            pass
            
    if contract_hash:
        print(f"\n✅ Deployment Finalized!")
        print(f"✅ On-Chain Contract Hash: {contract_hash}")
        
        # Optionally, write it back to the .env
        print(f"\nDon't forget to update DERISK_CONTRACT_HASH in your .env file with this hash.")
    else:
        print("\n[-] Polling timed out. The transaction is still pending or the node is lagging.")
        print(f"You can check the status on cspr.live with hash: {deploy_hash}")

if __name__ == "__main__":
    main()
