export type EnvironmentType = 'LIVE' | 'DEMO' | 'VST';
export type MarketType = 'SWAP' | 'SPOT';
export type OrderSide = 'BUY' | 'SELL';
export type PositionSide = 'LONG' | 'SHORT' | 'BOTH';
export type OrderType = 'MARKET' | 'LIMIT';
export type MarginType = 'ISOLATED' | 'CROSSED';
export type OrderStatus = 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type InstrumentCategory = 'All' | 'Favorites' | 'Commodities' | 'Forex' | 'Crypto' | 'Indices';

export interface InstrumentContract {
  symbol: string;
  displaySymbol: string;
  displayName: string;
  asset: string;
  category: 'Commodities' | 'Forex' | 'Crypto' | 'Indices';
  maxLeverage: number;
  pricePrecision: number;
  quantityPrecision: number;
  tradeMinQuantity: number;
  tradeMinUSDT: number;
  lastPrice: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  isFavorite?: boolean;
}

export interface BingXAccountConfig {
  id: string;
  accountName: string;
  apiKey: string;
  secretKey?: string;
  secretKeyMasked?: string;
  environment: EnvironmentType;
  isDefault?: boolean;
  enabled?: boolean;
  createdAt?: number;
}

export interface BingXAccountBalance {
  asset: string;
  balance: number;
  equity: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedProfit: number;
  accountId: string;
  accountName: string;
  environment: EnvironmentType;
}

export interface BingXTicker {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  bidPrice?: number;
  askPrice?: number;
  spread?: number;
  updatedAt?: number;
}

export interface ScheduledOrderRequest {
  symbol: string;
  marketType: MarketType;
  side: OrderSide;
  positionSide: PositionSide;
  type: OrderType;
  price?: number;
  quantity: number;
  leverage: number;
  marginType?: MarginType;
  stopLoss?: number;
  takeProfit?: number;
  targetTime: number; // UTC Epoch Milliseconds
  accountIds: string[] | 'ALL';
}

export interface AccountExecutionResult {
  accountId: string;
  accountName: string;
  success: boolean;
  orderId?: string;
  latencyMs?: number;
  error?: string;
  rawResponse?: any;
}

export interface ScheduledOrder extends ScheduledOrderRequest {
  id: string;
  targetTimeFormatted: string;
  status: OrderStatus;
  actualTime?: number;
  precisionDriftMs?: number;
  executionResults?: AccountExecutionResult[];
  errorMessage?: string;
  createdAt: number;
}

export interface ExecutionLog {
  id: string;
  orderId?: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
  details?: any;
}

export interface SystemStatus {
  status: 'ok' | 'degraded' | 'error';
  timeIST: string;
  timeUTC: string;
  timestamp: number;
  serverOffsetMs: number;
  rttMs: number;
  activeTimersCount: number;
  accountsCount: number;
  ordersCount: number;
}
