/// <reference types="vite/client" />
import axios from 'axios';
import {
  SystemStatus,
  BingXAccountConfig,
  BingXAccountBalance,
  BingXTicker,
  ScheduledOrder,
  ScheduledOrderRequest,
  ExecutionLog,
  InstrumentContract,
} from '../types';

export const getBackendUrl = (): string => {
  const saved = localStorage.getItem('BINGX_BACKEND_URL');
  if (saved) return saved.replace(/\/$/, '');
  const viteEnv = (import.meta as any).env?.VITE_API_BASE;
  if (viteEnv) return viteEnv.replace(/\/$/, '');
  return 'https://order-schedular-bingx.duckdns.org';
};

const getApiBase = (): string => {
  const baseUrl = getBackendUrl();
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBase();
  return config;
});

export const api = {
  // Status & Auth
  async getStatus(): Promise<SystemStatus> {
    const res = await apiClient.get('/status');
    return res.data;
  },

  async verifyPasscode(passcode: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post('/verify-passcode', { passcode });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Authentication failed' };
    }
  },

  // Accounts
  async getAccounts(): Promise<BingXAccountConfig[]> {
    const res = await apiClient.get('/accounts');
    return res.data.data || [];
  },

  async saveAccount(account: Partial<BingXAccountConfig>): Promise<BingXAccountConfig> {
    const res = await apiClient.post('/accounts', account);
    return res.data.data;
  },

  async deleteAccount(id: string): Promise<boolean> {
    const res = await apiClient.delete(`/accounts/${id}`);
    return res.data.success;
  },

  // Balance & Tickers
  async getBalance(accountId?: string): Promise<BingXAccountBalance> {
    const res = await apiClient.get('/balance', {
      params: { accountId },
    });
    return res.data.data;
  },

  async getTickers(): Promise<BingXTicker[]> {
    const res = await apiClient.get('/tickers');
    return res.data.data || [];
  },

  async getInstruments(search?: string, category?: string): Promise<InstrumentContract[]> {
    const res = await apiClient.get('/instruments', {
      params: { search, category },
    });
    return res.data.data || [];
  },

  // Orders
  async getOrders(): Promise<ScheduledOrder[]> {
    const res = await apiClient.get('/orders');
    return res.data.data || [];
  },

  async scheduleOrder(request: ScheduledOrderRequest): Promise<ScheduledOrder> {
    const res = await apiClient.post('/orders', request);
    return res.data.data;
  },

  async executeOrderNow(id: string): Promise<boolean> {
    const res = await apiClient.post(`/orders/${id}/execute-now`);
    return res.data.success;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const res = await apiClient.delete(`/orders/${id}`);
    return res.data.success;
  },

  // Logs
  async getLogs(limit: number = 100): Promise<ExecutionLog[]> {
    const res = await apiClient.get('/logs', { params: { limit } });
    return res.data.data || [];
  },

  async clearLogs(): Promise<boolean> {
    const res = await apiClient.delete('/logs');
    return res.data.success;
  },
};
