"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AgentTerminal Error Boundary caught an error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse" />
           
           <AlertTriangle className="w-16 h-16 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
           <h2 className="text-xl font-bold text-white mb-2 tracking-widest uppercase">Connection Lost</h2>
           <p className="text-gray-400 text-center mb-8 max-w-sm">
             The live telemetry feed has disconnected from the Agent Swarm. Max automated retries exceeded.
           </p>
           
           <button 
             onClick={this.handleRetry}
             className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-95"
           >
             <RefreshCw className="w-5 h-5" />
             Force Reconnect
           </button>
        </div>
      );
    }

    return this.props.children;
  }
}
