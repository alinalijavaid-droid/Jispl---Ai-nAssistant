import React, { useState, useEffect } from 'react';

export interface StockHolding {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Buy' | 'Sell';
  symbol: string;
  quantity: number;
  price: number;
}

export interface ClientProfile {
  name: string;
  riskProfile: 'Low' | 'Medium' | 'High';
  investmentGoal: string;
  cashBalance: number;
  holdings: StockHolding[];
  transactions: Transaction[];
}

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: ClientProfile) => void;
  initialProfile: ClientProfile;
}

const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ isOpen, onClose, onSave, initialProfile }) => {
  const [profile, setProfile] = useState<ClientProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'transactions'>('profile');

  // Temporary state for adding a new holding
  const [newHolding, setNewHolding] = useState<StockHolding>({ symbol: '', quantity: 0, avgPrice: 0 });

  // Temporary state for adding a new transaction
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Buy',
    symbol: '',
    quantity: 0,
    price: 0
  });

  useEffect(() => {
    setProfile({
        ...initialProfile,
        transactions: initialProfile.transactions || []
    });
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(profile);
    onClose();
  };

  const addHolding = () => {
    if (newHolding.symbol && newHolding.quantity > 0 && newHolding.avgPrice > 0) {
      setProfile({
        ...profile,
        holdings: [...profile.holdings, newHolding]
      });
      setNewHolding({ symbol: '', quantity: 0, avgPrice: 0 });
    }
  };

  const removeHolding = (index: number) => {
    const updatedHoldings = profile.holdings.filter((_, i) => i !== index);
    setProfile({ ...profile, holdings: updatedHoldings });
  };

  const clearAllHoldings = () => {
    if (confirm("Are you sure you want to clear all holdings?")) {
        setProfile({ ...profile, holdings: [] });
    }
  };

  const addTransaction = () => {
      if (newTransaction.symbol && newTransaction.quantity > 0 && newTransaction.price > 0) {
          const transaction: Transaction = {
              ...newTransaction,
              id: Date.now().toString(),
              symbol: newTransaction.symbol.toUpperCase()
          };
          setProfile(prev => ({
              ...prev,
              transactions: [transaction, ...prev.transactions]
          }));
          setNewTransaction({
              id: '',
              date: new Date().toISOString().split('T')[0],
              type: 'Buy',
              symbol: '',
              quantity: 0,
              price: 0
          });
      }
  };

  const removeTransaction = (id: string) => {
      setProfile(prev => ({
          ...prev,
          transactions: prev.transactions.filter(t => t.id !== id)
      }));
  };

  const isHoldingValid = newHolding.symbol.trim().length >= 2 && newHolding.quantity > 0 && newHolding.avgPrice > 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-6 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Alina Memory Bank
                </h2>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Synchronize Client Knowledge</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 bg-gray-50/50">
          {['profile', 'portfolio', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'text-emerald-700 border-b-4 border-emerald-600 bg-white' 
                : 'text-gray-400 hover:text-emerald-600 hover:bg-white/50'
              }`}
            >
              {tab === 'portfolio' ? 'Holdings' : tab === 'transactions' ? 'History' : 'Client Profile'}
            </button>
          ))}
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Preferred Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                  placeholder="e.g. Mr. Khan"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Risk Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setProfile({ ...profile, riskProfile: option as any })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all border-2 uppercase tracking-wider ${
                        profile.riskProfile === option
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-md scale-105'
                          : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Investment Goal</label>
                <textarea
                  value={profile.investmentGoal}
                  onChange={(e) => setProfile({ ...profile, investmentGoal: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all font-medium text-sm h-24 resize-none"
                  placeholder="e.g. Aggressive 5-year growth for retirement planning..."
                />
              </div>
            </div>
          ) : activeTab === 'portfolio' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cash Balance (PKR)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">PKR</span>
                    <input
                        type="number"
                        value={profile.cashBalance || ''}
                        onChange={(e) => setProfile({ ...profile, cashBalance: Number(e.target.value) })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all font-bold text-sm text-emerald-800"
                        placeholder="0.00"
                    />
                </div>
                <p className="text-[9px] text-slate-400 mt-2 italic font-medium">Note: Positive values indicate Debit (Debt). Negative values indicate Credit (Surplus).</p>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Inventory Data Entry</label>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Manual Sync</span>
                </div>
                
                {/* Add New Holding Grid */}
                <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Symbol (e.g. SYS)</label>
                        <input
                            type="text"
                            placeholder="Ticker"
                            value={newHolding.symbol}
                            onChange={(e) => setNewHolding({...newHolding, symbol: e.target.value.toUpperCase()})}
                            className="px-4 py-2.5 rounded-xl text-sm border-2 border-white focus:border-emerald-500 outline-none font-bold uppercase"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Volume</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={newHolding.quantity || ''}
                            onChange={(e) => setNewHolding({...newHolding, quantity: Math.max(0, Number(e.target.value))})}
                            className="px-4 py-2.5 rounded-xl text-sm border-2 border-white focus:border-emerald-500 outline-none font-bold"
                        />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Avg Buy Price</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newHolding.avgPrice || ''}
                            onChange={(e) => setNewHolding({...newHolding, avgPrice: Math.max(0, Number(e.target.value))})}
                            className="px-4 py-2.5 rounded-xl text-sm border-2 border-white focus:border-emerald-500 outline-none font-bold"
                        />
                    </div>
                    <button 
                        onClick={addHolding}
                        disabled={!isHoldingValid}
                        className="h-[46px] w-full bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        Add Position
                    </button>
                  </div>
                </div>

                {/* List Holdings */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Inventory ({profile.holdings.length})</h4>
                    {profile.holdings.length > 0 && (
                        <button onClick={clearAllHoldings} className="text-[9px] font-bold text-red-500 hover:underline uppercase">Clear All</button>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {profile.holdings.length === 0 && (
                        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Active Holdings in Memory</p>
                        </div>
                    )}
                    {profile.holdings.map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white border-2 border-slate-50 p-3 rounded-2xl hover:border-emerald-100 transition-all shadow-sm group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-black text-xs">
                                    {h.symbol.substring(0, 3)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-900 text-sm uppercase">{h.symbol}</span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">Ticker</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                        {h.quantity.toLocaleString()} Shares <span className="mx-1">•</span> Avg @ {h.avgPrice.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeHolding(idx)} 
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Remove Position"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
                <div className="bg-slate-900 p-5 rounded-2xl border-2 border-slate-800 shadow-xl space-y-4">
                    <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Manual Transaction Entry</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="bg-slate-800 text-white p-2.5 rounded-xl text-xs border border-slate-700 outline-none focus:border-emerald-500" />
                        <select value={newTransaction.type} onChange={e => setNewTransaction({...newTransaction, type: e.target.value as 'Buy' | 'Sell'})} className="bg-slate-800 text-white p-2.5 rounded-xl text-xs border border-slate-700 outline-none focus:border-emerald-500">
                            <option value="Buy">BUY / LONG</option>
                            <option value="Sell">SELL / SHORT</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="Symbol" value={newTransaction.symbol} onChange={e => setNewTransaction({...newTransaction, symbol: e.target.value})} className="bg-slate-800 text-white p-2.5 rounded-xl text-xs border border-slate-700 outline-none focus:border-emerald-500 uppercase font-bold" />
                        <input type="number" placeholder="Qty" value={newTransaction.quantity || ''} onChange={e => setNewTransaction({...newTransaction, quantity: parseFloat(e.target.value)})} className="bg-slate-800 text-white p-2.5 rounded-xl text-xs border border-slate-700 outline-none focus:border-emerald-500 font-bold" />
                        <input type="number" placeholder="Price" value={newTransaction.price || ''} onChange={e => setNewTransaction({...newTransaction, price: parseFloat(e.target.value)})} className="bg-slate-800 text-white p-2.5 rounded-xl text-xs border border-slate-700 outline-none focus:border-emerald-500 font-bold" />
                    </div>
                    <button onClick={addTransaction} className="w-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-emerald-500 shadow-lg transition-all active:scale-95">Record Trade</button>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Transaction History Audit</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {(!profile.transactions || profile.transactions.length === 0) && (
                            <p className="text-[10px] font-black text-slate-300 uppercase text-center py-6 tracking-widest">No Historical Records</p>
                        )}
                        {profile.transactions?.map((t) => (
                            <div key={t.id} className="flex justify-between items-center bg-white border-2 border-slate-50 p-3 rounded-2xl text-[11px] font-medium group">
                                <div className="flex gap-3 items-center">
                                    <span className={`font-black px-2 py-0.5 rounded-md text-[9px] uppercase tracking-tighter ${t.type === 'Buy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{t.type}</span>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 uppercase">{t.symbol}</span>
                                        <span className="text-[9px] text-slate-400 uppercase font-bold">{t.date}</span>
                                    </div>
                                    <div className="ml-2">
                                        <span className="text-slate-700 font-bold">{t.quantity.toLocaleString()}</span> @ <span className="text-slate-900 font-black">{t.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => removeTransaction(t.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-emerald-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-emerald-900 transition-all active:scale-95 border-b-4 border-emerald-950"
          >
            Save Memory
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileModal;