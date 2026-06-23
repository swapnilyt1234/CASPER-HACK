import { useState, useEffect, useCallback, useRef } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'ingest' | 'eval' | 'x402' | 'action';
  message: string;
  riskScore?: number;
}

export type ConnectionState = 'connected' | 'reconnecting' | 'failed';

export function useAgentLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logs');
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      setLogs(data);
      
      if (retryCount.current > 0) {
        setConnectionState('connected');
        retryCount.current = 0; // reset on success
      }
      
      timeoutRef.current = setTimeout(fetchLogs, 1500);
    } catch (err) {
      handleFailure();
    }
  }, []);

  const handleFailure = useCallback(() => {
    if (retryCount.current < 3) {
      setConnectionState('reconnecting');
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount.current) * 1000;
      retryCount.current += 1;
      timeoutRef.current = setTimeout(fetchLogs, delay);
    } else {
      setConnectionState('failed');
    }
  }, [fetchLogs]);

  useEffect(() => {
    fetchLogs();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchLogs]);

  const forceReconnect = useCallback(() => {
    retryCount.current = 0;
    setConnectionState('reconnecting');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    fetchLogs();
  }, [fetchLogs]);

  return { logs, connectionState, forceReconnect };
}
