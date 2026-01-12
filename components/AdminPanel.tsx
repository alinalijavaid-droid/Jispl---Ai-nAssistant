
import React, { useState, useRef } from 'react';

interface AdminPanelProps {
  onFilesUpdate: (files: File[]) => void;
  currentFiles: File[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onFilesUpdate, currentFiles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardcoded Drive Link
  const DRIVE_LINK = "https://drive.google.com/drive/folders/1nFANyQFtoYXetfUQbyv9SoJn2uHWMX1h?usp=drive_link";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '7860') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Access Code');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesUpdate([...currentFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const updated = currentFiles.filter((_, i) => i !== index);
    onFilesUpdate(updated);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
          <div className="flex justify-center mb-6">
             <div className="bg-green-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">JISPL Admin</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">Restricted Access. Enter Admin PIN.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-center tracking-widest text-lg"
              placeholder="••••"
              maxLength={4}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Control Center</h1>
                <p className="text-gray-500 text-sm">Manage Master Data & Client Reports</p>
            </div>
            <button onClick={() => setIsAuthenticated(false)} className="text-red-500 hover:text-red-700 font-medium text-sm">
                Log Out
            </button>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Drive Source */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" alt="Drive" className="w-8 h-8" />
                    <h2 className="text-lg font-bold text-gray-800">Step 1: Master Data Source</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4 flex-1">
                    All client daily position reports are stored securely in the Master Google Drive Folder.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                     <p className="text-xs text-blue-700 font-mono break-all">{DRIVE_LINK}</p>
                </div>
                <a 
                    href={DRIVE_LINK} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full text-center"
                >
                    Open Daily Reports Drive
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            {/* Step 2: Session Sync */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Step 2: Sync to AI Session</h2>
                    </div>
                </div>
                <p className="text-gray-500 text-xs mb-4">
                    After downloading the latest report from Step 1, drag it here to active the AI's search capabilities for this session.
                </p>

                <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer flex-1 flex flex-col justify-center items-center"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload}
                        accept="application/pdf,text/csv"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 font-medium text-sm">Drop Daily Report PDF Here</p>
                </div>
            </div>
        </div>

        {/* Active Files List */}
        {currentFiles.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Active Knowledge Base ({currentFiles.length})</h3>
                <div className="space-y-2">
                    {currentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2 border border-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p><strong>System Ready:</strong> The AI will now cross-reference these uploaded files whenever a client provides an Account Number.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
