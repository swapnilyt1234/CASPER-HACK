# Antigravity Migration Guide — DeRisk Vault UI

Goal: replace the existing frontend with the design in this Lovable project
**without touching smart contracts, RPC clients, transaction builders, signer
plumbing, or any backend service**. This is a pure presentation-layer swap.

---

## 1. What you must NOT touch

Treat these as read-only. Do not let the agent refactor them:

- `contracts/`, `wasm/`, anything that compiles to `.wasm`
- Casper SDK call sites (`casper-js-sdk`, `CLPublicKey`, `DeployUtil`, etc.)
- Transaction builders, signers, key management
- Backend services (AI Sentinel daemon, indexer, API endpoints)
- Environment variables, RPC URLs, contract hashes (read them, don't mutate)
- Any `*.server.ts`, `services/`, `lib/casper/`, or `api/` modules

Add this to your Antigravity prompt verbatim:

> Scope is strictly the frontend presentation layer (routes, components,
> styles). Do not modify, rename, or refactor any contract code, Casper SDK
> calls, transaction builders, signer logic, backend services, or environment
> configuration. If a UI change appears to require touching those, stop and
> ask first.

---

## 2. Files to copy from this Lovable project

Copy these directly into your Antigravity project, same paths:

```
src/styles.css
src/routes/index.tsx                       (landing page)
src/routes/app.tsx                         (dashboard route)
src/components/dashboard/Dashboard.tsx
src/components/dashboard/Header.tsx
src/components/dashboard/StatusCards.tsx
src/components/dashboard/VaultForm.tsx     (withdraw shows "under development")
src/components/dashboard/SentinelFeed.tsx
design.md                                   (reference, optional)
```

Also ensure these are present in `src/routes/__root.tsx` head links:

```ts
{ rel: "preconnect", href: "https://fonts.googleapis.com" },
{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" },
```

---

## 3. Wiring the UI to your real data

The components in this repo use mock state (`useState`, hardcoded values) so
they render standalone. In Antigravity, replace each mock with a **read** from
your existing hooks/stores. Do not change the signatures of the hooks — only
consume them.

| Component / value                          | Replace with                                           |
| ------------------------------------------ | ------------------------------------------------------ |
| `Dashboard.tsx` → `halted`, `premium`      | your existing protocol-state hook (e.g. `useVaultState()`) |
| `Header.tsx` → `connected`, `pubkey`       | your wallet adapter (Casper Signer / Torus / etc.)     |
| `Header.tsx` → `Sync Node` button          | call your existing `refetch()` / `invalidateQueries()` |
| `StatusCards.tsx` → `CONTRACT_HASH`        | `import.meta.env.VITE_CONTRACT_HASH` or your constant  |
| `StatusCards.tsx` → TVL, Util              | your existing metrics query                            |
| `VaultForm.tsx` → `balance`                | your existing balance hook                             |
| `VaultForm.tsx` → `submit()` (deposit)     | call your existing `depositCSPR(amount)` function      |
| `VaultForm.tsx` → withdraw branch          | **leave as-is** (under development placeholder)        |
| `SentinelFeed.tsx` → `FEED` constant       | your existing audit-trail query result                 |

### Withdraw rule

`VaultForm.tsx` renders an "Under development" panel whenever `mode === "withdraw"`.
Do NOT wire any contract call into that branch. Keep the deposit branch wired
to your real `deposit` function only.

### Type-safety bridge

If your protocol-state hook returns different field names, add a thin adapter
in `src/components/dashboard/Dashboard.tsx` — do not rename fields in your
domain hooks. Example:

```tsx
const state = useVaultState();
const halted = state.isHalted;
const premium = Math.round(state.premiumRateBps / 100);
```

---

## 4. Antigravity prompt to use

Paste this into Antigravity verbatim:

> Replace the frontend of this project with the files I provide from the
> Lovable export. Constraints:
>
> 1. Do not modify any file under `contracts/`, `services/`, `lib/casper/`,
>    `api/`, `*.server.ts`, or any backend / smart-contract code. Do not
>    change env vars or RPC config.
> 2. Drop in `src/styles.css`, `src/routes/index.tsx`, `src/routes/app.tsx`,
>    and `src/components/dashboard/*` exactly as provided. Update
>    `src/routes/__root.tsx` only to add the Inter + JetBrains Mono font
>    `<link>` tags.
> 3. Wire the components to my existing hooks. Map mock state in
>    `Dashboard.tsx`, `Header.tsx`, `StatusCards.tsx`, `VaultForm.tsx`, and
>    `SentinelFeed.tsx` to my real hooks via a thin adapter inside each
>    component — do not rename fields in my domain hooks.
> 4. Leave the withdraw branch in `VaultForm.tsx` exactly as shipped: an
>    "Under development" placeholder. Do not call any contract for withdraw.
> 5. After the swap, the deposit flow, wallet connect, contract-hash display,
>    audit trail, and protocol-status reads must all hit my existing,
>    unmodified backend code paths.
>
> Verify by running the existing tests and the dev server. Report any place
> where you had to add an adapter so I can review.

---

## 5. Post-merge checklist

- [ ] `bun run dev` boots without TS errors
- [ ] Wallet connect still calls the existing adapter (no new wallet code)
- [ ] Deposit submits via the existing on-chain function
- [ ] Withdraw tab shows "Under development" and dispatches no transaction
- [ ] Contract hash on the verification card matches the deployed contract
- [ ] Audit trail entries come from the real indexer, not the FEED constant
- [ ] No diff inside `contracts/`, `services/`, or backend folders
