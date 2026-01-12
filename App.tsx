
import React, { useState } from 'react';
import IframeViewer from './components/IframeViewer';
import MenuBar from './components/MenuBar';
import ChatPage from './components/ChatPage';
import ApiKeyModal from './components/ApiKeyModal';
import HelpModal from './components/HelpModal';
import ClientPortalLogin from './components/ClientPortalLogin';
import { ApiKeyProvider, useApiKey } from './components/ApiKeyContext';

export interface MenuItemConfig {
  name: string;
  url?: string;
  headerHeight?: number;
  footerHeight?: number;
}

const menuItems: MenuItemConfig[] = [
    { name: "PSX Terminal", url: "https://psxterminal.com/", headerHeight: 160, footerHeight: 0 },
    { name: "A.L.I.N.A - A.I." },
];

const AppContent: React.FC = () => {
  const [activeItem, setActiveItem] = useState<MenuItemConfig>(menuItems[0]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showGlobalLogin, setShowGlobalLogin] = useState(false);
  
  const { apiKey, setApiKey, isLoading } = useApiKey();

  React.useEffect(() => {
    if (!isLoading && !apiKey) {
      setIsApiKeyModalOpen(true);
    }
  }, [isLoading, apiKey]);

  const handleSaveApiKey = (key: string) => {
      setApiKey(key);
      setIsApiKeyModalOpen(false);
      window.location.reload(); 
  };

  const [isEmbed] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'embed';
    }
    return false;
  });

  const handleHelpCommand = (cmd: string) => {
    window.dispatchEvent(new CustomEvent('alina-command', { detail: cmd }));
    if (activeItem.name === "PSX Terminal") {
      setActiveItem(menuItems[1]); // Switch to AI chat if a command is sent from help
    }
  };

  if (isLoading) return null;

  if (isEmbed) {
    return (
        <div className="h-screen w-full bg-white overflow-hidden font-sans">
            <ChatPage apiKey={apiKey} />
        </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 font-sans text-gray-800 overflow-hidden">
      <ApiKeyModal isOpen={isApiKeyModalOpen} onSave={handleSaveApiKey} onClose={() => setIsApiKeyModalOpen(false)} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} onCommand={handleHelpCommand} />
      
      {showGlobalLogin && (
        <ClientPortalLogin 
          onLogin={(acc) => {
            setShowGlobalLogin(false);
            setActiveItem(menuItems[1]); 
            window.dispatchEvent(new CustomEvent('jispl-login', { detail: acc }));
          }} 
          onCancel={() => setShowGlobalLogin(false)} 
          onSync={() => {}} 
        />
      )}

      <header className="flex-none bg-white border-b border-gray-200 shadow-sm z-30 relative" role="banner">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
                <img 
                    src="https://i.ibb.co/0VtZK3YW/vbmghjmgjg.png" 
                    alt="JISPL Logo" 
                    className="h-10 sm:h-12 w-auto object-contain"
                />
                <div className="border-l-2 border-green-600 pl-3 sm:pl-4 h-8 sm:h-10 flex flex-col justify-center">
                    <h1 className="text-sm sm:text-lg font-bold text-gray-1100 leading-none">A.L.I.N.A.</h1>
                    <p className="text-[13px] sm:text-[15px] text-green-900 font-black tracking-tight mt-0.5 sm:mt-1 leading-none">(Advanced Leverage & Investment Network Analyst)</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-3">
                <button 
                  onClick={() => setIsHelpModalOpen(true)} 
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 border border-emerald-200 shadow-sm"
                  title="Help & Manual"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Help & Manual
                </button>
            </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-[1440px] mx-auto relative overflow-hidden">
        <div className="flex-none px-3 sm:px-4 py-2 sm:py-3">
            <MenuBar
                items={menuItems}
                activeItem={activeItem}
                onItemClick={setActiveItem}
            />
        </div>
        
        <div className="flex-1 relative w-full overflow-hidden px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                {activeItem.name === "PSX Terminal" ? (
                  <IframeViewer 
                    src={activeItem.url || "https://psxterminal.com/"} 
                    headerHeight={activeItem.headerHeight || 160} 
                    footerHeight={activeItem.footerHeight || 0} 
                  />
                ) : (
                  <ChatPage apiKey={apiKey} />
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  );
};

export default App;
