"use client";

import RetailTerminal from '@/components/RetailTerminal';
import AgentTerminal from '@/components/AgentTerminal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAgentLogs } from '@/hooks/useAgentLogs';

export default function Home() {
  const { logs, connectionState, forceReconnect } = useAgentLogs();

  return (
    <main className="min-h-screen bg-[#030303] text-white p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side: Retail UI */}
          <section className="h-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.05)] border border-white/5 bg-black/40">
            <RetailTerminal logs={logs} />
          </section>

          {/* Right Side: Agent Terminal */}
          <section className="h-full flex flex-col pt-8 lg:pt-0 relative">
            <h2 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 ml-2 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              Live Agent Telemetry
            </h2>
            <div className="flex-grow rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] h-full overflow-hidden relative">
              <ErrorBoundary onRetry={forceReconnect}>
                 <AgentTerminal logs={logs} connectionState={connectionState} />
              </ErrorBoundary>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
