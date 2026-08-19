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

const API_BASE = '/api';

export const api = {
  // Status & Auth
  async getStatus(): Promise<SystemStatus> {
    const res = await axios.get(`${API_BASE}/status`);
    return res.data;
  },

  async verifyPasscode(passcode: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await axios.post(`${API_BASE}/verify-passcode`, { passcode });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Authentication failed' };
    }
  },

  // Accounts
  async getAccounts(): Promise<BingXAccountConfig[]> {
    const res = await axios.get(`${API_BASE}/accounts`);
    return res.data.data || [];
  },

  async saveAccount(account: Partial<BingXAccountConfig>): Promise<BingXAccountConfig> {
    const res = await axios.post(`${API_BASE}/accounts`, account);
    return res.data.data;
  },

  async deleteAccount(id: string): Promise<boolean> {
    const res = await axios.delete(`${API_BASE}/accounts/${id}`);
    return res.data.success;
  },

  // Balance & Tickers
  async getBalance(accountId?: string): Promise<BingXAccountBalance> {
    const res = await axios.get(`${API_BASE}/balance`, {
      params: { accountId },
    });
    return res.data.data;
  },

  async getTickers(): Promise<BingXTicker[]> {
    const res = await axios.get(`${API_BASE}/tickers`);
    return res.data.data || [];
  },

  async getInstruments(search?: string, category?: string): Promise<InstrumentContract[]> {
    const res = await axios.get(`${API_BASE}/instruments`, {
      params: { search, category },
    });
    return res.data.data || [];
  },

  // Orders
  async getOrders(): Promise<ScheduledOrder[]> {
    const res = await axios.get(`${API_BASE}/orders`);
    return res.data.data || [];
  },

  async scheduleOrder(request: ScheduledOrderRequest): Promise<ScheduledOrder> {
    const res = await axios.post(`${API_BASE}/orders`, request);
    return res.data.data;
  },

  async executeOrderNow(id: string): Promise<boolean> {
    const res = await axios.post(`${API_BASE}/orders/${id}/execute-now`);
    return res.data.success;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const res = await axios.delete(`${API_BASE}/orders/${id}`);
    return res.data.success;
  },

  // Logs
  async getLogs(limit: number = 100): Promise<ExecutionLog[]> {
    const res = await axios.get(`${API_BASE}/logs`, { params: { limit } });
    return res.data.data || [];
  },

  async clearLogs(): Promise<boolean> {
    const res = await axios.delete(`${API_BASE}/logs`);
    return res.data.success;
  },
};
