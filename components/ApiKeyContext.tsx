import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isLoading: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check environment variable first
    const envKey = process.env.API_KEY;
    if (envKey) {
      setApiKeyState(envKey);
    } else {
      // Fallback to local storage
      const stored = localStorage.getItem('google_gemini_api_key');
      if (stored) {
        setApiKeyState(stored);
      }
    }
    setIsLoading(false);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('google_gemini_api_key', key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, isLoading }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};