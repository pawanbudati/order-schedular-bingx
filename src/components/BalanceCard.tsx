import React from 'react';
import { Wallet, TrendingUp, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { BingXAccountBalance, BingXAccountConfig } from '../types';

interface BalanceCardProps {
  balance: BingXAccountBalance | null;
  accounts: BingXAccountConfig[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  accounts,
  selectedAccountId,
  onSelectAccount,
  isLoading,
  onRefresh,
}) => {
  const isPnlPositive = (balance?.unrealizedProfit ?? 0) >= 0;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Top Header & Account Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-200">BingX Account Portfolio</h2>
            <p className="text-xs text-gray-400 font-mono">Perpetual Futures & Spot Margin</p>
          </div>
        </div>

        {/* Account Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedAccountId}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="bg-[#0b0f19] border border-gray-700 text-gray-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 font-mono outline-none"
          >
            {accounts.length === 0 ? (
              <option value="">Demo Simulation Account</option>
            ) : (
              accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountName} ({acc.environment})
                </option>
              ))
            )}
          </select>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all border border-gray-700 disabled:opacity-50"
            title="Refresh Account Balance"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Key Balance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Equity */}
        <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800/80">
          <div className="text-xs text-gray-400 font-medium mb-1">Total Equity (USDT)</div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            ${(balance?.equity ?? 10000.0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-[10px] text-gray-500 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold uppercase">
              {balance?.environment || 'VST'}
            </span>
          </div>
        </div>

        {/* Available Margin */}
        <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800/80">
          <div className="text-xs text-gray-400 font-medium mb-1">Available Margin</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ${(balance?.availableMargin ?? 10000.0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[10px] text-gray-500 font-mono">Ready for scheduling</div>
        </div>

        {/* Used Margin */}
        <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800/80">
          <div className="text-xs text-gray-400 font-medium mb-1">Used Margin</div>
          <div className="text-xl font-bold font-mono text-amber-400">
            ${(balance?.usedMargin ?? 0.0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[10px] text-gray-500 font-mono">In open positions</div>
        </div>

        {/* Unrealized PnL */}
        <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800/80">
          <div className="text-xs text-gray-400 font-medium mb-1">Unrealized PnL</div>
          <div className={`text-xl font-bold font-mono ${isPnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPnlPositive ? '+' : ''}${(balance?.unrealizedProfit ?? 0.0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center text-[10px] font-mono">
            {isPnlPositive ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Profitable</span>
              </span>
            ) : (
              <span className="text-red-400 flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Drawdown</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
