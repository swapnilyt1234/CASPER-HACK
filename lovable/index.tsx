import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Cpu, LineChart, Lock, ArrowUpRight, CheckCircle2, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeRisk Vault — Autonomous AI Liquidity on Casper" },
      { name: "description", content: "A non-custodial liquidity vault on Casper governed by an off-chain AI Sentinel that auto-adjusts premiums and halts the protocol on market anomalies." },
      { property: "og:title", content: "DeRisk Vault — Autonomous AI Liquidity on Casper" },
      { property: "og:description", content: "A non-custodial liquidity vault on Casper governed by an off-chain AI Sentinel that auto-adjusts premiums and halts the protocol on market anomalies." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />
      <Hero />
      <Marquee />
      <Pillars />
      <HowItWorks />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}

function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--hero-border)] bg-[color:var(--hero-bg)]/80 backdrop-blur-xl text-[color:var(--hero-fg)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">DeRisk Vault</span>
        </div>
        <nav className="hidden md:flex items-center gap-7 ml-10 text-sm text-[color:var(--hero-muted)]">
          <a href="#protocol" className="hover:text-[color:var(--hero-fg)] transition">Protocol</a>
          <a href="#how" className="hover:text-[color:var(--hero-fg)] transition">How it works</a>
          <a href="#stats" className="hover:text-[color:var(--hero-fg)] transition">Metrics</a>
          <a href="#" className="hover:text-[color:var(--hero-fg)] transition">Docs</a>
        </nav>
        <div className="flex-1" />
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          Launch App
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-surface relative overflow-hidden">
      <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--hero-border)] bg-white/5 backdrop-blur px-3 py-1 text-xs text-[color:var(--hero-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
            <span className="text-mono uppercase tracking-wider">Live on Casper Testnet</span>
          </div>
          <h1 className="text-display mt-6 text-4xl sm:text-5xl lg:text-7xl text-[color:var(--hero-fg)]">
            Liquidity that defends itself.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[color:var(--hero-muted)] max-w-2xl leading-relaxed">
            DeRisk Vault is a non-custodial liquidity protocol on Casper governed
            by an autonomous AI Sentinel. It watches the market 24/7 and adjusts
            premiums — or halts the vault — the moment risk shifts.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:opacity-90 transition"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-[color:var(--hero-border)] text-[color:var(--hero-fg)] text-[15px] font-medium hover:bg-white/5 transition"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl">
            {[
              ["$2.4M", "Total value locked"],
              ["5–15%", "Dynamic premium"],
              ["24/7", "Sentinel uptime"],
              ["1.2s", "Halt response"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-2xl sm:text-3xl text-mono tabular-nums text-[color:var(--hero-fg)] font-medium">{v}</dt>
                <dd className="mt-1 text-xs text-[color:var(--hero-muted)] uppercase tracking-wider">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Floating product preview */}
        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="hidden lg:block absolute right-8 xl:right-16 top-24 w-[360px] xl:w-[420px]">
      <div className="rounded-2xl border border-[color:var(--hero-border)] bg-white/[0.04] backdrop-blur-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[color:var(--hero-muted)] text-mono uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5 text-primary" />
            Sentinel feed
          </div>
          <span className="text-[10px] text-mono text-[color:var(--hero-muted)]">LIVE</span>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { t: "09:14:22", e: "Emergency Halt", c: "text-emergency", v: "halt=true · rate=15%" },
            { t: "08:47:05", e: "Volatility Adjustment", c: "text-warning", v: "rate=12%" },
            { t: "06:28:54", e: "Param Optimization", c: "text-primary", v: "rate=5%" },
          ].map((r) => (
            <div key={r.t} className="flex items-start gap-3 rounded-lg border border-[color:var(--hero-border)] bg-white/[0.03] p-3">
              <div className={`h-1.5 w-1.5 rounded-full mt-1.5 ${r.c.replace("text-", "bg-")}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[color:var(--hero-fg)] font-medium truncate">{r.e}</span>
                  <span className="text-[10px] text-mono text-[color:var(--hero-muted)]">{r.t}</span>
                </div>
                <div className="text-[11px] text-mono text-[color:var(--hero-muted)] mt-0.5">{r.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const items = ["NON-CUSTODIAL", "ON-CHAIN AUDIT TRAIL", "AI-GOVERNED", "FORMALLY VERIFIED", "OPEN SOURCE", "CASPER NATIVE"];
  return (
    <div className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        {items.map((i) => (
          <span key={i} className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-primary" /> {i}
          </span>
        ))}
      </div>
    </div>
  );
}

function Pillars() {
  const items = [
    {
      Icon: Cpu,
      title: "Autonomous AI Sentinel",
      body: "An off-chain agent monitors volatility, liquidations, and oracle anomalies in real time — then dispatches signed on-chain transactions to adjust protocol state.",
    },
    {
      Icon: Lock,
      title: "Non-custodial by design",
      body: "Funds stay in a Casper smart contract whose hash you can verify on the dashboard. There is no admin key that can move user liquidity.",
    },
    {
      Icon: LineChart,
      title: "Dynamic premium curve",
      body: "Yield to liquidity providers expands and contracts with measured market risk — calmly compounding in flat markets, paying more when volatility rises.",
    },
    {
      Icon: ShieldCheck,
      title: "Emergency circuit breaker",
      body: "When confidence drops below threshold, the Sentinel freezes new deposits and withdrawals to protect existing LPs until conditions stabilize.",
    },
  ];
  return (
    <section id="protocol" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <SectionEyebrow>The protocol</SectionEyebrow>
      <h2 className="text-display mt-3 text-3xl sm:text-4xl lg:text-5xl max-w-3xl">
        Built for capital that can't afford to be asleep.
      </h2>
      <p className="mt-5 text-lg text-ink-muted max-w-2xl">
        DeRisk Vault combines on-chain settlement with off-chain intelligence
        so liquidity providers stay protected without ever giving up custody.
      </p>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
        {items.map(({ Icon, title, body }) => (
          <div key={title} className="bg-card p-8 lg:p-10">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <Icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Provide CSPR liquidity",
      body: "Deposit CSPR into the non-custodial vault. Receive a continuous yield from the protocol's dynamic premium curve.",
    },
    {
      n: "02",
      title: "The Sentinel monitors",
      body: "An off-chain AI agent streams market signals — volatility, oracle dispersion, liquidation pressure — and computes a risk score every block.",
    },
    {
      n: "03",
      title: "Parameters adjust on-chain",
      body: "When risk shifts, the agent dispatches a signed transaction to update the premium rate or engage the emergency halt. Every action is cryptographically auditable.",
    },
    {
      n: "04",
      title: "Withdraw anytime conditions allow",
      body: "While the protocol is operational, redeem your position back to CSPR with no lock-up. During emergency halts, funds remain safe but entry is paused.",
    },
  ];
  return (
    <section id="how" className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <SectionEyebrow>How it works</SectionEyebrow>
        <h2 className="text-display mt-3 text-3xl sm:text-4xl lg:text-5xl max-w-3xl">
          A vault that adapts to the market in real time.
        </h2>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-mono text-xs text-primary tracking-wider">{s.n}</div>
              <div className="mt-3 h-px w-12 bg-primary" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[15px] text-ink-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    ["$2,418,902", "Total value locked", "+12.4% / 30d"],
    ["5.00%", "Current premium APR", "Baseline curve"],
    ["1,284", "Sentinel actions", "All-time on-chain"],
    ["99.98%", "Sentinel uptime", "Last 90 days"],
  ];
  return (
    <section id="stats" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <SectionEyebrow>Protocol metrics</SectionEyebrow>
          <h2 className="text-display mt-3 text-3xl sm:text-4xl lg:text-5xl max-w-2xl">
            Transparent. On-chain. Always on.
          </h2>
        </div>
        <Link to="/app" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          View live dashboard
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
        {stats.map(([v, l, sub]) => (
          <div key={l} className="bg-card p-8">
            <div className="text-xs uppercase tracking-wider text-ink-muted">{l}</div>
            <div className="mt-3 text-3xl sm:text-4xl text-mono tabular-nums font-medium tracking-tight">{v}</div>
            <div className="mt-2 text-xs text-mono text-ink-muted">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
      <div className="hero-surface relative overflow-hidden rounded-3xl border border-[color:var(--hero-border)] px-8 py-14 sm:px-14 sm:py-20">
        <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
        <div className="relative max-w-2xl">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-display mt-4 text-3xl sm:text-4xl lg:text-5xl text-[color:var(--hero-fg)]">
            Open the dashboard and meet the Sentinel.
          </h2>
          <p className="mt-5 text-lg text-[color:var(--hero-muted)]">
            Inspect the live premium rate, verify the contract hash, and review
            every action the AI has ever taken on-chain.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:opacity-90 transition"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-[color:var(--hero-border)] text-[color:var(--hero-fg)] text-[15px] font-medium hover:bg-white/5 transition"
            >
              Read the whitepaper
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">DeRisk Vault</div>
            <div className="text-[11px] text-ink-muted text-mono uppercase tracking-wider">
              Autonomous Liquidity · Casper
            </div>
          </div>
        </div>
        <div className="text-xs text-ink-muted text-mono">
          © 2026 DeRisk Labs · Open source · Audited
        </div>
      </div>
    </footer>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-mono uppercase tracking-[0.16em] text-primary">
      <span className="h-px w-6 bg-primary" />
      {children}
    </div>
  );
}
