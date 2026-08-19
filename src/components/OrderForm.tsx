import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, Search, ChevronDown, CheckSquare, Square, ArrowUpRight, ArrowDownRight, Layers, Flame, Sliders } from 'lucide-react';
import {
  BingXTicker,
  BingXAccountConfig,
  BingXAccountBalance,
  ScheduledOrderRequest,
  MarketType,
  OrderSide,
  PositionSide,
  OrderType,
  MarginType,
} from '../types';

interface OrderFormProps {
  tickers: BingXTicker[];
  accounts: BingXAccountConfig[];
  balance?: BingXAccountBalance | null;
  selectedSymbol: string;
  onSelectSymbol: (sym: string) => void;
  onOpenSearchModal: () => void;
  onScheduleOrder: (request: ScheduledOrderRequest) => Promise<void>;
}

// Extended Symbol Master List with Category and Default Max Leverage
interface SymbolMeta {
  symbol: string;
  name: string;
  category: 'Commodities' | 'Forex' | 'Crypto';
  maxLeverage: number;
}

const SYMBOL_CATALOG: SymbolMeta[] = [
  // Commodities
  { symbol: 'XAU-USDT', name: 'Gold (XAU/USDT)', category: 'Commodities', maxLeverage: 1000 },

  // Forex Perps
  { symbol: 'EUR-USDT', name: 'Euro (EUR/USDT)', category: 'Forex', maxLeverage: 500 },
  { symbol: 'GBP-USDT', name: 'British Pound (GBP/USDT)', category: 'Forex', maxLeverage: 500 },
  { symbol: 'AUD-USDT', name: 'Australian Dollar (AUD/USDT)', category: 'Forex', maxLeverage: 500 },
  { symbol: 'USD-JPY', name: 'Japanese Yen (USD/JPY)', category: 'Forex', maxLeverage: 500 },

  // Crypto Major & Alts
  { symbol: 'BTC-USDT', name: 'Bitcoin (BTC/USDT)', category: 'Crypto', maxLeverage: 150 },
  { symbol: 'ETH-USDT', name: 'Ethereum (ETH/USDT)', category: 'Crypto', maxLeverage: 150 },
  { symbol: 'SOL-USDT', name: 'Solana (SOL/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'XRP-USDT', name: 'Ripple (XRP/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'PEPE-USDT', name: 'Pepe (PEPE/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'DOGE-USDT', name: 'Dogecoin (DOGE/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'BNB-USDT', name: 'Binance Coin (BNB/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'ADA-USDT', name: 'Cardano (ADA/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'AVAX-USDT', name: 'Avalanche (AVAX/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'LINK-USDT', name: 'Chainlink (LINK/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'SUI-USDT', name: 'Sui (SUI/USDT)', category: 'Crypto', maxLeverage: 100 },
  { symbol: 'LTC-USDT', name: 'Litecoin (LTC/USDT)', category: 'Crypto', maxLeverage: 100 },
];

const isNonCryptoSymbol = (sym: string): boolean => {
  const s = sym.toUpperCase();
  return (
    s.includes('XAU') ||
    s.includes('GOLD') ||
    s.includes('EUR') ||
    s.includes('GBP') ||
    s.includes('AUD') ||
    s.includes('JPY') ||
    s.includes('CAD') ||
    s.includes('CHF') ||
    s.includes('SILVER')
  );
};

export const OrderForm: React.FC<OrderFormProps> = ({
  tickers,
  accounts,
  balance,
  selectedSymbol,
  onSelectSymbol,
  onOpenSearchModal,
  onScheduleOrder,
}) => {
  const symbol = selectedSymbol || 'XAU-USDT';
  const setSymbol = onSelectSymbol;
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [marketType, setMarketType] = useState<MarketType>('SWAP');
  const [side, setSide] = useState<OrderSide>('BUY');
  const [positionSide, setPositionSide] = useState<PositionSide>('LONG');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('0.01');
  const [leverage, setLeverage] = useState<number>(100);
  const [marginType, setMarginType] = useState<MarginType>('ISOLATED');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  // Target Accounts Selection
  const [targetMode, setTargetMode] = useState<'ALL' | 'CUSTOM'>('ALL');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // Time Picker States
  const [targetDateStr, setTargetDateStr] = useState<string>(() => {
    const d = new Date(Date.now() + 30000);
    return d.toISOString().split('T')[0];
  });
  const [hours, setHours] = useState<string>(() => {
    const d = new Date(Date.now() + 30000);
    return String(d.getHours()).padStart(2, '0');
  });
  const [minutes, setMinutes] = useState<string>(() => {
    const d = new Date(Date.now() + 30000);
    return String(d.getMinutes()).padStart(2, '0');
  });
  const [seconds, setSeconds] = useState<string>(() => {
    const d = new Date(Date.now() + 30000);
    return String(d.getSeconds()).padStart(2, '0');
  });
  const [milliseconds, setMilliseconds] = useState<string>('000');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic Max Leverage Calculator
  const getMaxLeverage = (sym: string): number => {
    const found = SYMBOL_CATALOG.find((s) => s.symbol.toUpperCase() === sym.toUpperCase());
    if (found) return found.maxLeverage;
    if (sym.toUpperCase().includes('XAU') || sym.toUpperCase().includes('GOLD')) return 1000;
    if (sym.toUpperCase().includes('EUR') || sym.toUpperCase().includes('GBP') || sym.toUpperCase().includes('JPY')) return 500;
    return 1000; // Allow up to 1000x max for custom pairs
  };

  const maxLeverageAllowed = getMaxLeverage(symbol);

  // Default leverage to MAX leverage by default whenever symbol changes
  useEffect(() => {
    setLeverage(maxLeverageAllowed);
  }, [symbol, maxLeverageAllowed]);

  const selectedTicker = tickers.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase()) || {
    symbol,
    lastPrice: symbol.includes('XAU') ? 4373.78 : 96500.0,
    priceChangePercent: 1.15,
    high24h: symbol.includes('XAU') ? 4455.0 : 98000,
    low24h: symbol.includes('XAU') ? 4356.0 : 94500,
    volume24h: 89000,
    bidPrice: symbol.includes('XAU') ? 4373.5 : 96498,
    askPrice: symbol.includes('XAU') ? 4374.0 : 96502,
    spread: symbol.includes('XAU') ? 0.5 : 4.0,
  };

  // Available Funds & Position Size Calculator
  const availMargin = balance?.availableMargin || balance?.balance || 10000;
  const currentPrice = selectedTicker?.lastPrice || (symbol.includes('XAU') ? 4373.78 : 96500.0);

  // Max Notional USD Value = Available Margin * Leverage (for Futures) or Available Margin (for Spot)
  const maxNotionalUSD = marketType === 'SWAP' ? availMargin * leverage : availMargin;

  // Max Quantity in Base Asset Contracts
  const maxQuantity = currentPrice > 0 ? maxNotionalUSD / currentPrice : 0;

  // Quantity Precision helper
  const getQtyPrecision = (sym: string): number => {
    if (sym.includes('XAU') || sym.includes('GOLD')) return 4;
    if (sym.includes('BTC')) return 3;
    return 2;
  };

  const qtyPrecision = getQtyPrecision(symbol);

  const applyPercentQuantity = (pct: number) => {
    const targetQty = maxQuantity * (pct / 100);
    setQuantity(targetQty.toFixed(qtyPrecision));
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedTicker && !price && orderType === 'LIMIT') {
      setPrice(String(selectedTicker.lastPrice));
    }
  }, [selectedTicker, orderType]);

  // Filtered Symbols for Search
  const filteredSymbols = SYMBOL_CATALOG.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applyTimePreset = (offsetSeconds: number) => {
    const target = new Date(Date.now() + offsetSeconds * 1000);
    setTargetDateStr(target.toISOString().split('T')[0]);
    setHours(String(target.getHours()).padStart(2, '0'));
    setMinutes(String(target.getMinutes()).padStart(2, '0'));
    setSeconds(String(target.getSeconds()).padStart(2, '0'));
    setMilliseconds('000');
  };

  const calculateTargetTimestamp = (): number => {
    const [year, month, day] = targetDateStr.split('-').map(Number);
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;
    const ms = Number(milliseconds) || 0;

    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(h, m, s, ms);
    return date.getTime();
  };

  const handleToggleAccount = (id: string) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter((a) => a !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const getLeveragePresets = (maxLev: number): number[] => {
    if (maxLev >= 1000) return [10, 100, 250, 500, 750, 1000];
    if (maxLev >= 500) return [10, 50, 100, 250, 500];
    if (maxLev >= 150) return [10, 25, 50, 100, 150];
    return [10, 25, 50, 75, 100];
  };

  const handleSubmit = async (isExecuteNow: boolean = false) => {
    setStatusMsg(null);
    const qtyVal = Number(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid order quantity.' });
      return;
    }

    const targetTimeMs = isExecuteNow ? Date.now() + 500 : calculateTargetTimestamp();

    if (!isExecuteNow && targetTimeMs <= Date.now()) {
      setStatusMsg({ type: 'error', text: 'Target time must be in the future.' });
      return;
    }

    const request: ScheduledOrderRequest = {
      symbol: symbol.toUpperCase(),
      marketType,
      side,
      positionSide: marketType === 'SPOT' ? 'BOTH' : positionSide,
      type: orderType,
      price: orderType === 'LIMIT' ? Number(price) : undefined,
      quantity: qtyVal,
      leverage,
      marginType,
      stopLoss: stopLoss ? Number(stopLoss) : undefined,
      takeProfit: takeProfit ? Number(takeProfit) : undefined,
      targetTime: targetTimeMs,
      accountIds: targetMode === 'ALL' ? 'ALL' : selectedAccountIds,
    };

    try {
      setIsSubmitting(true);
      await onScheduleOrder(request);
      setStatusMsg({
        type: 'success',
        text: isExecuteNow
          ? `Instant ${symbol} order triggered!`
          : `Order for ${symbol} scheduled successfully!`,
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to schedule order.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100">Schedule BingX High-Frequency Order</h2>
            <p className="text-xs text-gray-400 font-mono">Microsecond Synchronized Execution Panel</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenSearchModal}
            className="bg-[#0b0f19] border border-gray-700 hover:border-cyan-500 text-cyan-400 font-bold text-xs rounded-xl px-4 py-2.5 flex items-center space-x-2 font-mono shadow-sm transition-all hover:bg-gray-800/60"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-100 font-extrabold text-sm">{symbol}</span>
            {maxLeverageAllowed >= 500 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{maxLeverageAllowed}x</span>
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Live Market Ticker Bar */}
      {selectedTicker && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0b0f19] p-3 rounded-xl border border-gray-800 text-xs font-mono">
          <div>
            <span className="text-gray-500 block text-[10px]">Symbol / Max Lev</span>
            <span className="font-bold text-gray-200 text-sm flex items-center space-x-1">
              <span>{symbol}</span>
              <span className="text-amber-400 text-xs">({maxLeverageAllowed}x)</span>
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">Last Price</span>
            <span className="font-bold text-cyan-400 text-sm">${selectedTicker.lastPrice}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">24h Change</span>
            <span className={`font-semibold ${selectedTicker.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {selectedTicker.priceChangePercent >= 0 ? '+' : ''}{selectedTicker.priceChangePercent}%
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px]">Bid / Ask</span>
            <span className="text-gray-300">${selectedTicker.bidPrice} / ${selectedTicker.askPrice}</span>
          </div>
        </div>
      )}

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Order Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Trade Configuration */}
        <div className="space-y-4">
          {/* Side Toggle BUY vs SELL */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSide('BUY');
                setPositionSide('LONG');
              }}
              className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border ${
                side === 'BUY'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                  : 'bg-[#0b0f19] text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>BUY / LONG</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSide('SELL');
                setPositionSide('SHORT');
              }}
              className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border ${
                side === 'SELL'
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                  : 'bg-[#0b0f19] text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>SELL / SHORT</span>
            </button>
          </div>

          {/* Market Type, Order Type & Position Mode */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Contract Type</label>
              <select
                value={marketType}
                onChange={(e) => setMarketType(e.target.value as MarketType)}
                className="w-full bg-[#0b0f19] border border-gray-700 text-gray-200 text-xs rounded-xl p-2.5 font-mono outline-none"
              >
                <option value="SWAP">Futures (SWAP)</option>
                <option value="SPOT">Spot Trading</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Order Execution</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full bg-[#0b0f19] border border-gray-700 text-gray-200 text-xs rounded-xl p-2.5 font-mono outline-none"
              >
                <option value="MARKET">MARKET</option>
                <option value="LIMIT">LIMIT</option>
              </select>
            </div>

            {marketType === 'SWAP' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Position Mode</label>
                <select
                  value={positionSide}
                  onChange={(e) => setPositionSide(e.target.value as PositionSide)}
                  className="w-full bg-[#0b0f19] border border-gray-700 text-gray-200 text-xs rounded-xl p-2.5 font-mono outline-none text-cyan-400 font-bold"
                >
                  <option value={side === 'BUY' ? 'LONG' : 'SHORT'}>
                    Hedge Mode ({side === 'BUY' ? 'LONG' : 'SHORT'})
                  </option>
                  {!isNonCryptoSymbol(symbol) && <option value="BOTH">One-Way Mode (BOTH)</option>}
                </select>
              </div>
            )}
          </div>

          {marketType === 'SWAP' && isNonCryptoSymbol(symbol) && (
            <div className="text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl flex items-center space-x-1.5">
              <span>💡 <strong>BingX API Rule</strong>: Gold & Forex contracts require <strong>Hedge Mode (LONG/SHORT)</strong> in your BingX Mobile/Web App Settings.</span>
            </div>
          )}

          {/* Quantity, Price & Position Sizing Calculator */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-gray-800 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300">Order Quantity & Position Sizing</label>
              <span className="text-[10px] text-cyan-400 font-extrabold">
                Avail: ${availMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Order Amount ({symbol.split('-')[0]})</label>
                <input
                  type="number"
                  step="0.0001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 text-cyan-400 font-extrabold text-xs rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="0.01"
                />
              </div>

              {orderType === 'LIMIT' && (
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Limit Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-700 text-cyan-400 font-extrabold text-xs rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder={String(currentPrice)}
                  />
                </div>
              )}
            </div>

            {/* Quick Percentage Position Sizing Buttons: 25%, 50%, 75%, 90%, 100% */}
            <div className="space-y-1.5 pt-1 border-t border-gray-800/80">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400 font-bold">Quick Fund Allocation:</span>
                <span className="text-amber-400 font-extrabold">
                  Max: {maxQuantity.toFixed(qtyPrecision)} {symbol.split('-')[0]} (~${maxNotionalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} at {leverage}x)
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[25, 50, 75, 90, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPercentQuantity(pct)}
                    className="py-1.5 rounded-xl bg-[#111827] hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-gray-700 hover:border-cyan-500/50 text-xs font-extrabold transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Leverage Configurator for Futures (Up to 1000x for XAU-USDT) */}
          {marketType === 'SWAP' && (
            <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-bold flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Leverage Multiplier</span>
                  {symbol === 'XAU-USDT' && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold">
                      1000x Gold
                    </span>
                  )}
                </span>

                {/* Direct Numeric Input for Custom Leverage */}
                <div className="flex items-center space-x-1 font-mono">
                  <input
                    type="number"
                    min="1"
                    max={maxLeverageAllowed}
                    value={leverage}
                    onChange={(e) => {
                      const val = Math.min(Math.max(1, Number(e.target.value)), maxLeverageAllowed);
                      setLeverage(val);
                    }}
                    className="w-16 text-center bg-[#111827] border border-gray-700 text-amber-400 font-bold text-xs rounded-lg p-1.5 outline-none"
                  />
                  <span className="text-gray-400 text-xs">x</span>
                </div>
              </div>

              {/* Leverage Slider */}
              <input
                type="range"
                min="1"
                max={maxLeverageAllowed}
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />

              {/* Quick Leverage Presets Buttons */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <span className="text-[10px] text-gray-500 font-mono">Presets:</span>
                <div className="flex items-center space-x-1">
                  {getLeveragePresets(maxLeverageAllowed).map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setLeverage(lev)}
                      className={`px-2 py-1 rounded text-[10px] font-mono transition-all border ${
                        leverage === lev
                          ? 'bg-cyan-500 text-white border-cyan-400 font-bold'
                          : 'bg-[#111827] hover:bg-gray-800 border-gray-700 text-gray-300'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Time Scheduling & Multi-Account Selection */}
        <div className="space-y-4">
          {/* Target Account Selection */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Target Accounts for Parallel Dispatch</span>
              </label>
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetMode('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    targetMode === 'ALL' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  ALL ACCOUNTS
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('CUSTOM')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    targetMode === 'CUSTOM' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  SELECTIVE
                </button>
              </div>
            </div>

            {targetMode === 'CUSTOM' && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1 pr-1 font-mono">
                {accounts.length === 0 ? (
                  <div className="text-[10px] text-gray-500 italic">No custom accounts. Target: Demo Mode.</div>
                ) : (
                  accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleToggleAccount(acc.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-[#111827] border border-gray-800 text-xs text-left"
                    >
                      <span className="text-gray-300">{acc.accountName}</span>
                      {selectedAccountIds.includes(acc.id) ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* High Precision Time Picker */}
          <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Target Microsecond Execution Time</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">IST / UTC</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  className="w-full bg-[#111827] border border-gray-700 text-gray-200 text-xs rounded-xl p-2 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Hours : Minutes : Seconds . MS</label>
                <div className="flex items-center space-x-1 font-mono text-xs">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-10 text-center bg-[#111827] border border-gray-700 text-cyan-400 rounded-lg p-1.5 outline-none"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-10 text-center bg-[#111827] border border-gray-700 text-cyan-400 rounded-lg p-1.5 outline-none"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className="w-10 text-center bg-[#111827] border border-gray-700 text-cyan-400 rounded-lg p-1.5 outline-none"
                  />
                  <span>.</span>
                  <select
                    value={milliseconds}
                    onChange={(e) => setMilliseconds(e.target.value)}
                    className="bg-[#111827] border border-gray-700 text-amber-400 font-bold rounded-lg px-1.5 py-1.5 outline-none text-xs font-mono cursor-pointer"
                  >
                    <option value="000">.000 ms</option>
                    <option value="100">.100 ms</option>
                    <option value="200">.200 ms</option>
                    <option value="300">.300 ms</option>
                    <option value="400">.400 ms</option>
                    <option value="500">.500 ms</option>
                    <option value="600">.600 ms</option>
                    <option value="700">.700 ms</option>
                    <option value="800">.800 ms</option>
                    <option value="900">.900 ms</option>
                    <option value="990">.990 ms</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Offset Buttons */}
            <div className="flex items-center justify-between gap-1 pt-1">
              <span className="text-[10px] text-gray-500 font-mono">Presets:</span>
              <div className="flex items-center space-x-1">
                {[5, 10, 30, 60, 300].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => applyTimePreset(sec)}
                    className="px-2 py-1 rounded bg-[#111827] hover:bg-gray-800 border border-gray-700 text-[10px] font-mono text-cyan-400 transition-all"
                  >
                    +{sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Execution Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
              <span>SCHEDULE ORDER</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>EXECUTE NOW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
