import React, { useState } from 'react';
import { X, Plus, Trash2, Key, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { BingXAccountConfig, EnvironmentType } from '../types';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BingXAccountConfig[];
  onSaveAccount: (account: Partial<BingXAccountConfig>) => Promise<void>;
  onDeleteAccount: (id: string) => Promise<void>;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [accountName, setAccountName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [environment, setEnvironment] = useState<EnvironmentType>('VST');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !apiKey.trim() || !secretKey.trim()) {
      setError('Please fill in Account Name, API Key, and Secret Key.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSaveAccount({
        accountName: accountName.trim(),
        apiKey: apiKey.trim(),
        secretKey: secretKey.trim(),
        environment,
        enabled: true,
      });

      setAccountName('');
      setApiKey('');
      setSecretKey('');
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">BingX Account Manager</h2>
              <p className="text-xs text-gray-400 font-mono">Configure Multi-Account API Keys for Parallel Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pt-4 flex-1 pr-1">
          {/* Form to Add Account */}
          <form onSubmit={handleSubmit} className="bg-[#0b0f19] p-4 rounded-xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Add BingX API Account</span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono">AES Encrypted Storage</span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Account Label</label>
                <input
                  type="text"
                  placeholder="e.g. Main Scalp Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 text-gray-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Trading Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
                  className="w-full bg-[#111827] border border-gray-700 text-gray-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 font-mono outline-none"
                >
                  <option value="VST">BingX VST (Demo Simulation)</option>
                  <option value="LIVE">BingX Live Production</option>
                  <option value="DEMO">BingX Testnet</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">BingX API Key</label>
                <input
                  type="text"
                  placeholder="Enter BingX API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 text-gray-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">BingX Secret Key</label>
                <input
                  type="password"
                  placeholder="Enter BingX Secret Key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 text-gray-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 font-mono outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Account...' : 'Save BingX Account'}
            </button>
          </form>

          {/* List of Existing Accounts */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Configured Accounts ({accounts.length})
            </h3>

            {accounts.length === 0 ? (
              <div className="text-center py-6 bg-[#0b0f19] rounded-xl border border-gray-800 text-gray-500 text-xs font-mono">
                No custom BingX API accounts configured. Using Demo Simulation Mode.
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3.5 bg-[#0b0f19] rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-200">{acc.accountName}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {acc.environment}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          API Key: {acc.secretKeyMasked || `${acc.apiKey.substring(0, 6)}...`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteAccount(acc.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
