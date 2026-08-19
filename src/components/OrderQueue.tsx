import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, XCircle, RefreshCw, Zap } from 'lucide-react';
import { ScheduledOrder } from '../types';

interface OrderQueueProps {
  orders: ScheduledOrder[];
  onExecuteNow: (id: string) => Promise<void>;
  onCancelOrder: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const OrderQueue: React.FC<OrderQueueProps> = ({ orders, onExecuteNow, onCancelOrder, onRefresh }) => {
  const [now, setNow] = useState<number>(Date.now());
  const requestRef = useRef<number | null>(null);

  // High-precision 60 FPS requestAnimationFrame loop for 1ms countdown updates
  useEffect(() => {
    const updateLoop = () => {
      setNow(Date.now());
      requestRef.current = requestAnimationFrame(updateLoop);
    };
    requestRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const formatCountdownData = (targetTime: number) => {
    const diff = targetTime - now;
    if (diff <= 0) return { text: '00:00.000s', isImminent: false, isPassed: true };

    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const ms = Math.floor(diff % 1000);

    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    const mmm = String(ms).padStart(3, '0');

    return {
      text: `${mm}:${ss}.${mmm}s`,
      isImminent: diff <= 3000,
      isPassed: false,
    };
  };

  const formatTargetTimeWithMs = (targetTimeMs: number): string => {
    const d = new Date(targetTimeMs);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const mmm = String(d.getMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss}.${mmm} IST`;
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800 font-mono">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-bold text-gray-100">Scheduled Queue</h2>
            <p className="text-[10px] sm:text-xs text-gray-400">Low-Latency Execution Panel</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all border border-gray-700 active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
          title="Refresh Queue"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 sm:py-10 px-4 text-gray-500 text-xs font-mono bg-[#0b0f19] rounded-xl border border-gray-800">
          No scheduled orders in queue. Use the form above to schedule high-frequency orders.
        </div>
      ) : (
        <>
          {/* Mobile Cards View (Visible on Mobile `< md`) */}
          <div className="block md:hidden space-y-3 font-mono">
            {orders.map((order) => {
              const isPending = order.status === 'PENDING';
              const isCompleted = order.status === 'COMPLETED';
              const isFailed = order.status === 'FAILED';
              const cd = formatCountdownData(order.targetTime);

              return (
                <div
                  key={order.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isPending && cd.isImminent
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-[#0b0f19] border-gray-800'
                  }`}
                >
                  {/* Top Bar: Symbol, Side & Accounts */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-sm text-gray-100">{order.symbol}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                          order.side === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {order.side} {order.marketType === 'SWAP' ? `(${order.positionSide})` : ''}
                      </span>
                    </div>

                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold shrink-0">
                      {order.accountIds === 'ALL' ? 'ALL ACCOUNTS' : '1 Account'}
                    </span>
                  </div>

                  {/* Quantity & Leverage */}
                  <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                    <div>
                      Qty: <span className="font-bold text-gray-100">{order.quantity}</span>
                    </div>
                    <div className="text-gray-400">
                      {order.type} {order.leverage ? `@ ${order.leverage}x` : ''}
                    </div>
                  </div>

                  {/* High Precision Live Countdown Banner on Mobile */}
                  <div className="my-2 py-2 px-2.5 rounded-lg bg-[#111827] border border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] text-gray-400">
                      <div>Target Time:</div>
                      <div className="text-gray-200 font-bold text-xs">{formatTargetTimeWithMs(order.targetTime)}</div>
                    </div>

                    <div>
                      {isPending ? (
                        cd.isImminent ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/40 animate-pulse">
                            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                            <span>⚡ {cd.text}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 font-extrabold text-xs border border-cyan-500/30">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>⏱️ {cd.text}</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono">Completed</span>
                      )}
                    </div>
                  </div>

                  {/* Status & Mobile Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 gap-2">
                    <div className="min-w-0">
                      {isPending && (
                        <span className="inline-flex items-center space-x-1 text-[10px] text-amber-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          <span>PENDING</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          ✓ FILLED ({order.precisionDriftMs ? `${order.precisionDriftMs > 0 ? '+' : ''}${order.precisionDriftMs}ms` : '0ms'})
                        </span>
                      )}
                      {isFailed && (
                        <span className="text-[10px] text-red-400 font-bold truncate block">
                          ❌ {order.errorMessage || 'Failed'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {isPending && (
                        <>
                          <button
                            onClick={() => onExecuteNow(order.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30 active:scale-95 flex items-center space-x-1 min-h-[36px]"
                          >
                            <Play className="w-3.5 h-3.5 fill-amber-300" />
                            <span>Run</span>
                          </button>
                          <button
                            onClick={() => onCancelOrder(order.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 active:scale-95 min-h-[36px]"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Hidden on Mobile `< md`) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b0f19] text-gray-400 border-b border-gray-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Symbol / Side</th>
                  <th className="py-3 px-4">Type / Qty</th>
                  <th className="py-3 px-4">Target Execution Time</th>
                  <th className="py-3 px-4 text-center">Countdown</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 bg-[#0f172a]/40">
                {orders.map((order) => {
                  const isPending = order.status === 'PENDING';
                  const isCompleted = order.status === 'COMPLETED';
                  const isFailed = order.status === 'FAILED';
                  const cd = formatCountdownData(order.targetTime);

                  return (
                    <tr key={order.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-300">
                        #{order.id.slice(-8)}
                        <span className="block text-[10px] text-gray-500 font-normal">
                          {order.accountIds === 'ALL' ? 'ALL ACCOUNTS' : '1 Account'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-100">{order.symbol}</div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            order.side === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {order.side} {order.marketType === 'SWAP' ? `(${order.positionSide})` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-cyan-400">{order.quantity} Qty</div>
                        <span className="text-[10px] text-gray-400">
                          {order.type} {order.leverage ? `@ ${order.leverage}x` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-200 font-bold">{formatTargetTimeWithMs(order.targetTime)}</div>
                        <span className="text-[10px] text-gray-500">{order.targetTimeFormatted}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          cd.isImminent ? (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 animate-pulse">
                              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                              <span>⚡ {cd.text}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-xs border border-cyan-500/30">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              <span>⏱️ {cd.text}</span>
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500 text-xs">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isPending && (
                          <span className="inline-flex items-center space-x-1 text-xs text-amber-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            <span>PENDING</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-emerald-400 font-bold">
                            ✓ FILLED ({order.precisionDriftMs ? `${order.precisionDriftMs > 0 ? '+' : ''}${order.precisionDriftMs}ms` : '0ms'})
                          </span>
                        )}
                        {isFailed && (
                          <span className="text-xs text-red-400 font-bold truncate max-w-[160px] block" title={order.errorMessage}>
                            ❌ {order.errorMessage || 'Failed'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => onExecuteNow(order.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center space-x-1 active:scale-95"
                                title="Execute Immediately"
                              >
                                <Play className="w-3.5 h-3.5 fill-amber-300" />
                                <span>Run</span>
                              </button>
                              <button
                                onClick={() => onCancelOrder(order.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all active:scale-95"
                                title="Cancel Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
