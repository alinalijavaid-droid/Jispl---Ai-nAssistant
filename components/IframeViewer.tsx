
import React, { useState, useEffect, useCallback } from 'react';

interface IframeViewerProps {
  src: string;
  headerHeight: number;
  footerHeight: number;
}

type ErrorType = 'timeout' | 'offline' | 'security' | 'generic' | null;

const IframeViewer: React.FC<IframeViewerProps> = ({ src, headerHeight, footerHeight }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const zoomScale = 0.85;

  const checkConnectivity = useCallback(() => {
    if (!navigator.onLine) {
      setErrorType('offline');
      setIsLoading(false);
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setErrorType(null);

    if (!checkConnectivity()) return;

    // If iframe doesn't trigger onLoad in 15 seconds, assume a timeout or security block
    const timer = setTimeout(() => {
      if (isLoading) {
        // We can't definitively detect X-Frame-Options failures via JS, 
        // but if it's not a connectivity issue, it's usually a timeout or a policy block.
        setErrorType('timeout');
      }
    }, 15000);

    const handleOffline = () => setErrorType('offline');
    const handleOnline = () => {
        if (errorType === 'offline') {
            setErrorType(null);
            setIsLoading(true);
            // Force reload
            const iframe = document.querySelector('iframe');
            if (iframe) iframe.src = src;
        }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [src, checkConnectivity, errorType, isLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    setErrorType(null);
  };

  const renderError = () => {
    let title = "Interface Unavailable";
    let message = "The terminal failed to initialize correctly.";
    let icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    );

    switch (errorType) {
      case 'offline':
        title = "No Network Connection";
        message = "Your terminal uplink is currently offline. Please check your internet connection and the interface will attempt to reconnect automatically.";
        icon = (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0-12.728L5.636 18.364m12.728 0L5.636 5.636m12.728 0a9 9 0 01-12.728 0m12.728 0L5.636 5.636" />
            </svg>
        );
        break;
      case 'timeout':
        title = "Uplink Timeout";
        message = "The external PSX server at psxterminal.com is taking too long to respond. This might be due to heavy traffic or server-side restrictions.";
        break;
      case 'security':
        title = "Security Restriction";
        message = "Access to the terminal was blocked by the remote host's security policy (X-Frame-Options). Please contact JISPL IT support.";
        break;
    }

    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0f172a] p-8 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
          {icon}
        </div>
        <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-3">{title}</h3>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8 font-medium">
          {message}
        </p>
        <div className="flex gap-4">
            <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 border-b-4 border-emerald-800"
            >
                Retry Uplink
            </button>
            {errorType === 'timeout' && (
                <a 
                    href={src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-slate-800 text-slate-300 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-xl active:scale-95 border-b-4 border-slate-950"
                >
                    Open Externally
                </a>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full relative bg-[#0f172a] overflow-hidden shadow-inner flex flex-col items-center justify-center">
      {isLoading && !errorType && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f172a] gap-6">
          <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full"></div>
              <div className="absolute top-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.5em] animate-pulse">Establishing Secure Uplink</p>
            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Target: PSXTERMINAL.COM</p>
          </div>
        </div>
      )}

      {errorType && renderError()}

      <iframe
        src={src}
        title="Embedded PSX Terminal"
        onLoad={handleLoad}
        onError={() => setErrorType('generic')}
        className={`absolute border-0 transition-opacity duration-1000 ${isLoading || errorType ? 'opacity-0' : 'opacity-100'}`}
        style={{
          width: `${100 / zoomScale}%`,
          height: `calc((100% / ${zoomScale}) + ${headerHeight}px + ${footerHeight}px)`,
          top: `-${headerHeight * zoomScale}px`,
          transform: `scale(${zoomScale})`,
          transformOrigin: '0 0',
          backgroundColor: '#0f172a',
        }}
        allow="fullscreen"
      ></iframe>
      
      {/* Visual Overlays */}
      {!isLoading && !errorType && (
        <>
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10"></div>
            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </>
      )}
    </div>
  );
};

export default IframeViewer;
