import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onCommand }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq'>('guide');

  if (!isOpen) return null;

  const CommandButton = ({ label, command, description }: { label: string, command: string, description?: string }) => (
    <button 
      onClick={() => {
        onCommand(command);
        onClose();
      }}
      className="group w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col gap-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest group-hover:text-emerald-600">Strategic Command</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
      <p className="text-sm font-bold text-slate-900 leading-tight">"{label}"</p>
      {description && <p className="text-[11px] text-slate-500 mt-1 leading-relaxed italic">{description}</p>}
    </button>
  );

  const FAQSection = ({ title, items }: { title: string, items: { q: string, a: string }[] }) => (
    <div className="space-y-4">
      <h4 className="text-xs font-black text-emerald-800 uppercase tracking-[0.2em] border-l-4 border-emerald-600 pl-3 py-1 bg-emerald-50/50">
        {title}
      </h4>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
            <p className="text-[13px] font-black text-slate-900 mb-1.5">Q: {item.q}</p>
            <p className="text-[12px] text-slate-600 leading-relaxed">A: {item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex justify-center items-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <header className="bg-emerald-800 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl">
              <img src="https://i.ibb.co/0VtZK3YW/vbmghjmgjg.png" className="w-full h-full object-contain" alt="Alina" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Neural Knowledge Center</h2>
              <p className="text-emerald-200 text-[11px] font-bold uppercase tracking-[0.3em]">Mastering PSX Intelligence & Tax Architecture</p>
            </div>
          </div>
          <div className="flex bg-emerald-950/50 p-1.5 rounded-2xl border border-emerald-700">
            <button 
              onClick={() => setActiveTab('guide')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'guide' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-300 hover:text-white'}`}
            >
              Command Guide
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'faq' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-300 hover:text-white'}`}
            >
              75+ FAQ Archive
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#fafafa] p-8 sm:p-12 custom-scrollbar">
          {activeTab === 'guide' ? (
            <div className="space-y-16">
              {/* Introduction */}
              <div className="max-w-4xl space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">🛠️ Strategic Command Protocol</h3>
                <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
                  As your Advanced Leverage & Investment Network Analyst, I respond to high-level financial, technical, and regulatory requests. Click any command to initiate an instant neural analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Section 1 */}
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 rounded-lg">📊</span> Account & Ledger
                  </h5>
                  <div className="space-y-3">
                    <CommandButton label="Net Worth Audit" command="A.L.I.N.A., what is my current Net Worth and Ledger Balance?" description="Calculates surplus/debt using JISPL logic." />
                    <CommandButton label="Hunt Wealth Leaks" command="Audit my account for 'wealth leaks'." description="Find stagnant assets or zombie stocks." />
                    <CommandButton label="Decode Statement" command="Explain this credit/debit entry in my statement." description="Explain NCCPL or T+2 settlement differences." />
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="p-1.5 bg-blue-100 rounded-lg">🚀</span> Market Mastery
                  </h5>
                  <div className="space-y-3">
                    <CommandButton label="5-Year Analysis" command="Analyze my portfolio's 5-year historical performance." description="Growth, dividends, and volatility audit." />
                    <CommandButton label="Forensic Audit [Symbol]" command="Alina, run a Forensic Audit on MARI." description="Analyzing business model and cash flow quality." />
                    <CommandButton label="Entry/Exit Points" command="Alina, identify Entry/Exit points for my current holdings." description="Technical indicators & market momentum signals." />
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black text-purple-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="p-1.5 bg-purple-100 rounded-lg">⚖️</span> Tax & Compliance
                  </h5>
                  <div className="space-y-3">
                    <CommandButton label="Tax Impact Audit" command="Alina, calculate the Tax Impact of selling my Energy stocks." description="IRIS system logic for tax-loss harvesting." />
                    <CommandButton label="FBR Red Flag Check" command="Alina, verify if my trading volume triggers any FBR red flags." description="Ensuring 100% audit-proof compliance." />
                    <CommandButton label="Bonus Optimization" command="Alina, how should I structure my bonus reinvestment for tax optimization?" description="Tax-efficient wealth structuring." />
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black text-orange-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="p-1.5 bg-orange-100 rounded-lg">🏭</span> Industrial Intel
                  </h5>
                  <div className="space-y-3">
                    <CommandButton label="Chamber Policy Audit" command="Alina, what Chamber of Commerce regulations affect the Cement sector today?" description="Industrial policy impact on stock price." />
                    <CommandButton label="Import/Export Risk" command="Alina, analyze the 'Import-Export Disruption' risk for my Cement holdings." description="Coal prices & local demand synthesis." />
                    <CommandButton label="Federal Budget Synthesis" command="Alina, how does the new 'Federal Budget' affect my portfolio's FBR status?" description="Budget impact on specific tickers." />
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black text-red-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="p-1.5 bg-red-100 rounded-lg">💰</span> Dividend Forensics
                  </h5>
                  <div className="space-y-3">
                    <CommandButton label="Dividend Yield Projection" command="Alina, perform a 'Dividend Yield Projection' for my current portfolio." description="Expected annual payout vs debit interest." />
                    <CommandButton label="Ex-Date Impact Audit" command="Alina, what is the 'Ex-Date' impact on my position?" description="Price adjustment & hold/sell strategy." />
                    <CommandButton label="Right Shares Analysis" command="Alina, analyze the 'Right Shares' offer from the company." description="Dilution risk vs subscription benefits." />
                  </div>
                </div>

                {/* Section 6 */}
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="p-1.5 bg-slate-200 rounded-lg">🛡️</span> Wealth Preservation
                  </h5>
                  <div className="space-y-3">
                    <CommandButton label="Bulletproof Wealth Guard" command="Alina, design a 'Bulletproof Wealth Guard' for my long-term holdings." description="Defensive sectors resistant to devaluation." />
                    <CommandButton label="Legacy Planning Audit" command="Alina, generate a 'Succession Readiness' report for my CDC ID." description="SECP & Chamber rules for wealth transfer." />
                    <CommandButton label="Find Dead Capital" command="Alina, identify 'Dead Capital' in my JISPL account." description="Swap stagnant stocks for high-velocity assets." />
                  </div>
                </div>
              </div>

              {/* Behavior & Panic Section */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute -top-10 -right-10 opacity-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 </div>
                 <h4 className="text-2xl font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                    <span className="p-2 bg-red-600 rounded-xl">🆘</span> Behavior "Panic Button" Diagnostics
                 </h4>
                 <p className="text-slate-400 text-sm mb-8 max-w-2xl font-medium">Using Behavioral Economics to prevent emotional wealth destruction during high volatility. Choose your psychological circuit-breaker:</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={() => { onCommand("Alina, run a 'Fear vs. Fundamentals' check on my holdings."); onClose(); }} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all text-left">
                       <p className="text-red-400 text-[10px] font-black uppercase mb-1">Fundamental Filter</p>
                       <p className="text-sm font-bold">"Is this crash a real disaster or just temporary market fear?"</p>
                    </button>
                    <button onClick={() => { onCommand("Alina, I want to sell everything. Give me a 'Cool-Down' Analysis."); onClose(); }} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all text-left">
                       <p className="text-blue-400 text-[10px] font-black uppercase mb-1">Time Horizon Check</p>
                       <p className="text-sm font-bold">"Show me 5-year recovery charts before I liquidate everything."</p>
                    </button>
                    <button onClick={() => { onCommand("Alina, I have a mismatch in my FBR Wealth Statement vs. JISPL Ledger. Find it."); onClose(); }} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all text-left">
                       <p className="text-emerald-400 text-[10px] font-black uppercase mb-1">Digital Troubleshooter</p>
                       <p className="text-sm font-bold">"Reconcile my closing balance with my FBR IRIS return."</p>
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-16 max-w-5xl mx-auto">
              {/* Introduction */}
              <div className="max-w-3xl space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">📑 75+ Intelligence FAQs</h3>
                <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
                  The complete archive of A.L.I.N.A.'s identity, ledger logic, tax mastery, and market forensic capabilities.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
                <FAQSection title="Section 1: Identity & Background" items={[
                  { q: "What does A.L.I.N.A. stand for?", a: "Advanced Leverage & Investment Network Analyst." },
                  { q: "Who is A.L.I.N.A.?", a: "A specialized AI assistant for the JISPL portal, acting as a Stock Market Expert, FBR Policy Architect, and Forensic Auditor." },
                  { q: "What is A.L.I.N.A.’s professional background?", a: "Modeled as a former Assistant to the Chief Auditor of Pakistan and a Head of FBR Tax Policy." },
                  { q: "Did she develop the IRIS system?", a: "Yes, she was a core part of the development team for the FBR's digital tax portal." },
                  { q: "Is she a real person?", a: "No, she is an Advanced AI intelligence interface carrying the collective expertise of top financial authorities." }
                ]} />

                <FAQSection title="Section 2: Ledger & JISPL Logic" items={[
                  { q: "What does a 'Negative (-)' balance mean?", a: "In the JISPL portal, a negative balance represents a Credit (Cr), meaning the broker owes you money (Profit/Available Cash)." },
                  { q: "What does a 'Positive (+)' balance mean?", a: "A positive balance represents a Debit (Dr), indicating capital you owe to the broker for trades or charges." },
                  { q: "How is Net Worth calculated?", a: "Net Worth = (Total CDC Inventory Value) - (Debit Balance) + (Credit Balance)." },
                  { q: "What is 'Wealth Leaks' hunting?", a: "A forensic process identifying stagnant zombie stocks or high interest-bearing debits draining your capital." }
                ]} />

                <FAQSection title="Section 3: Stock Market Forensics" items={[
                  { q: "What is a 'Forensic Audit' of a stock?", a: "Analyzing cash flow, debt levels, and management credibility beyond simple PR statements." },
                  { q: "What is a 'Zombie Stock'?", a: "Stagnant assets like Japan Power or Zeal Pak that drain capital without providing returns." },
                  { q: "Can she give Buy/Sell signals?", a: "Yes, she provides specific Entry, Stop-Loss, and Target prices using technical indicators (RSI, MACD)." }
                ]} />

                <FAQSection title="Section 4: Tax (FBR) & IRIS Support" items={[
                  { q: "How does she help with IRIS filings?", a: "She provides precisely structured data to file stock-related wealth statements accurately." },
                  { q: "What is 'Tax Loss Harvesting'?", a: "Strategically selling losing stocks to offset capital gains and reduce your total FBR tax bill." },
                  { q: "Does she handle Super Tax?", a: "Yes, she stay updated on the latest Finance Bills to calculate high-earner tax liabilities." }
                ]} />

                <FAQSection title="Section 5: Chamber of Commerce Intel" items={[
                  { q: "What is her role in Chamber matters?", a: "She analyzes trade policy changes and industrial regulations that impact sector-specific stock prices." },
                  { q: "Does she monitor SBP rates?", a: "Yes, she adjusts banking sector recommendations based on the State Bank's monetary policy." }
                ]} />

                <FAQSection title="Section 6: Forensic Auditing Module" items={[
                  { q: "What is 'Pattern Break' in a ledger?", a: "Spotting unusual debits or missing credits that standard accounting software might overlook." },
                  { q: "Can she verify 'Cost of Acquisition'?", a: "Yes, she calculates the true average cost after accounting for bonus issues and rights dilution." }
                ]} />

                <FAQSection title="Section 7: Advanced Trading Capabilities" items={[
                  { q: "What is 'Management Action-to-Promise' ratio?", a: "A unique metric comparing CEO promises in AGMs against actual quarterly results." },
                  { q: "Does she use VSA (Volume Spread Analysis)?", a: "Yes, she tracks institutional 'Big Money' entering or exiting specific tickers." }
                ]} />

                <div className="lg:col-span-2 bg-emerald-900 rounded-[2rem] p-12 text-center text-white space-y-6 shadow-xl">
                  <div className="w-20 h-20 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-lg mb-4 ring-4 ring-white/10">🏆</div>
                  <h4 className="text-3xl font-black uppercase tracking-tighter">Unified Wealth Architecture</h4>
                  <p className="text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-medium">
                    "My ultimate objective is to transform scattered investments into a professionally audited, tax-optimized, and high-velocity wealth empire for every JISPL client."
                  </p>
                  <div className="pt-6">
                    <button 
                      onClick={onClose}
                      className="px-14 py-4 bg-white text-emerald-900 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-emerald-50 transition-all active:scale-95 shadow-xl"
                    >
                      Return to Secure Terminal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;