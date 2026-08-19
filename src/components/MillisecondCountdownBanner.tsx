import React, { useState, useEffect, useRef } from 'react';
import { Clock, Zap, Play, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { ScheduledOrder } from '../types';

interface MillisecondCountdownBannerProps {
  pendingOrders: ScheduledOrder[];
  onExecuteNow: (id: string) => Promise<void>;
  onCancelOrder: (id: string) => Promise<void>;
  serverOffsetMs?: number;
}

export const MillisecondCountdownBanner: React.FC<MillisecondCountdownBannerProps> = ({
  pendingOrders,
  onExecuteNow,
  onCancelOrder,
  serverOffsetMs = 0,
}) => {
  const [nowMs, setNowMs] = useState<number>(Date.now() + serverOffsetMs);
  const requestRef = useRef<number | null>(null);

  // 60 FPS requestAnimationFrame loop for ultra-precise 1ms countdown updates
  useEffect(() => {
    const updateLoop = () => {
      setNowMs(Date.now() + serverOffsetMs);
      requestRef.current = requestAnimationFrame(updateLoop);
    };

    requestRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [serverOffsetMs]);

  if (!pendingOrders || pendingOrders.length === 0) return null;

  // Next imminent order
  const nextOrder = [...pendingOrders].sort((a, b) => a.targetTime - b.targetTime)[0];
  const diffMs = nextOrder.targetTime - nowMs;
  const isImminent = diffMs > 0 && diffMs <= 3000;
  const isExecuting = diffMs <= 0 || nextOrder.status === 'EXECUTING';

  // Format Milliseconds
  const formatTimeParts = (diff: number) => {
    if (diff <= 0) {
      return { hh: '00', mm: '00', ss: '00', mmm: '000', totalSeconds: '0.000', percent: 100 };
    }

    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const ms = Math.floor(diff % 1000);

    const totalSeconds = (diff / 1000).toFixed(3);

    // Initial total duration approximation
    const createdTime = nextOrder.createdAt || nextOrder.targetTime - 60000;
    const totalDuration = Math.max(1000, nextOrder.targetTime - createdTime);
    const elapsed = Math.max(0, nowMs - createdTime);
    const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    return {
      hh: String(hours).padStart(2, '0'),
      mm: String(mins).padStart(2, '0'),
      ss: String(secs).padStart(2, '0'),
      mmm: String(ms).padStart(3, '0'),
      totalSeconds: `${totalSeconds}s`,
      percent,
    };
  };

  const t = formatTimeParts(diffMs);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 font-mono shadow-2xl transition-all ${
        isImminent
          ? 'bg-gradient-to-r from-amber-950/40 via-cyan-950/60 to-emerald-950/40 border-cyan-400 shadow-cyan-500/20 ring-2 ring-cyan-400/50'
          : isExecuting
          ? 'bg-gradient-to-r from-cyan-950 via-blue-900 to-cyan-950 border-cyan-400 animate-pulse'
          : 'bg-[#111827] border-cyan-500/40'
      }`}
    >
      {/* Background Animated Glow Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Side: Target Info */}
        <div className="space-y-2 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center space-x-1 uppercase ${
                isImminent
                  ? 'bg-amber-500 text-black animate-bounce'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>{isImminent ? '⚡ Imminent Execution' : 'Active Countdown Target'}</span>
            </span>

            <span className="text-gray-400 text-xs font-bold">ORD #{nextOrder.id.slice(-6)}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <span className="text-xl font-extrabold text-gray-100">{nextOrder.symbol}</span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                nextOrder.side === 'BUY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {nextOrder.side} {nextOrder.positionSide ? `(${nextOrder.positionSide})` : ''}
            </span>
            <span className="text-sm font-bold text-cyan-400">{nextOrder.quantity} qty</span>
            {nextOrder.leverage && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-amber-400 border border-gray-700">
                {nextOrder.leverage}x
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400 flex items-center justify-center lg:justify-start space-x-2">
            <span>Target: <strong className="text-gray-200">{nextOrder.targetTimeFormatted}</strong></span>
            <span>•</span>
            <span>Accounts: <strong className="text-cyan-400">{nextOrder.accountIds === 'ALL' ? 'ALL ACCOUNTS' : 'CUSTOM'}</strong></span>
          </div>
        </div>

        {/* Center: High-Precision Live 60 FPS Millisecond Counter */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Time Remaining (Millisecond Precision)</span>
          </div>

          {/* Big Millisecond Counter Display */}
          <div className="flex items-baseline space-x-1 font-mono tracking-wider">
            <div className="bg-[#0b0f19] px-3 py-2 rounded-2xl border border-gray-700/80 shadow-inner flex items-baseline space-x-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400">{t.hh}</span>
              <span className="text-gray-500 font-bold text-xl">:</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400">{t.mm}</span>
              <span className="text-gray-500 font-bold text-xl">:</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400">{t.ss}</span>
              <span className="text-gray-500 font-bold text-xl">.</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 min-w-[55px] inline-block text-left">
                {t.mmm}
              </span>
              <span className="text-xs font-bold text-gray-400 ml-1">sec</span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-cyan-400/90">
            Total Seconds: <span className="text-gray-100 font-mono font-extrabold">{t.totalSeconds}</span>
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExecuteNow(nextOrder.id)}
            className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            title="Trigger Immediate Low-Latency Execution"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Execute Now</span>
          </button>

          <button
            onClick={() => onCancelOrder(nextOrder.id)}
            className="p-3 rounded-2xl bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 border border-gray-700 transition-all"
            title="Cancel Scheduled Order"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="mt-4 w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${
            isImminent
              ? 'bg-gradient-to-r from-amber-400 to-cyan-400'
              : 'bg-gradient-to-r from-cyan-600 to-blue-500'
          }`}
          style={{ width: `${t.percent}%` }}
        />
      </div>
    </div>
  );
};
