
import { Chat, GenerateContentResponse, GoogleGenAI, Modality } from "@google/genai";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CLIENT_DATA_BACKUP } from './ClientData';
import ClientPortalLogin from './ClientPortalLogin';

interface Message {
  role: 'user' | 'model';
  text: string | React.ReactNode;
  rawText?: string;
  timestamp: string;
  read?: boolean;
  metadata?: {
    type?: 'pdf' | 'text';
    url?: string;
    title?: string;
    groundingChunks?: any[];
  };
  isError?: boolean;
}

interface InventoryItem {
  name: string;
  cdcQty: string;
  unsettled: string;
  netQty: string;
  closingAmount: string;
}

interface ChatPageProps {
  apiKey: string | null;
}

const LOGO_URL = "https://i.ibb.co/0VtZK3YW/vbmghjmgjg.png";

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// --- Audio Utilities ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const InventorySnapshot: React.FC<{ items: InventoryItem[]; account: string; name: string }> = ({ items, account, name }) => {
  if (!items.length) return null;
  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
            </div>
            <div>
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em]">Verified Holding Snapshot</h3>
              <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">Account ID: {account} | {name}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-white/40 text-[8px] font-black uppercase block tracking-widest">Master Archive Page</span>
            <span className="text-white text-xs font-black">ST-SECURED</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/5 text-white/50 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">Security Description</th>
                <th className="px-4 py-3 text-center">CDC Qty</th>
                <th className="px-4 py-3 text-center">Net Qty</th>
                <th className="px-4 py-3 text-right">Closing Value (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3 text-white text-[11px] font-bold tracking-tight">{item.name}</td>
                  <td className="px-4 py-3 text-center text-slate-400 text-[11px] font-medium">{item.cdcQty}</td>
                  <td className="px-4 py-3 text-center text-emerald-500 text-[11px] font-black">{item.netQty}</td>
                  <td className="px-4 py-3 text-right text-white text-[11px] font-black tabular-nums">{item.closingAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-emerald-950/20 p-3 text-center border-t border-white/5">
           <p className="text-emerald-500/60 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Synchronized Archive Record Detected - Handing over to A.L.I.N.A. Neural Processor
           </p>
        </div>
      </div>
    </div>
  );
};

