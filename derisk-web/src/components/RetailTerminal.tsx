"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LogEntry } from '@/hooks/useAgentLogs';
import PremiumChart from '@/components/PremiumChart';

interface Props {
  logs: LogEntry[];
}

export default function RetailTerminal({ logs }: Props) {
  const [amount, setAmount] = useState('1000');
  const [status, setStatus] = useState<'idle' | 'signing' | 'success'>('idle');

  // Extract premium history from logs
  const premiumHistory = useMemo(() => {
    const history: number[] = [];
    logs.forEach(l => {
      if (l.type === 'eval') {
        const match = l.message.match(/Premium set to ([\d.]+)%/);
        if (match) history.push(parseFloat(match[1]));
      }
    });
    return history.length > 0 ? history : [5.0];
  }, [logs]);

  const premiumRate = premiumHistory[premiumHistory.length - 1];

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('signing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  const cost = (parseFloat(amount || '0') * (premiumRate / 100)).toFixed(2);

  return (
    <div className="flex flex-col h-full p-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-blue/10 to-transparent pointer-events-none rounded-2xl" />

      <div className="z-10 flex flex-col h-full">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-neon-blue" />
              DeRisk Retail
            </h1>
            <p className="text-gray-400 mt-2">Decentralized Smart Contract Coverage</p>
          </div>
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-neon-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
            <span className="text-sm font-mono text-neon-blue">Mainnet Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-neon-blue/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Current Premium Rate</h3>
              <div className="text-5xl font-bold text-white flex items-baseline gap-2 transition-all">
                {premiumRate}% <span className="text-lg text-neon-blue font-normal">CSPR</span>
              </div>
            </div>
            
            <div className="mt-6">
               <PremiumChart data={premiumHistory} width={250} height={40} />
            </div>

            <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-24 h-24" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl"
          >
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Coverage Pool</h3>
            <div className="text-3xl font-bold text-white mb-1">2,450,000 CSPR</div>
            <p className="text-sm text-green-400">Stable & Fully Collateralized</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-grow glass-panel rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-xl font-semibold mb-6">Purchase Coverage</h2>
          
          <form onSubmit={handleBuy} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Coverage Amount (CSPR)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-xl text-white outline-none focus:border-neon-blue transition-colors"
                  placeholder="1000"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">
                  CSPR
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-4 flex justify-between items-center bg-black/30">
              <span className="text-gray-400">Estimated Cost</span>
              <span className="text-xl font-bold text-white">{cost} CSPR</span>
            </div>

            <button 
              disabled={status !== 'idle'}
              type="submit"
              className="w-full bg-neon-blue hover:bg-neon-blue/80 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'idle' && (
                <>Sign Transaction <ArrowRight className="w-5 h-5" /></>
              )}
              {status === 'signing' && (
                <span className="animate-pulse">Awaiting Casper Wallet...</span>
              )}
              {status === 'success' && (
                <>Coverage Active <CheckCircle2 className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
