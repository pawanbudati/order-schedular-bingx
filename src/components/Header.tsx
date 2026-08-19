import React from 'react';
import { Zap, ShieldCheck, Lock, RefreshCw, Moon, Sun, Settings, FileText, Users, Activity } from 'lucide-react';
import { SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  userRole: 'ADMIN' | 'GUEST';
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAccounts: () => void;
  onOpenLogs: () => void;
  onOpenConfig: () => void;
  onLockScreen: () => void;
  onRefreshStatus: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  userRole,
  isAuthenticated,
  theme,
  onToggleTheme,
  onOpenAccounts,
  onOpenLogs,
  onOpenConfig,
  onLockScreen,
  onRefreshStatus,
}) => {
  const offset = status?.serverOffsetMs ?? 0;
  const isOffsetGood = Math.abs(offset) < 50;

  return (
    <header className="bg-[#111827]/90 backdrop-blur border-b border-gray-800 sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Left Branding */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                BingX Scheduler
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono">High-Frequency Multi-Account Execution Engine</p>
          </div>
        </div>

        {/* Center Clock Sync Status */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-[#0b0f19] px-3 py-1.5 rounded-lg border border-gray-800 text-[11px] sm:text-xs font-mono w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isOffsetGood ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="text-gray-400">BingX Sync:</span>
            <span className={`font-semibold ${isOffsetGood ? 'text-emerald-400' : 'text-amber-400'}`}>
              {offset > 0 ? `+${offset}` : offset} ms
            </span>
          </div>
          <span className="text-gray-700">|</span>
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400">RTT:</span>
            <span className="text-cyan-400 font-semibold">{status?.rttMs ?? 0} ms</span>
          </div>
          <span className="text-gray-700 hidden sm:inline">|</span>
          <div className="text-gray-400 hidden sm:block">
            {status?.timeIST ? status.timeIST.split(',')[1] || status.timeIST : 'Syncing...'}
          </div>
          <button
            onClick={onRefreshStatus}
            className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
            title="Re-sync Server Time"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 sm:gap-2 w-full md:w-auto">
          <button
            onClick={onOpenAccounts}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 text-xs font-medium transition-all shrink-0"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Accounts ({status?.accountsCount ?? 0})</span>
            <span className="inline sm:hidden">({status?.accountsCount ?? 0})</span>
          </button>

          <button
            onClick={onOpenLogs}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-all border border-gray-700 shrink-0"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span>Logs</span>
          </button>

          <button
            onClick={onOpenConfig}
            className="p-1.5 sm:p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all border border-gray-700 shrink-0"
            title="Settings & Config"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all border border-gray-700 shrink-0"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />}
          </button>

          {/* Role / Lock Badge */}
          {userRole === 'ADMIN' ? (
            <button
              onClick={onLockScreen}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-all shrink-0"
              title="Click to Lock Admin Mode"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>ADMIN</span>
            </button>
          ) : (
            <button
              onClick={onLockScreen}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 text-xs font-semibold hover:text-gray-200 transition-all shrink-0"
              title="Click to Login as Admin"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>GUEST</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
