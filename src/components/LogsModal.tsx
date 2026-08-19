import React, { useState } from 'react';
import { X, FileText, Trash2, Filter, CheckCircle2, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { ExecutionLog } from '../types';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ExecutionLog[];
  onClearLogs: () => Promise<void>;
}

export const LogsModal: React.FC<LogsModalProps> = ({ isOpen, onClose, logs, onClearLogs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">BingX Execution & Latency Audit Logs</h2>
              <p className="text-xs text-gray-400 font-mono">Microsecond Trigger Metrics & API Response Log</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClearLogs}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-all flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Filter Level:</span>
            {['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  filterLevel === lvl ? 'bg-cyan-500 text-white' : 'bg-[#0b0f19] text-gray-400 border border-gray-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <span className="text-gray-500">Showing {filteredLogs.length} logs</span>
        </div>

        {/* Logs Feed */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-2 pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs font-mono bg-[#0b0f19] rounded-xl border border-gray-800">
              No audit logs recorded yet.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSuccess = log.level === 'SUCCESS';
              const isError = log.level === 'ERROR';
              const isWarn = log.level === 'WARN';

              return (
                <div
                  key={log.id}
                  className="p-3 bg-[#0b0f19] rounded-xl border border-gray-800 font-mono text-xs space-y-1 hover:border-gray-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isError && <ShieldAlert className="w-4 h-4 text-red-400" />}
                      {isWarn && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {!isSuccess && !isError && !isWarn && <Info className="w-4 h-4 text-cyan-400" />}

                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isError
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : isWarn
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>

                    <span className="text-[10px] text-gray-500">
                      {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>

                  {log.details && (
                    <pre className="text-[10px] text-gray-400 bg-[#111827] p-2 rounded-lg border border-gray-800 overflow-x-auto max-h-40">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
