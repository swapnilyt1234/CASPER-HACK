"use client";

import React, { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Lock } from 'lucide-react';
import { LogEntry, ConnectionState } from '@/hooks/useAgentLogs';

interface Props {
  logs: LogEntry[];
  connectionState: ConnectionState;
}

const LogRow = memo(({ log }: { log: LogEntry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 group"
    >
      <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
      
      <div className="flex-grow flex flex-col">
        <span className={`
          ${log.type === 'ingest' ? 'text-blue-400' : ''}
          ${log.type === 'eval' ? 'text-purple-400' : ''}
          ${log.type === 'x402' ? 'text-yellow-400' : ''}
          ${log.type === 'action' ? 'text-green-400' : ''}
        `}>
          {log.message}
        </span>
        
        {log.riskScore !== undefined && log.riskScore !== null && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <Activity className={`w-4 h-4 ${log.riskScore > 80 ? 'text-red-500' : 'text-neon-green'}`} />
            <span className="text-gray-400">Risk Score Output:</span>
            <span className={`font-bold ${log.riskScore > 80 ? 'text-red-500' : 'text-neon-green'}`}>
              {log.riskScore}/100
            </span>
            {log.riskScore > 80 && (
              <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/50 ml-2">
                ALERT: Potential Drain
              </span>
            )}
          </div>
        )}
        
        {log.type === 'x402' && (
          <div className="mt-2 pl-4 border-l border-yellow-500/30 text-yellow-500/70 text-xs flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Header injected. Retrying validation API.
          </div>
        )}
      </div>
    </motion.div>
  );
});
LogRow.displayName = 'LogRow';

export default function AgentTerminal({ logs, connectionState }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trigger the ErrorBoundary if we have failed
  if (connectionState === 'failed') {
    throw new Error("Backend connection failed after maximum retries.");
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-[#333] shadow-2xl overflow-hidden relative transition-all duration-500 ${connectionState === 'reconnecting' ? 'opacity-50 blur-[2px] grayscale-[50%]' : 'opacity-100'}`}>
      
      {connectionState === 'reconnecting' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
           <div className="bg-black/80 px-6 py-3 rounded-full text-white font-bold flex items-center gap-3 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
             <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
             Reconnecting to Agent Swarm...
           </div>
        </div>
      )}

      {/* Terminal Header */}
      <div className="bg-[#111] px-4 py-3 border-b border-[#333] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-gray-400" />
          <span className="text-gray-300 font-mono text-sm">derisk-agent // live_feed</span>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500" />
          <div className={`w-3 h-3 rounded-full border ${connectionState === 'reconnecting' ? 'bg-yellow-500/50 border-yellow-500' : 'bg-neon-green/50 border-neon-green animate-pulse'}`} />
        </div>
      </div>

      {/* Log Feed */}
      <div 
        ref={scrollRef}
        className="flex-grow p-6 overflow-y-auto font-mono text-sm space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Scanline overlay for aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
    </div>
  );
}
