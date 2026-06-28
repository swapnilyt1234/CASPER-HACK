# DeRisk Vault

> **Autonomous off-chain AI Sentinel and dynamic risk mitigation protocol on the Casper Blockchain**

DeRisk Vault is a non-custodial liquidity protocol built natively on the Casper Network. It bridges on-chain capital with off-chain artificial intelligence, deploying a 24/7 AI Sentinel that actively monitors market conditions. By predicting volatility and dynamically adjusting smart contract state, the Sentinel protects liquidity providers while continuously compounding yield.

---

## Core Architecture & Flow

DeRisk Vault is designed as a secure, multi-layered system:

1. **Frontend Presentation Layer**
   - Built with Next.js (App Router), Tailwind CSS, and Lucide Icons.
   - Designed using a highly responsive, wallet-gated Lovable UI design system.
   - Exposes a seamless dashboard for users to deposit/withdraw CSPR, review live parameters, and verify Sentinel actions cryptographically.

2. **Off-Chain AI Sentinel**
   - A 24/7 Python-based automation agent tracking real-time market volatility via the CoinGecko API.
   - Computes predictive risk profiles and signs on-chain transactions using the Casper Python SDK to update the smart contract state autonomously.

3. **On-Chain Settlement Layer**
   - Rust-based smart contracts deployed on the Casper Network.
   - Manages non-custodial asset locks, enforces Sentinel directives, updates premium rates (between 5% and 15%), and handles emergency halts (locking protocol entry/exit during extreme volatility).

---

## Key Features

- **Dynamic Premium Adjustment**: Yield to liquidity providers expands and contracts with measured market risk, maximizing efficiency.
- **Automated Protocol Circuit Breakers**: The AI Sentinel can trigger an immediate emergency halt flag if market anomaly thresholds are crossed, protecting LPs from sudden crashes.
- **Cryptographic Audit Trail**: Every AI intervention is recorded and streamed to the UI with live, verifiable transaction hashes linking directly to [cspr.live](https://testnet.cspr.live).
- **Localized Browser State Persistence**: The UI intelligently persists simulated balance states across wallet connection cycles locally, protecting privacy while enhancing UX.

---

## Tech Stack & Tooling

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js, React, TypeScript | Application framework and UI rendering |
| **Styling** | Tailwind CSS, Lucide React | Utility-first styling and iconography |
| **Smart Contracts** | Casper SDK, Rust, WebAssembly | On-chain settlement and non-custodial logic |
| **Agentic Infra** | Python, CoinGecko API | Off-chain data aggregation and automation |

---

## Environment Configuration

To run DeRisk Vault locally, create `.env` files in both the frontend and backend directories. Use the generic dummy template below:

```bash
# ==========================================
# Frontend: derisk-dashboard/.env.local
# ==========================================

# RPC Endpoint for the Casper Node
NEXT_PUBLIC_CASPER_RPC_URL="http://your-casper-node-url.com:7777/rpc"

# Network Name (casper-test or casper)
NEXT_PUBLIC_NETWORK_NAME="casper-test"


# ==========================================
# Backend: derisk_vault/.env
# ==========================================

# The live contract hash on Casper
VITE_CONTRACT_HASH="hash-YOUR_CONTRACT_HASH_HERE"

# RPC Node URL for Sentinel transaction submission
RPC_NODE_URL="http://your-casper-node-url.com:7777/rpc"

# CoinGecko API Key for the Python Sentinel
COINGECKO_API_KEY="your_coingecko_api_key_here"

# Path to your Casper private key (.pem)
CASPER_PRIVATE_KEY_PATH="./secret_key.pem"
```

---

## Local Installation Steps

### 1. Frontend Dashboard Setup

Install dependencies and boot the Next.js development server:

```bash
cd derisk-dashboard
npm install
# or: bun install

npm run dev
# or: bun run dev
```

The application will be running at `http://localhost:3000`.

### 2. AI Sentinel Daemon Setup

Set up your Python virtual environment and run the Sentinel agent:

```bash
cd derisk_vault

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Sentinel loop
python ai_agent.py
```

---

*© 2026 DeRisk Labs · Open Source · Built on Casper*
