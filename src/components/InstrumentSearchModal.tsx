import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Star, Flame, Sparkles, TrendingUp, TrendingDown, Clock, Layers } from 'lucide-react';
import { InstrumentContract, InstrumentCategory } from '../types';

interface InstrumentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruments: InstrumentContract[];
  selectedSymbol: string;
  onSelectInstrument: (instrument: InstrumentContract) => void;
}

export const InstrumentSearchModal: React.FC<InstrumentSearchModalProps> = ({
  isOpen,
  onClose,
  instruments,
  selectedSymbol,
  onSelectInstrument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InstrumentCategory>('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('BINGX_FAVORITE_SYMBOLS');
      return saved ? JSON.parse(saved) : ['XAU-USDT', 'BTC-USDT', 'ETH-USDT', 'EUR-USDT'];
    } catch {
      return ['XAU-USDT', 'BTC-USDT', 'ETH-USDT', 'EUR-USDT'];
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('BINGX_RECENT_SEARCHES');
      return saved ? JSON.parse(saved) : ['XAU-USDT', 'EUR-USDT', 'BTC-USDT'];
    } catch {
      return ['XAU-USDT', 'EUR-USDT', 'BTC-USDT'];
    }
  });

  // Save favorites & recents
  const toggleFavorite = (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(sym)) {
      updated = favorites.filter((f) => f !== sym);
    } else {
      updated = [...favorites, sym];
    }
    setFavorites(updated);
    localStorage.setItem('BINGX_FAVORITE_SYMBOLS', JSON.stringify(updated));
  };

  const handleSelect = (inst: InstrumentContract) => {
    // Add to recent searches
    const updatedRecents = [inst.displaySymbol, ...recentSearches.filter((s) => s !== inst.displaySymbol)].slice(0, 6);
    setRecentSearches(updatedRecents);
    localStorage.setItem('BINGX_RECENT_SEARCHES', JSON.stringify(updatedRecents));

    onSelectInstrument(inst);
    onClose();
  };

  const filteredList = useMemo(() => {
    let list = instruments;

    // Filter Category
    if (selectedCategory === 'Favorites') {
      list = list.filter((item) => favorites.includes(item.displaySymbol));
    } else if (selectedCategory !== 'All') {
      list = list.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.displaySymbol.toLowerCase().includes(q) ||
          item.displayName.toLowerCase().includes(q) ||
          item.asset.toLowerCase().includes(q) ||
          item.symbol.toLowerCase().includes(q)
      );
    }

    return list;
  }, [instruments, selectedCategory, searchQuery, favorites]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-sans">
        {/* Header & Search Bar */}
        <div className="p-5 border-b border-gray-800 space-y-4 bg-[#0b0f19]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Search className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-gray-100">BingX Instrument Search</h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search Gold (XAU), EUR, BTC, SOL, PEPE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-gray-700 text-gray-100 text-sm rounded-2xl pl-10 pr-10 py-3 font-mono outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            {(['All', 'Favorites', 'Commodities', 'Forex', 'Crypto', 'Indices'] as InstrumentCategory[]).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center space-x-1 border ${
                    isActive
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-[#111827] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {cat === 'Favorites' && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  {cat === 'Commodities' && <span>🥇</span>}
                  {cat === 'Forex' && <span>💱</span>}
                  {cat === 'Crypto' && <span>🚀</span>}
                  {cat === 'Indices' && <span>📈</span>}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Search Chips */}
        {recentSearches.length > 0 && !searchQuery && (
          <div className="px-5 py-2.5 bg-[#0b0f19]/50 border-b border-gray-800/60 flex items-center space-x-2 text-xs font-mono overflow-x-auto">
            <span className="text-gray-500 text-[10px] uppercase font-bold flex items-center space-x-1 shrink-0">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Recent:</span>
            </span>
            <div className="flex items-center space-x-1.5">
              {recentSearches.map((sym) => (
                <button
                  key={sym}
                  onClick={() => setSearchQuery(sym)}
                  className="px-2.5 py-0.5 rounded-lg bg-[#111827] hover:bg-gray-800 text-gray-300 border border-gray-800 text-[11px] font-bold transition-all"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instruments List Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs font-mono bg-[#0b0f19] rounded-2xl border border-gray-800">
              No instruments found matching "{searchQuery}".
            </div>
          ) : (
            filteredList.map((inst) => {
              const isSelected = selectedSymbol.toUpperCase() === inst.displaySymbol.toUpperCase();
              const isFav = favorites.includes(inst.displaySymbol);
              const isPositive = inst.priceChangePercent >= 0;

              return (
                <div
                  key={inst.symbol}
                  onClick={() => handleSelect(inst)}
                  className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer font-mono transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-[#0b0f19] border-gray-800/80 hover:border-gray-700 hover:bg-gray-800/40'
                  }`}
                >
                  {/* Left Info */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => toggleFavorite(inst.displaySymbol, e)}
                      className="p-1 text-gray-600 hover:text-amber-400 transition-colors"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-gray-100">{inst.displaySymbol}</span>

                        {inst.category === 'Commodities' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            GOLD 🥇
                          </span>
                        )}

                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {inst.maxLeverage}x Max
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {inst.displayName} • {inst.category}
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Change */}
                  <div className="text-right">
                    <div className="font-bold text-sm text-gray-100">
                      ${inst.lastPrice ? inst.lastPrice.toLocaleString() : '---'}
                    </div>

                    <div className={`text-[11px] font-bold flex items-center justify-end space-x-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPositive ? '+' : ''}{inst.priceChangePercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0b0f19] border-t border-gray-800 text-[10px] text-gray-500 font-mono text-center flex items-center justify-between px-5">
          <span>Total Catalog: {instruments.length} Instruments</span>
          <span>BingX Swap V2 Perpetual API</span>
        </div>
      </div>
    </div>
  );
};
