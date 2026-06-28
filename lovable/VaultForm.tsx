import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, ExternalLink, Loader2, X, CheckCircle2, AlertTriangle, Construction } from "lucide-react";

type Mode = "deposit" | "withdraw";


export function VaultForm({ halted }: { halted: boolean }) {
  const [mode, setMode] = useState<Mode>("deposit");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ hash: string; amount: string; mode: Mode } | null>(null);

  const balance = 14250.421;
  const numericAmount = parseFloat(amount) || 0;
  const disabled = halted || processing || numericAmount <= 0 || numericAmount > balance;

  const submit = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setReceipt({
        hash:
          "0x" +
          Array.from({ length: 64 }, () =>
            "0123456789abcdef"[Math.floor(Math.random() * 16)]
          ).join(""),
        amount: numericAmount.toString(),
        mode,
      });
      setAmount("");
    }, 2200);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">Vault operations</h2>
        <p className="text-[13px] text-ink-muted mt-1">Provide or redeem CSPR liquidity.</p>
      </div>

      <div className="grid grid-cols-2 p-1 rounded-full bg-surface-muted border border-border">
        {(["deposit", "withdraw"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center justify-center gap-1.5 h-9 rounded-full text-sm font-medium transition-all ${
              mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-ink-muted hover:text-foreground"
            }`}
          >
            {m === "deposit" ? <ArrowDownToLine className="h-3.5 w-3.5" /> : <ArrowUpFromLine className="h-3.5 w-3.5" />}
            {m === "deposit" ? "Deposit" : "Withdraw"}
          </button>
        ))}
      </div>

      {mode === "withdraw" ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface-muted p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-accent flex items-center justify-center">
            <Construction className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="mt-4 text-sm font-semibold tracking-tight">Withdrawals under development</div>
          <p className="mt-2 text-[13px] text-ink-muted max-w-xs mx-auto leading-relaxed">
            We're finalizing the redemption flow and on-chain settlement path.
            This action will be enabled in an upcoming release.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-mono uppercase tracking-wider text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Coming soon
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-ink-muted text-mono uppercase tracking-wider">Amount</label>
              <span className="text-xs text-ink-muted text-mono tabular-nums">
                Balance: {balance.toLocaleString(undefined, { maximumFractionDigits: 3 })} CSPR
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={halted || processing}
                className="w-full h-14 pl-4 pr-28 rounded-xl bg-surface-muted border border-border text-2xl text-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  onClick={() => setAmount(balance.toString())}
                  disabled={halted || processing}
                  className="px-2 py-1 text-[10px] text-mono uppercase tracking-wider rounded-md bg-accent text-accent-foreground hover:opacity-80 transition disabled:opacity-50"
                >
                  Max
                </button>
                <span className="px-2 text-mono text-sm text-ink-muted">CSPR</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-mono">
            {[
              ["Est. APR", "5.00%"],
              ["Network Fee", "~0.1 CSPR"],
              ["Lock", "None"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-surface px-3 py-2">
                <div className="text-[9px] uppercase tracking-wider text-ink-muted">{k}</div>
                <div className="text-xs font-medium mt-0.5">{v}</div>
              </div>
            ))}
          </div>

          {halted && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emergency/30 bg-[color-mix(in_oklab,var(--emergency)_8%,var(--card))] p-3">
              <AlertTriangle className="h-4 w-4 text-emergency shrink-0 mt-0.5" />
              <div className="text-[13px]">
                <span className="font-medium text-emergency">Protocol halted by AI Sentinel.</span>{" "}
                <span className="text-ink-muted">New deposits are disabled until conditions normalize.</span>
              </div>
            </div>
          )}

          <Button
            onClick={submit}
            disabled={disabled}
            className="mt-5 w-full h-12 rounded-full text-[15px] font-semibold"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Transaction…
              </>
            ) : halted ? (
              "Halted by Sentinel"
            ) : (
              "Deposit CSPR"
            )}
          </Button>
        </>
      )}


      {receipt && (
        <div className="mt-4 rounded-xl border border-success/30 bg-[color-mix(in_oklab,var(--success)_8%,var(--card))] p-4 relative animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => setReceipt(null)}
            className="absolute right-2 top-2 text-ink-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {receipt.mode === "deposit" ? "Deposit" : "Withdrawal"} confirmed
              </div>
              <div className="text-xs text-ink-muted mt-0.5 text-mono">
                {receipt.amount} CSPR · finalized on-chain
              </div>
              <a
                href={`https://cspr.live/deploy/${receipt.hash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline text-mono break-all"
              >
                {receipt.hash.slice(0, 18)}…{receipt.hash.slice(-10)}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
