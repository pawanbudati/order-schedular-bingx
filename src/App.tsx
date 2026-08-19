import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { OrderForm } from './components/OrderForm';
import { OrderQueue } from './components/OrderQueue';
import { AccountManagerModal } from './components/AccountManagerModal';
import { LogsModal } from './components/LogsModal';
import { ConfigModal } from './components/ConfigModal';
import { PasscodeModal } from './components/PasscodeModal';
import { InstrumentSearchModal } from './components/InstrumentSearchModal';
import { api } from './services/api';
import {
  SystemStatus,
  BingXAccountConfig,
  BingXAccountBalance,
  BingXTicker,
  ScheduledOrder,
  ScheduledOrderRequest,
  ExecutionLog,
  InstrumentContract,
} from './types';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('BINGX_THEME');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [userRole, setUserRole] = useState<'ADMIN' | 'GUEST'>(() => {
    const savedRole = sessionStorage.getItem('BINGX_USER_ROLE');
    return (savedRole as 'ADMIN' | 'GUEST') || 'ADMIN';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('BINGX_IS_AUTHENTICATED') !== 'false';
  });

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [accounts, setAccounts] = useState<BingXAccountConfig[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [balance, setBalance] = useState<BingXAccountBalance | null>(null);
  const [tickers, setTickers] = useState<BingXTicker[]>([]);
  const [instruments, setInstruments] = useState<InstrumentContract[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('XAU-USDT');
  const [orders, setOrders] = useState<ScheduledOrder[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);

  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState<boolean>(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('BINGX_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch status & clock sync
  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getStatus();
      setStatus(data);
    } catch (err) {
      console.warn('Failed to fetch BingX status:', err);
    }
  }, []);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const list = await api.getAccounts();
      setAccounts(list);
      if (list.length > 0 && !selectedAccountId) {
        setSelectedAccountId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch accounts:', err);
    }
  }, [selectedAccountId]);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    try {
      setIsBalanceLoading(true);
      const data = await api.getBalance(selectedAccountId);
      setBalance(data);
    } catch (err) {
      console.warn('Failed to fetch balance:', err);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [selectedAccountId]);

  // Fetch tickers
  const fetchTickers = useCallback(async () => {
    try {
      const list = await api.getTickers();
      setTickers(list);
    } catch (err) {
      console.warn('Failed to fetch tickers:', err);
    }
  }, []);

  // Fetch full instruments catalog
  const fetchInstruments = useCallback(async () => {
    try {
      const list = await api.getInstruments();
      setInstruments(list);
    } catch (err) {
      console.warn('Failed to fetch instruments catalog:', err);
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const list = await api.getOrders();
      setOrders(list);
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
    }
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      const list = await api.getLogs();
      setLogs(list);
    } catch (err) {
      console.warn('Failed to fetch logs:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchAccounts();
    fetchTickers();
    fetchInstruments();
    fetchOrders();
    fetchLogs();
  }, [fetchStatus, fetchAccounts, fetchTickers, fetchInstruments, fetchOrders, fetchLogs]);

  // Balance load when account changes
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Periodic polling loops
  useEffect(() => {
    const statusInterval = setInterval(fetchStatus, 10000);
    const tickersInterval = setInterval(fetchTickers, 2000);
    const ordersInterval = setInterval(fetchOrders, 1000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(tickersInterval);
      clearInterval(ordersInterval);
    };
  }, [fetchStatus, fetchTickers, fetchOrders]);

  // Actions
  const handleScheduleOrder = async (req: ScheduledOrderRequest) => {
    await api.scheduleOrder(req);
    await fetchOrders();
    await fetchLogs();
  };

  const handleExecuteNow = async (id: string) => {
    await api.executeOrderNow(id);
    await fetchOrders();
    await fetchLogs();
  };

  const handleCancelOrder = async (id: string) => {
    await api.deleteOrder(id);
    await fetchOrders();
    await fetchLogs();
  };

  const handleSaveAccount = async (accountData: Partial<BingXAccountConfig>) => {
    await api.saveAccount(accountData);
    await fetchAccounts();
    await fetchBalance();
  };

  const handleDeleteAccount = async (id: string) => {
    await api.deleteAccount(id);
    await fetchAccounts();
    await fetchBalance();
  };

  const handleClearLogs = async () => {
    await api.clearLogs();
    await fetchLogs();
  };

  const handleAuthenticateAdmin = async (enteredPin: string) => {
    const res = await api.verifyPasscode(enteredPin);
    if (res.success) {
      setUserRole('ADMIN');
      setIsAuthenticated(true);
      sessionStorage.setItem('BINGX_USER_ROLE', 'ADMIN');
      sessionStorage.setItem('BINGX_IS_AUTHENTICATED', 'true');
      return { success: true, message: 'Admin authenticated' };
    }
    return { success: false, message: res.message || 'Invalid PIN' };
  };

  const handleGuestAccess = () => {
    setUserRole('GUEST');
    setIsAuthenticated(true);
    sessionStorage.setItem('BINGX_USER_ROLE', 'GUEST');
    sessionStorage.setItem('BINGX_IS_AUTHENTICATED', 'true');
  };

  const handleLockScreen = () => {
    setIsPasscodeOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        status={status}
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAccounts={() => setIsAccountsOpen(true)}
        onOpenLogs={() => {
          fetchLogs();
          setIsLogsOpen(true);
        }}
        onOpenConfig={() => setIsConfigOpen(true)}
        onLockScreen={handleLockScreen}
        onRefreshStatus={fetchStatus}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Account Portfolio Summary */}
        <BalanceCard
          balance={balance}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          isLoading={isBalanceLoading}
          onRefresh={fetchBalance}
        />

        {/* High-Precision Order Form */}
        <OrderForm
          tickers={tickers}
          accounts={accounts}
          balance={balance}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onScheduleOrder={handleScheduleOrder}
        />

        {/* Live Scheduled Order Queue */}
        <OrderQueue
          orders={orders}
          onExecuteNow={handleExecuteNow}
          onCancelOrder={handleCancelOrder}
          onRefresh={fetchOrders}
        />
      </main>

      {/* Modals */}
      <InstrumentSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        instruments={instruments}
        selectedSymbol={selectedSymbol}
        onSelectInstrument={(inst) => setSelectedSymbol(inst.displaySymbol)}
      />

      <AccountManagerModal
        isOpen={isAccountsOpen}
        onClose={() => setIsAccountsOpen(false)}
        accounts={accounts}
        onSaveAccount={handleSaveAccount}
        onDeleteAccount={handleDeleteAccount}
      />

      <LogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={logs}
        onClearLogs={handleClearLogs}
      />

      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} status={status} />

      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onAuthenticateAdmin={handleAuthenticateAdmin}
        onGuestAccess={handleGuestAccess}
      />
    </div>
  );
}
