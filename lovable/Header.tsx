import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, ShieldCheck } from "lucide-react";

const REFRESH_SECONDS = 10;

export function Header() {
  const [seconds, setSeconds] = useState(REFRESH_SECONDS);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => (s <= 1 ? REFRESH_SECONDS : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const sync = () => {
    setSyncing(true);
    setSeconds(REFRESH_SECONDS);
    setTimeout(() => setSyncing(false), 900);
  };

  const pubkey = "0202a5e8c4f1d3a9b6e7d8c4f1a9b6e7d8c4f1a9b6e7d8c4f1a9b6e7d8c4f1a9b6e7";
  const truncated = `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">DeRisk Vault</span>
        </Link>

        <span className="hidden md:inline-flex items-center gap-1.5 ml-3 pl-4 border-l border-border text-xs text-mono text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
          CASPER TESTNET
        </span>

        <div className="flex-1" />

        <div className="hidden sm:flex items-center gap-2 text-xs text-mono text-ink-muted">
          <span>Auto-refresh <span className="text-foreground">{seconds}s</span></span>
          <Button
            variant="outline"
            size="sm"
            onClick={sync}
            disabled={syncing}
            className="h-8 gap-1.5 rounded-full"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync Node
          </Button>
        </div>

        {connected ? (
          <button
            onClick={() => setConnected(false)}
            className="flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-surface hover:bg-accent transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-mono text-xs">{truncated}</span>
          </button>
        ) : (
          <Button onClick={() => setConnected(true)} size="sm" className="h-9 gap-2 rounded-full px-4 font-medium">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
