# DeRisk — System Architecture Constraints

This document defines the canonical system constraints for the **DeRisk** project. All contributors and AI agents must treat these constraints as authoritative guardrails during design, implementation, and review.

---

## 1. Core Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Smart Contracts | **Rust / Odra** | All on-chain logic must be written using the Odra framework targeting the Casper Network. |
| Off-Chain Agent | **Python** | The autonomous risk-evaluation agent runs off-chain in a Python runtime. |
| Web Frontend | **Next.js** | The user-facing dashboard is a Next.js application. |

> **Strict Constraint:** Mobile and native application frameworks (React Native, Flutter, Electron, Swift, Kotlin, etc.) are **explicitly prohibited**. The frontend surface is web-only.

---

## 2. Agent Workflow

The Python off-chain agent follows this pipeline:

```
CSPR.cloud Streaming API
        │
        ▼
  [Ingest & Parse]         ← Python agent receives real-time on-chain events
        │
        ▼
  [LLM Evaluation]         ← Language model scores exploit signatures & risk vectors
        │
        ▼
  [Risk Decision]          ← Agent determines whether premium rate adjustment is needed
        │
        ▼
  [Odra Contract Call]     ← Agent submits a transaction to update on-chain premium rates
```

- The agent **must** consume CSPR.cloud's streaming data as its primary on-chain data source.
- LLM inference is used exclusively for **exploit signature evaluation** and risk scoring — not for UI generation or routing logic.
- The Odra smart contract is the **single source of truth** for premium rates; the agent writes to it, never to an intermediary database.

---

## 3. x402 Integration

The Python agent **must** implement support for the [x402 payment protocol](https://x402.org) via standard HTTP headers.

### Requirements

- Before calling any external risk-validation API, the agent must inspect the response for a `402 Payment Required` status.
- On receipt of a `402`, the agent must parse the `X-Payment` / `X-Payment-Receipt` headers and fulfil the micropayment automatically.
- Payment flows must be non-blocking with respect to the main risk-evaluation loop — use async handlers or a dedicated payment worker.
- All x402 transactions must be logged with: timestamp, endpoint, amount, and receipt hash.

### Prohibited Patterns

- Hard-coding API credentials or payment amounts.
- Falling back silently on payment failure — the agent must raise a structured error and halt the affected validation step.

---

## 4. Design Pattern — Separation of Concerns

```
┌─────────────────────────────────────────────────────────┐
│  Next.js Frontend  (read-only dashboard, no AI logic)   │
└────────────────────────┬────────────────────────────────┘
                         │  REST / WebSocket (read-only)
┌────────────────────────▼────────────────────────────────┐
│  Python Agent           (AI evaluation, x402 payments,  │
│                          contract writes)               │
└────────────────────────┬────────────────────────────────┘
                         │  Casper RPC / Odra SDK
┌────────────────────────▼────────────────────────────────┐
│  Rust / Odra Smart Contract  (premium rates, on-chain   │
│                               state, access control)    │
└─────────────────────────────────────────────────────────┘
```

### Enforcement Rules

1. **AI logic must not live in the frontend.** The Next.js layer may only *display* data fetched from the agent's API or directly from on-chain state. It must never import or invoke an LLM.
2. **The smart contract must not depend on the agent.** The Odra contract exposes permissioned write endpoints; it does not call back into Python or any off-chain service.
3. **The agent is the only writer.** No other service or frontend call may directly mutate on-chain premium rates.
4. **Interfaces between layers must be versioned.** Any API contract between the frontend and agent, or between the agent and contract ABI, must be explicitly versioned.

---

## 5. Out-of-Scope (Explicitly Excluded)

- Native / mobile app targets of any kind.
- Direct database writes from the frontend.
- LLM calls originating from Next.js or from within Rust/Odra contracts.
- Any payment mechanism other than x402 for external API consumption.

---

*Last updated: 2026-06-22 | Status: **Active — Phase 1 constraints locked.***
