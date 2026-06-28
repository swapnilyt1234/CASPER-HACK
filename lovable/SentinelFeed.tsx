import { AlertOctagon, Cpu, ExternalLink, Settings2, ShieldAlert, XCircle, CheckCircle2 } from "lucide-react";

type Entry = {
  ts: string;
  type: "freeze" | "premium" | "optimize";
  title: string;
  status: "Success" | "Failed";
  newRate: number;
  halt: boolean;
  hash: string;
};

const FEED: Entry[] = [
  { ts: "2026-06-27 09:14:22 UTC", type: "freeze", title: "Emergency Liquidity Protocol Freeze", status: "Success", newRate: 15, halt: true,  hash: "0x9f4ac8d27e1b3a5c64f0d8e2a91b7c3e5d8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b" },
  { ts: "2026-06-27 08:47:05 UTC", type: "premium", title: "Pre-emptive Volatility Adjustment",   status: "Success", newRate: 12, halt: false, hash: "0xa12b4cd57e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b" },
  { ts: "2026-06-26 22:11:48 UTC", type: "optimize", title: "System Param Optimization",          status: "Success", newRate: 7,  halt: false, hash: "0xb23c5de68f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c" },
  { ts: "2026-06-26 14:03:17 UTC", type: "freeze", title: "Emergency Liquidity Protocol Freeze",  status: "Failed",  newRate: 15, halt: true,  hash: "0xc34d6ef79a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d" },
  { ts: "2026-06-26 06:28:54 UTC", type: "premium", title: "Pre-emptive Volatility Adjustment",   status: "Success", newRate: 9,  halt: false, hash: "0xd45e7fa8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8" },
  { ts: "2026-06-25 19:52:09 UTC", type: "optimize", title: "System Param Optimization",          status: "Success", newRate: 5,  halt: false, hash: "0xe56f8ab9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9" },
];

function TypeIcon({ type }: { type: Entry["type"] }) {
  const cfg = {
    freeze:   { Icon: ShieldAlert,  color: "text-emergency", bg: "bg-[color-mix(in_oklab,var(--emergency)_12%,var(--card))] border-emergency/30" },
    premium:  { Icon: AlertOctagon, color: "text-warning",   bg: "bg-[color-mix(in_oklab,var(--warning)_15%,var(--card))] border-warning/30" },
    optimize: { Icon: Settings2,    color: "text-primary",   bg: "bg-accent border-primary/20" },
  }[type];
  const { Icon, color, bg } = cfg;
  return (
    <div className={`h-9 w-9 rounded-lg border ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`h-4 w-4 ${color}`} />
    </div>
  );
}

export function SentinelFeed() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Cpu className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">AI Sentinel audit trail</h2>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Cryptographically verified actions dispatched by the off-chain agent.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-mono uppercase tracking-wider text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
          Streaming
        </span>
      </div>

      <ol>
        {FEED.map((e) => (
          <li key={e.hash} className="px-6 py-5 border-b border-border last:border-b-0 hover:bg-surface transition-colors">
            <div className="flex gap-4">
              <TypeIcon type={e.type} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-medium">{e.title}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] text-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      e.status === "Success"
                        ? "bg-[color-mix(in_oklab,var(--success)_10%,var(--card))] text-success border-success/30"
                        : "bg-[color-mix(in_oklab,var(--destructive)_10%,var(--card))] text-destructive border-destructive/30"
                    }`}
                  >
                    {e.status === "Success" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {e.status}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-mono text-ink-muted">{e.ts}</div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Stat k="Premium Rate" v={`${e.newRate}%`} />
                  <Stat k="Halt Flag" v={e.halt ? "true" : "false"} tone={e.halt ? "danger" : "ok"} />
                  <Stat k="Signer" v="ai-sentinel-01" />
                </div>

                <a
                  href={`https://cspr.live/deploy/${e.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-start gap-1.5 text-[11px] text-mono text-primary hover:underline break-all"
                >
                  <span className="text-ink-muted">Deploy Hash:</span>
                  <span>{e.hash}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" />
                </a>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: "ok" | "danger" }) {
  const color = tone === "danger" ? "text-emergency" : tone === "ok" ? "text-success" : "";
  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-ink-muted text-mono">{k}</div>
      <div className={`text-sm text-mono mt-0.5 ${color}`}>{v}</div>
    </div>
  );
}
