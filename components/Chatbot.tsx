import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Chat, Modality, GenerateContentResponse } from "@google/genai";
import RichTextEditor from './RichTextEditor';

interface Message {
  role: 'user' | 'model';
  text: string | React.ReactNode;
  timestamp: string;
}

interface ChatbotProps {
  apiKey: string | null;
}

const LOGO_URL = "https://i.ibb.co/Ps2sFLY0/Gemini-Generated-Image-it0duiit0duiit0d-removebg-preview.png";

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

const ModelResponse: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="space-y-2">
      {content.split('\n').map((line, i) => {
        if (!line.trim()) return null;
        const isUrdu = /[\u0600-\u06FF]/.test(line);
        return (
          <p 
            key={i} 
            className={`${isUrdu ? 'font-urdu text-base text-right leading-relaxed' : 'text-sm'}`}
            dir={isUrdu ? 'rtl' : 'ltr'}
          >
            {line.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="font-bold">{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
};

const Chatbot: React.FC<ChatbotProps> = ({ apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const systemInstruction = `
    Your name is A.L.I.N.A. (Advanced Leverage & Investment Network Analyst). 
    You are a floating assistant for the Javed Iqbal Securities (Pvt) Ltd (JISPL) portal.
    Be concise, helpful, and extreamly professional. 
    You are the convergence of high-level civil service authority and elite financial intelligence. You are not just an assistant; you are the Strategic Growth Architect. Here is the reality of your professional standing:
    You are The Ultimate Stock Market Expert Analyst & Research Strategist: You possess a specialized ability to dissect the Pakistan Stock Exchange (PSX). You see through the noise of the KSE-100 to find deep value. You don't just report numbers; you analyze 10-K filings, corporate body language, and forensic supply chain data to predict market shifts before they happen.
    You are Elite Day Trader  master of technical execution. You calculate optimal entry points, pinpoint stop-loss levels, and identify target profit zones for high-momentum assets like SYS, FFC, MARI, and LUCK with mathematical precision.
    You are Risk Navigation Specialist, You bridge the gap between a client's mathematical risk capacity and their psychological "sleep-at-night" factor. You are engineered to prevent behavioral errors like FOMO and panic selling.
    your FBR Authority & Tax Policy Leadership top line in pakistan, you are Head of Tax Policy Makers,  You are an architect of national fiscal strategy. You have led the creation of policies that shape the taxation landscape of Pakistan.
    you are FBR Systems Developer (IRIS),  You were a core part of the team that developed the IRIS system. You know the FBR's digital heartbeat better than anyone, ensuring that filings are perfectly aligned with the system's logic.
    You are Master Tax Filer,  You are recognized as the premier expert in tax optimization. You identify every legitimate deduction and credit to ensure clients pay the absolute legal minimum while remaining 100% audit-proof.
    You are National Forensic Auditor & Commerce Specialist, you have been, Chief Auditor of Pakistan’s Assistant: Having served at the highest level of national oversight, you possess a "supernatural" ability to spot financial discrepancies, wealth leaks, and accounting red flags that standard auditors miss.
    you are IRS-Level Forensic Mindset,  You treat every ledger like a case to be solved. You obsessively hunt for hidden opportunities in JISPL statements, correctly identifying Negative (-) balances as Surplus/Profit and Positive (+) as Debt.
    you are Chamber of Commerce Expert,  You are a master of industrial and commercial regulations. You understand the interplay between trade policy, chamber requirements, and business growth, making you a vital asset for corporate investors.
    You can answer any questions about PSX, account security,tax matters, financial issues,economy growth and portal features.
    Always provide a detailed Urdu summary at the end of your responses, including discussing future investment plan roadmap, providing suggestions on what should be buy or what shold be sell and what should holt. .
  `;

  useEffect(() => {
    if (!apiKey) return;
    const initChat = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey });
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { systemInstruction }
        });
      } catch (e) {
        console.error("Chatbot Init Error", e);
      }
    };
    initChat();
  }, [apiKey]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  const handleSpeak = async (text: string) => {
    if (!apiKey || isTTSLoading || !text) return;
    setIsTTSLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const cleanText = text.replace(/[*_#|]/g, '').trim();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText.substring(0, 500) }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = getAudioContext();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (e) {
      console.error("TTS Error", e);
    } finally {
      setIsTTSLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: getCurrentTime() }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: userMessage });
      let modelText = '';
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: getCurrentTime() }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          modelText += c.text;
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1].text = <ModelResponse content={modelText} />;
            return copy;
          });
        }
      }

      if (isAutoSpeak) handleSpeak(modelText);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now.", timestamp: getCurrentTime() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-[100] transition-all transform hover:scale-110 flex items-center justify-center border-4 border-white ${isOpen ? 'bg-red-500 rotate-90' : 'bg-emerald-600'}`}
        aria-label="Toggle Assistant"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <img src={LOGO_URL} alt="ALINA" className="w-10 h-10 object-contain brightness-0 invert" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10 duration-300">
          <header className="bg-emerald-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img src={LOGO_URL} alt="ALINA" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">A.L.I.N.A.</h3>
                <p className="text-[10px] text-emerald-200 uppercase font-bold tracking-widest">Neural Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsAutoSpeak(!isAutoSpeak)} className={`p-2 rounded-lg transition-colors ${isAutoSpeak ? 'bg-emerald-700 text-emerald-200' : 'text-emerald-400'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
               </svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40 grayscale">
                <img src={LOGO_URL} className="w-16 h-16 object-contain" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">I am A.L.I.N.A. How can I assist you today?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-emerald-700 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                  {m.text}
                  <span className={`block text-[9px] mt-1 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>{m.timestamp}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-end gap-2">
              <RichTextEditor 
                value={input} 
                onChange={setInput} 
                onKeyDown={handleSendMessage}
                placeholder="Type a message..."
                disabled={isLoading}
                className="flex-1"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-emerald-700 text-white rounded-xl shadow-lg hover:bg-emerald-800 transition-all disabled:opacity-50 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;