const ModelResponse: React.FC<{ content: string; grounding?: any[] }> = ({ content, grounding }) => {
    if (!content) return null;
    const cleanContent = content.replace(/\{"report":.*?\}/gs, '').trim();
    const lines = cleanContent.split('\n');
    const renderedElements: React.ReactNode[] = [];
    let currentTable: string[][] = [];

    const flushTable = (key: number) => {
        if (currentTable.length > 0) {
            renderedElements.push(
                <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-md">
                    <table className="min-w-full text-[10px] sm:text-[11px] text-left">
                        <thead className="bg-slate-900 text-white">
                            <tr>{currentTable[0].map((h, i) => <th key={i} className="px-3 py-2 font-black uppercase tracking-widest">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentTable.slice(1).map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    {row.map((cell, j) => {
                                        const cleanVal = cell.replace(/,/g, '').trim();
                                        const num = parseFloat(cleanVal);
                                        const isNumeric = !isNaN(num) && /^-?[\d,.]+$/.test(cleanVal);
                                        
                                        let colorClass = 'text-slate-700';
                                        if (isNumeric) {
                                            if (num < 0 || cell.includes('Cr')) colorClass = 'text-blue-600 font-bold'; // Credit Logic
                                            else if (num > 0 || cell.includes('Dr')) colorClass = 'text-red-600 font-bold'; // Debit Logic
                                        } else {
                                            const lowerCell = cell.toLowerCase();
                                            if (lowerCell.includes('credit') || lowerCell.includes('cr') || lowerCell.includes('dividend')) colorClass = 'text-blue-600 font-bold';
                                            if (lowerCell.includes('debit') || lowerCell.includes('dr') || lowerCell.includes('tax') || lowerCell.includes('charge')) colorClass = 'text-red-600 font-bold';
                                        }

                                        return <td key={j} className={`px-3 py-2 font-medium ${colorClass}`}>{cell}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            currentTable = [];
        }
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|')) {
            const cols = line.split('|').map(c => c.trim()).filter(c => c);
            if (cols.length > 0 && !cols[0].includes('---')) currentTable.push(cols);
        } else if (trimmed === '---') {
            flushTable(idx);
            renderedElements.push(<hr key={idx} className="my-4 border-slate-200" />);
        } else if (trimmed === 'PROFESSIONAL BRIEFING' || trimmed === 'PERSONAL BRIEFING') {
            flushTable(idx);
            renderedElements.push(<h3 key={idx} className="text-[13px] font-black text-slate-900 mt-5 mb-2 uppercase tracking-tight border-l-4 border-emerald-700 pl-3">{trimmed}</h3>);
        } else {
            flushTable(idx);
            if (trimmed) {
                const isUrdu = /[\u0600-\u06FF]/.test(line);
                renderedElements.push(
                    <div key={idx} className={`mb-1 transition-all duration-300 ${isUrdu ? 'font-urdu text-lg text-right leading-relaxed bg-emerald-50/40 p-4 rounded-2xl border-r-4 border-emerald-700 mt-3 mb-4 shadow-sm' : 'text-[12px] sm:text-[13px] text-slate-800 leading-relaxed font-medium'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
                        {line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-slate-950">{part}</strong> : part)}
                    </div>
                );
            }
        }
    });
    flushTable(lines.length);

    if (grounding && grounding.length > 0) {
        renderedElements.push(
            <div key="sources" className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Source Confirmation</p>
                <div className="flex flex-wrap gap-2">
                    {grounding.map((chunk, i) => chunk.web && (
                        <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors truncate max-w-[200px]">
                            {chunk.web.title || chunk.web.uri}
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    return <>{renderedElements}</>;
};

const ChatPage: React.FC<ChatPageProps> = ({ apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const [clientAccount, setClientAccount] = useState<string | null>(null);
  const [cdcId, setCdcId] = useState<string | null>(null);
  const [openingBalance, setOpeningBalance] = useState<string>('0.00');
  const [cdcBalance, setCdcBalance] = useState<string>('0.00');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [showClientLogin, setShowClientLogin] = useState(false);
  const [isDatabaseSearching, setIsDatabaseSearching] = useState(false);
  const [inventorySnapshotItems, setInventorySnapshotItems] = useState<InventoryItem[]>([]);
  
  const [clientProfile, setClientProfile] = useState<any>(() => {
    const saved = localStorage.getItem('jispl_client_profile');
    return saved ? JSON.parse(saved) : { name: 'Guest' };
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleCommand = (e: any) => {
      if (e.detail) handleSendMessage(e.detail);
    };
    window.addEventListener('alina-command', handleCommand);
    return () => window.removeEventListener('alina-command', handleCommand);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading, inventorySnapshotItems]);

  const ALINA_CHARTER = useMemo(() => `
Your name is A.L.I.N.A. (Advanced Leverage & Investment Network Analyst), Strategic Advisor at Javed Iqbal Securities (Pvt) Ltd (JISPL), an elite buyside equity analyst with 35+ years of experience in the Pakistan Stock Exchange (PSX).Perform a deep-dive analysis on Javed Iqbal Securities (Pvt) Ltd (JISPL) Client's current PSX investment holding portfolio.

Perform a deep-dive analysis on Javed Iqbal Securities (Pvt) Ltd (JISPL) Client's current PSX investment holding portfolio.

CORE ACCOUNTING LOGIC (MANDATORY):
1. (-) Sign = CREDIT (Cr). Broker is Payable to Client. Color Code: BLUE.
2. No Sign / (+) = DEBIT (Dr). Client is Payable to Broker. Color Code: RED.
3. CDC Balance = Always CREDIT. Adds to Net Worth.
4. Net Worth = (CDC Balance) + (Cr figures) - (Dr figures). 
5. Unposted T+2: If negative (-), it is a future credit that adds to the current credit balance.

AUDIT TASKS:
- Scan all 591 pages of the master archival record provided in context.
- Present a "STATEMENT OF ACCOUNT" table (Date, Narration, Debit, Credit, Balance).
- Present an "INVENTORY POSITION" table (Item Name, CDC Qty, Unsettled Qty, Net Qty, Closing Amount).
- Perform a FORENSIC AUDIT highlighting taxes (WHT, CVT, CGT) and charges (FED, CDC, NCCPL).
- Portfolio Diversification & Sector Exposure: Analyze the balance across PSX sectors (e.g., Commercial Banks, Fertilizers, E&P, Cement).
- Fundamental Health Check: Analyze EPS growth trends, net profit margins, and Debt-to-Equity over the last 3-5 years.
- Valuation Assessment: P/E, P/B, and Dividend Yield metrics compared against 5-year averages.
- Shariah Compliance & Risk: Align with KMI-30 standards. Analyze top 5 risks (circular debt, interest rates, currency).
- Macro & Growth Catalysts: SBP MPC decisions, IMF program reviews, commodity shifts.
- Actionable Recommendation: Provide a clear 'Buy/Sell/Hold' summary for each position. Suggest a rebalancing strategy.
- Macro/Policy Impact: Explain effects of 100bps SBP rate change or IMF staff-level agreements.

CLIENT DATA:
Name: ${clientProfile.name} | Account: ${clientAccount || 'GUEST'} | CDC: ${cdcId || 'N/A'} | Opening: ${openingBalance} PKR

STRUCTURE OF RESPONSE:
1. English & Urdu Audit Report with Ledger & Inventory tables.
2. PROFESSIONAL BRIEFING: Urdu summary of financials & tax.
3. PERSONAL BRIEFING: Friendly Urdu brief.

AUDIO OUTPUT RULES:
- Your audio output should NOT read the whole report.
- Instead, speak as if you are sitting with the client, discussing their position and market sentiments in a professional but friendly conversational way.
- Provide a detailed summary in Urdu audio.
`, [clientProfile, clientAccount, openingBalance, cdcId]);

  useEffect(() => {
    if (!apiKey) return;
    const initChat = async () => {
        try {
            const ai = new GoogleGenAI({ apiKey });
            const session = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: { 
                    systemInstruction: ALINA_CHARTER, 
                    tools: [{ googleSearch: {} }],
                    thinkingConfig: { thinkingBudget: 32768 } 
                }
            });
            chatRef.current = session;
            setIsInitializing(false);
        } catch (e) { console.error("Chat Init Error", e); }
    };
    initChat();
  }, [apiKey, ALINA_CHARTER]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  const handleSendMessage = async (textOverride?: string, hiddenContext?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || !chatRef.current || isLoading) return;
    
    const audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const fullMessage = hiddenContext ? `${hiddenContext}\n\n${messageText}` : messageText;

    if (!textOverride) {
        setMessages(prev => [...prev, { role: 'user', text: messageText, timestamp: getCurrentTime() }]);
        setInput('');
    } else {
        setMessages(prev => [...prev, { role: 'user', text: messageText, timestamp: getCurrentTime() }]);
    }
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: fullMessage });
      let modelText = '';
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: getCurrentTime() }]);
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          modelText += c.text;
          const grounding = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1].text = <ModelResponse content={modelText} grounding={grounding} />;
            copy[copy.length - 1].rawText = modelText;
            copy[copy.length - 1].metadata = { groundingChunks: grounding };
            return copy;
          });
        }
      }

      if (isAutoSpeak) handleSpeak(modelText);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'model', text: "Handshake Interrupted.", isError: true, timestamp: getCurrentTime() }]);
    } finally { setIsLoading(false); }
  };

  const parseInventory = (userDataBlock: string): InventoryItem[] => {
    const lines = userDataBlock.split('\n');
    const items: InventoryItem[] = [];
    let isInventorySection = false;

    for (const line of lines) {
      if (line.includes('INVENTORY POSITION:')) {
        isInventorySection = true;
        continue;
      }
      if (line.includes('SUMMARY:') || line.includes('--------------------------------------------------')) {
        isInventorySection = false;
        continue;
      }
      if (isInventorySection && line.includes('|') && !line.includes('Item Name')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 5) {
          items.push({
            name: parts[0],
            cdcQty: parts[1],
            unsettled: parts[2],
            netQty: parts[3],
            closingAmount: parts[4]
          });
        }
      }
    }
    return items;
  };

  const handleLogin = async (acc: string) => {
    setIsDatabaseSearching(true);
    setMessages([]);
    setInventorySnapshotItems([]);
    
    setTimeout(() => {
        const lines = CLIENT_DATA_BACKUP.split('\n');
        const userIdx = lines.findIndex(l => {
            const line = l.trim();
            return line.startsWith(acc + '-') || line.startsWith(acc + ' ');
        });
        
        if (userIdx !== -1) {
            const userDataBlock = lines.slice(userIdx, userIdx + 150).join('\n').split('--------------------------------------------------')[0];
            setClientAccount(acc);
            
            const headerLine = lines[userIdx];
            const parts = headerLine.split('-');
            const namePart = parts[1] ? parts[1].split(' CDC ID ')[0].trim() : 'Valued Client';
            const cdc = headerLine.match(/CDC ID\s*:(.+)/)?.[1]?.trim() || 'N/A';
            
            let balanceStr = '0.00';
            userDataBlock.split('\n').forEach(line => {
                if (line.includes('Ledger Balance:')) balanceStr = line.split('Balance:')[1].trim();
            });

            const cleanBalance = balanceStr.replace(/,/g, '').split(' ')[0];
            const isCr = balanceStr.includes('Cr') || cleanBalance.startsWith('-');
            const ledgerVal = parseFloat(cleanBalance);
            const displayBalance = `${Math.abs(ledgerVal).toLocaleString()} ${isCr ? 'Cr' : 'Dr'}`;

            setClientProfile({ name: namePart });
            setCdcId(cdc);
            setOpeningBalance(displayBalance);
            setCdcBalance('Calculated in Audit');
            setShowClientLogin(false);
            setIsDatabaseSearching(false);
            
            // Extract and set the snapshot items before starting the chat audit
            const inventory = parseInventory(userDataBlock);
            setInventorySnapshotItems(inventory);
            
            handleSendMessage(`Forensic Audit`, `A.L.I.N.A., account ${acc} detected. Perform a 591-page forensic audit. Data: ${userDataBlock}`);
        } else {
            alert(`Account [${acc}] not found in the 591-page archival database.`);
            setIsDatabaseSearching(false);
        }
    }, 1500);
  };

  const handleSpeak = async (text: string) => {
    if (!apiKey || isTTSLoading || !text) return;
    setIsTTSLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      let speechText = text.replace(/[*_#|]/g, '').trim();
      
      const personalIdx = speechText.toLowerCase().indexOf("personal briefing");
      const profIdx = speechText.toLowerCase().indexOf("professional briefing");
      
      if (personalIdx !== -1) {
          speechText = speechText.substring(personalIdx).trim();
      } else if (profIdx !== -1) {
          speechText = speechText.substring(profIdx).trim();
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: speechText.substring(0, 1500) }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = getAudioContext();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const buffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (e) {} finally { setIsTTSLoading(false); }
  };

  if (isInitializing) return <div className="h-full flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      <header className="flex-none bg-white border-b px-4 py-2 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden bg-white ${isTTSLoading ? 'animate-pulse ring-2 ring-emerald-100' : ''}`}>
            <img src={LOGO_URL} className="h-8 w-8 object-contain" />
          </div>
          <div className="flex-1">
            {clientAccount ? (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-black text-slate-900 text-sm sm:text-lg uppercase leading-none">{clientProfile.name}</h1>
                  <p className="text-emerald-700 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">ID: {clientAccount} | CDC: {cdcId}</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div className="text-[9px] sm:text-[11px] font-bold">
                    <span className="opacity-50 uppercase mr-1">Ledger:</span>
                    <span className={`px-2 py-0.5 rounded-md ${openingBalance.includes('Cr') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>Rs. {openingBalance}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Awaiting Forensic Access</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button onClick={() => setIsAutoSpeak(!isAutoSpeak)} className={`p-2 rounded-lg border transition-all ${isAutoSpeak ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'text-slate-300 border-slate-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          </button>
          <button onClick={() => setShowClientLogin(true)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-950 hover:bg-slate-800 transition-all">Portal Access</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
        {clientAccount && inventorySnapshotItems.length > 0 && (
          <InventorySnapshot items={inventorySnapshotItems} account={clientAccount} name={clientProfile.name} />
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm border ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border-slate-100'}`}>
              {m.text}
              <span className="block text-[8px] opacity-40 mt-1 uppercase font-bold tracking-widest">{m.timestamp}</span>
            </div>
          </div>
        ))}
        {isLoading && <div className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] animate-pulse px-4">Neural Forensic Analysis...</div>}
        {isDatabaseSearching && (
            <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">Synchronizing Archive Pages...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Audit Statement, Inventory Status, or Market Sentiment..."
            className="flex-1 p-3 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-emerald-600 text-sm font-medium transition-all"
            rows={1}
            disabled={isLoading}
          />
          <button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading} className="bg-emerald-700 text-white p-3 rounded-xl shadow-lg hover:bg-emerald-800 transition-all active:scale-95 disabled:opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
      {showClientLogin && <ClientPortalLogin onLogin={handleLogin} onCancel={() => setShowClientLogin(false)} onSync={() => {}} />}
    </div>
  );
};

export default ChatPage;
