'use client';

import { AlertOctagon, CheckCircle2, FileCheck2, Flame, TrendingUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const CONTRACT_HASH =
  'hash-364fe8def07e59e7fb7d5266fa94a74b0a7e5fde6c1c40b0f6d81d265b58d658';

function Card({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'emergency';
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-card p-6 transition-colors ${
        tone === 'emergency'
          ? 'border-emergency/40 bg-[color-mix(in_oklab,var(--emergency)_5%,var(--card))]'
          : 'border-border'
      }`}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted text-mono font-medium">
      {children}
    </div>
  );
}

export function StatusCards({
  halted,
  premium,
}: {
  halted: boolean;
  premium: number;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(CONTRACT_HASH);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const elevated = premium >= 10;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Premium rate */}
      <Card>
        <div className="flex items-start justify-between">
          <Label>Premium Rate</Label>
          <div
            className={`flex items-center gap-1 text-xs text-mono ${
              elevated ? 'text-warning' : 'text-success'
            }`}
          >
            {elevated ? (
              <Flame className="h-3.5 w-3.5" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" />
            )}
            {elevated ? 'ELEVATED' : 'BASELINE'}
          </div>
        </div>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tracking-tight text-mono tabular-nums">
            {premium}
          </span>
          <span className="text-2xl text-ink-muted font-medium">%</span>
          <span className="ml-1 text-xs text-ink-muted">APR</span>
        </div>
        <div className="mt-5 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${Math.min(100, (premium / 20) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-[13px] text-ink-muted leading-relaxed">
          {elevated
            ? 'AI raised yield to compensate for elevated market volatility.'
            : 'Operating at the baseline yield curve.'}
        </p>
      </Card>

      {/* Underwriting */}
      <Card tone={halted ? 'emergency' : 'default'}>
        <div className="flex items-start justify-between">
          <Label>Underwriting Status</Label>
          <div
            className={`flex items-center gap-1 text-xs text-mono ${
              halted ? 'text-emergency' : 'text-success'
            }`}
          >
            {halted ? (
              <AlertOctagon className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {halted ? 'HALTED' : 'OPERATIONAL'}
          </div>
        </div>

        {halted ? (
          <>
            <div className="mt-6 text-xl font-semibold tracking-tight text-emergency">
              Protocol entry frozen
            </div>
            <p className="mt-2 text-[14px] text-foreground/80 leading-relaxed">
              AI Sentinel detected a market anomaly. Deposits and withdrawals are
              temporarily disabled to protect liquidity providers.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[10px] text-mono uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emergency pulse-dot" />
              <span className="text-emergency">Emergency policy engaged</span>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 text-xl font-semibold tracking-tight">
              Liquidity active
            </div>
            <p className="mt-2 text-[14px] text-ink-muted leading-relaxed">
              All underwriting endpoints are live. New positions accepted at the
              prevailing premium.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-mono">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                  TVL
                </div>
                <div className="text-sm font-medium tabular-nums">
                  2,418,902 CSPR
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                  Util.
                </div>
                <div className="text-sm font-medium tabular-nums">61.4%</div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Contract verification */}
      <Card>
        <div className="flex items-start justify-between">
          <Label>Contract Verification</Label>
          <div className="flex items-center gap-1 text-xs text-mono text-primary">
            <FileCheck2 className="h-3.5 w-3.5" />
            VERIFIED
          </div>
        </div>
        <div className="mt-6 text-[13px] text-ink-muted">
          Immutable contract hash
        </div>
        <button
          onClick={copy}
          className="mt-2 group w-full text-left flex items-start gap-2 rounded-lg border border-border bg-surface p-3 hover:border-primary/50 transition-colors"
        >
          <span className="flex-1 break-all text-mono text-[11px] leading-relaxed text-foreground/90">
            {CONTRACT_HASH}
          </span>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-ink-muted group-hover:text-primary shrink-0 mt-0.5" />
          )}
        </button>
        <p className="mt-3 text-[13px] text-ink-muted">
          Deployed on Casper · Source matches on-chain bytecode.
        </p>
      </Card>
    </div>
  );
}
