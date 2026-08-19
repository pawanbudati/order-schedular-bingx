import React, { useState } from 'react';
import { X, Settings, Server, Shield, CheckCircle2 } from 'lucide-react';
import { SystemStatus } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatus | null;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, status }) => {
  const [apiUrl, setApiUrl] = useState<string>('http://localhost:8445');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">System Configuration</h2>
              <p className="text-xs text-gray-400 font-mono">Backend Engine & Network Gateway Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4 space-y-4 font-mono text-xs">
          {saveSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration saved successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-1">Backend Server REST API Endpoint</label>
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-[#0b0f19] border border-gray-700 text-cyan-400 text-xs rounded-xl p-2.5 outline-none"
              />
            </div>
          </div>

          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-gray-800 space-y-2 text-[11px]">
            <div className="text-gray-300 font-bold flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Engine Status Info</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Server Offset:</span>
              <span className="text-cyan-400 font-bold">{status?.serverOffsetMs ?? 0} ms</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>RTT Latency:</span>
              <span className="text-emerald-400 font-bold">{status?.rttMs ?? 0} ms</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Active Scheduled Timers:</span>
              <span className="text-amber-400 font-bold">{status?.activeTimersCount ?? 0}</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            Save Gateway Settings
          </button>
        </div>
      </div>
    </div>
  );
};
