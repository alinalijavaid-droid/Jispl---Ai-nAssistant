
import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
  onClose?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose }) => {
  const [key, setKey] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = () => {
    onSave(key);
  };

  // Basic validation: Gemini keys are typically 39 chars long and start with AIza
  const isValid = key.trim().length >= 30;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-[100] flex justify-center items-center p-4" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="api-modal-title"
        aria-describedby="api-modal-desc"
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 border border-gray-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
            <h2 id="api-modal-title" className="text-xl font-bold text-gray-800">API Configuration</h2>
            {onClose && (
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
        
        <p id="api-modal-desc" className="text-gray-600 mb-6 text-sm leading-relaxed">
          Please enter your <strong>Google Gemini API Key</strong>. <br/>
          <span className="text-xs text-orange-600 font-semibold block mt-2">
            ⚠️ Important: To fetch master data automatically, this key must also have the "Google Drive API" enabled in your Google Cloud Console.
          </span>
        </p>

        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all font-mono text-sm ${
                key.length > 0 && !isValid 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
            }`}
            placeholder="AIzaSy..."
            autoFocus
            aria-invalid={key.length > 0 && !isValid}
            aria-errormessage={key.length > 0 && !isValid ? "key-error" : undefined}
          />
          {key.length > 0 && !isValid && (
              <p id="key-error" className="text-red-500 text-xs mt-1" role="alert">Key seems too short (min 30 characters).</p>
          )}
        </div>

        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline mb-6 block font-medium"
        >
          Get a Gemini API key &rarr;
        </a>

        <div className="flex gap-3">
             {onClose && (
                <button 
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300"
                >
                    Cancel
                </button>
             )}
            <button
            onClick={handleSaveClick}
            disabled={!isValid}
            className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
            Save Key
            </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
