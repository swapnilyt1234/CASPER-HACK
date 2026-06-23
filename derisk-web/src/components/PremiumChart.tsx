"use client";

import React, { useMemo } from 'react';

interface PremiumChartProps {
  data: number[]; // Array of premium values (e.g., [5.0, 5.0, 20.0])
  width?: number;
  height?: number;
}

const PremiumChart = React.memo(({ data, width = 300, height = 60 }: PremiumChartProps) => {
  const pathData = useMemo(() => {
    if (!data || data.length === 0) return '';
    
    // Default to at least 2 points to draw a line
    const safeData = data.length === 1 ? [data[0], data[0]] : data;
    const maxVal = Math.max(...safeData, 30); // Max possible premium is 30%
    const minVal = 0; // min premium 0 to keep scale grounded

    const rangeY = maxVal - minVal;
    const dx = width / (safeData.length - 1);
    
    const points = safeData.map((val, i) => {
      const x = i * dx;
      const normalizedY = (val - minVal) / rangeY;
      const y = height - (normalizedY * height);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, width, height]);

  // If no data, just show an empty box
  if (!data || data.length === 0) {
    return (
      <div style={{ width, height }} className="bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-xs text-gray-500">
        Awaiting telemetry...
      </div>
    );
  }

  const isHighRisk = data[data.length - 1] > 10;

  return (
    <div className="relative" style={{ width, height }}>
      {/* Background grid lines for aesthetic */}
      <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
        <div className="border-t border-white w-full h-[1px]" />
        <div className="border-t border-white w-full h-[1px]" />
        <div className="border-t border-white w-full h-[1px]" />
      </div>

      <svg width={width} height={height} className="overflow-visible drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#39ff14" stopOpacity="0.5" />
            <stop offset="100%" stopColor={isHighRisk ? "#ef4444" : "#39ff14"} />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 ease-out"
        />
        {/* Pulsing dot at the end */}
        {pathData && (
          <circle
            cx={width}
            cy={
              height - (((data[data.length - 1] - 0) / (Math.max(...data, 30))) * height)
            }
            r="4"
            fill={isHighRisk ? "#ef4444" : "#39ff14"}
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
});

PremiumChart.displayName = "PremiumChart";
export default PremiumChart;
