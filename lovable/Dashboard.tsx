import { Header } from "./Header";
import { StatusCards } from "./StatusCards";
import { VaultForm } from "./VaultForm";
import { SentinelFeed } from "./SentinelFeed";
import { useEffect, useState } from "react";

export function Dashboard() {
  const [halted, setHalted] = useState(false);
  const [premium, setPremium] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setHalted((h) => !h);
      setPremium((p) => (p === 5 ? 15 : 5));
    }, 22000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-mono uppercase tracking-[0.16em] text-primary">
                <span className="h-px w-6 bg-primary" /> Protocol status
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                Live parameters
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-mono text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
              SENTINEL ONLINE
            </div>
          </div>
          <StatusCards halted={halted} premium={premium} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <VaultForm halted={halted} />
          </div>
          <div className="lg:col-span-3">
            <SentinelFeed />
          </div>
        </section>

        <footer className="pt-6 pb-10 text-center text-xs text-ink-muted text-mono">
          DERISK VAULT · CASPER TESTNET · v0.4.1
        </footer>
      </main>
    </div>
  );
}
