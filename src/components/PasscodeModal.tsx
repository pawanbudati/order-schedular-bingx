import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, ShieldAlert } from 'lucide-react';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticateAdmin: (pin: string) => Promise<{ success: boolean; message: string }>;
  onGuestAccess: () => void;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onClose,
  onAuthenticateAdmin,
  onGuestAccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError('Please enter Admin PIN (Default: 1234)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await onAuthenticateAdmin(pin);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Invalid Passcode');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
          <Lock className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-xl font-bold text-gray-100">BingX Scheduler Access</h2>
        <p className="text-xs text-gray-400 font-mono mt-1 mb-5">Enter Admin PIN to unlock full order scheduling controls</p>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Admin PIN (Default: 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-700 text-cyan-400 text-center font-bold text-base rounded-xl p-3 focus:ring-2 focus:ring-cyan-500 font-mono outline-none tracking-widest"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'UNLOCK ADMIN ACCESS'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              onGuestAccess();
              onClose();
            }}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            Continue as Guest
          </button>
          <span className="text-gray-600">v1.0 BingX</span>
        </div>
      </div>
    </div>
  );
};
