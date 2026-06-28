'use client';

import Link from 'next/link';
import { RefreshCw, Wallet, ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  seconds: number;
  syncing: boolean;
  connected: boolean;
  pubkey: string | null;
  isWalletInstalled: boolean;
  onSync: () => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export function Header({
  seconds,
  syncing,
  connected,
  pubkey,
  isWalletInstalled,
  onSync,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  const truncated = pubkey
    ? `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            DeRisk Vault
          </span>
        </Link>

        <span className="hidden md:inline-flex items-center gap-1.5 ml-3 pl-4 border-l border-border text-xs text-mono text-ink-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
          CASPER TESTNET
        </span>

        <div className="flex-1" />

        <div className="hidden sm:flex items-center gap-2 text-xs text-mono text-ink-muted">
          <span>
            Auto-refresh{' '}
            <span className="text-foreground">{seconds}s</span>
          </span>
          <button
            onClick={onSync}
            disabled={syncing}
            className="h-8 px-3 gap-1.5 rounded-full border border-border bg-background hover:bg-surface transition-colors text-foreground text-xs flex items-center disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`}
            />
            Sync Node
          </button>
        </div>

        {connected && pubkey ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-surface cursor-default">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-mono text-xs">{truncated}</span>
            </div>
            <button
              onClick={onDisconnect}
              title="Disconnect"
              className="flex items-center justify-center h-9 w-9 rounded-full border border-border bg-surface text-ink-muted hover:text-destructive hover:border-destructive/30 hover:bg-[color-mix(in_oklab,var(--destructive)_8%,transparent)] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition"
          >
            <Wallet className="h-4 w-4" />
            {!isWalletInstalled ? 'Install Casper Wallet' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
