import React, { useState, useRef, useEffect } from 'react';

const JISPL_MASTER_FILE_ID = "1_OBEiqRRNFDxXYAL-T_96nBf0bfoK5NN";
const JISPL_DRIVE_FOLDER = "https://drive.google.com/drive/folders/1nFANyQFtoYXetfUQbyv9SoJn2uHWMX1h?usp=drive_link";

const ClientPortalLogin: React.FC<{ onLogin: (account: string) => void, onCancel: () => void, onSync: (f: File) => void }> = ({ onLogin, onCancel, onSync }) => {
    const [view, setView] = useState<'login' | 'change' | 'forgot' | 'admin'>('login');
    const [acc, setAcc] = useState('');
    const [pin, setPin] = useState('');
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [err, setErr] = useState('');
    const [success, setSuccess] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const [aiInstructions, setAiInstructions] = useState('');
    const [cloudUrl, setCloudUrl] = useState(JISPL_DRIVE_FOLDER);

    useEffect(() => {
        const savedInst = localStorage.getItem('jispl_admin_instructions');
        if (savedInst) setAiInstructions(savedInst);
        const savedUrl = localStorage.getItem('jispl_master_pdf_url');
        if (savedUrl) setCloudUrl(savedUrl);
    }, []);

    const saveSettings = () => {
        localStorage.setItem('jispl_admin_instructions', aiInstructions);
        if (cloudUrl.trim()) localStorage.setItem('jispl_master_pdf_url', cloudUrl);
        else localStorage.removeItem('jispl_master_pdf_url');
        setSuccess('AI Settings & Cloud Config Saved!');
        setTimeout(() => setSuccess(''), 2000);
    };

    const getStoredPin = (account: string) => {
        if(account === '7860') return '7860';
        const stored = localStorage.getItem('jispl_client_pins');
        if (stored) {
            const db = JSON.parse(stored);
            return db[account] || '1234'; 
        }
        return '1234';
    };

    const updateStoredPin = (account: string, newPinCode: string) => {
        const stored = localStorage.getItem('jispl_client_pins');
        let db = stored ? JSON.parse(stored) : {};
        db[account] = newPinCode;
        localStorage.setItem('jispl_client_pins', JSON.stringify(db));
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Admin Bypass
        if (acc === '7860' && pin === '7860') {
             setView('admin');
             setErr('');
             return;
        }

        // Validation
        if (!/^\d+$/.test(acc)) {
            setErr("Account Number must contain digits only.");
            return;
        }
        if (acc.length < 3) {
            setErr("Account Number is too short.");
            return;
        }
        if (pin.length < 4) {
            setErr("PIN must be at least 4 digits.");
            return;
        }

        const storedPin = getStoredPin(acc);
        if (pin === storedPin) {
            onLogin(acc);
        } else {
            setErr('Invalid Credentials.');
        }
    };

    const handleChangePin = (e: React.FormEvent) => {
        e.preventDefault();
        const storedPin = getStoredPin(acc);
        if (oldPin !== storedPin) {
            setErr('Incorrect Old PIN');
            return;
        }
        if (newPin.length < 4) {
            setErr('New PIN must be at least 4 digits');
            return;
        }
        if (!/^\d+$/.test(newPin)) {
             setErr('New PIN must be numeric');
             return;
        }

        updateStoredPin(acc, newPin);
        setSuccess('PIN Changed Successfully. Please Login.');
        setTimeout(() => {
            setView('login');
            setPin(''); setOldPin(''); setNewPin(''); setSuccess(''); setErr('');
        }, 1500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            onSync(e.target.files[0]);
            setSuccess("Master Data Synced to Persistent Storage!");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[85vh] overflow-y-auto">
                <div className="bg-green-700 p-6 text-white text-center sticky top-0 z-10">
                    <h2 className="text-xl font-bold tracking-tight">JISPL Client Portal</h2>
                    <p className="text-green-100 text-sm mt-1 font-medium">
                        {view === 'login' && 'Secure Access Login'}
                        {view === 'change' && 'Change Security PIN'}
                        {view === 'forgot' && 'Account Recovery'}
                        {view === 'admin' && 'Master Data & AI Control'}
                    </p>
                </div>
                <div className="p-6">
                    {view === 'admin' && (
                         <div className="text-center space-y-4">
                             <div className="p-3 bg-yellow-50 text-yellow-800 rounded text-xs text-left border border-yellow-200">
                                 <strong>Server Status:</strong> Online Config Mode<br/>
                                 Auto-Fetch configured for Drive File ID: {JISPL_MASTER_FILE_ID}
                             </div>
                             
                             <div className="space-y-2 border-b border-gray-100 pb-4">
                                <h3 className="text-sm font-bold text-gray-700 text-left">Option A: Cloud Master Record</h3>
                                <div className="text-xs text-left text-gray-500 mb-1">
                                    Source Folder: <a href={JISPL_DRIVE_FOLDER} target="_blank" className="text-blue-600 underline">JISPL Drive</a>
                                </div>
                                <input 
                                    type="url" 
                                    value={cloudUrl}
                                    onChange={(e) => setCloudUrl(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full text-xs p-2 border rounded"
                                />
                             </div>

                             <div className="space-y-2 border-b border-gray-100 pb-4">
                                <h3 className="text-sm font-bold text-gray-700 text-left">Option B: Local Sync</h3>
                                <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
                                <button onClick={() => fileRef.current?.click()} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-600 hover:text-green-700 font-medium text-sm transition-colors">
                                    Upload Master Record (PDF)
                                </button>
                             </div>

                             <div className="pt-2 space-y-2">
                                <h3 className="text-sm font-bold text-gray-700 text-left">AI Persona & Rules</h3>
                                <textarea 
                                    value={aiInstructions}
                                    onChange={(e) => setAiInstructions(e.target.value)}
                                    className="w-full text-xs p-2 border rounded h-24 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-green-600 outline-none"
                                    placeholder="Enter instructions..."
                                />
                                <button onClick={saveSettings} className="w-full bg-gray-800 text-white text-xs py-2 rounded font-bold hover:bg-gray-700">
                                    Save All Settings
                                </button>
                             </div>

                             {success && <p className="text-green-600 font-bold text-sm bg-green-50 p-1 rounded">{success}</p>}
                             <button onClick={() => setView('login')} className="text-sm text-gray-500 underline pt-2">Back to Login</button>
                         </div>
                    )}

                    {view === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
                                <input type="text" value={acc} onChange={e => setAcc(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none transition-shadow" placeholder="e.g. 1001" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Access PIN</label>
                                <input type="password" value={pin} onChange={e => setPin(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none transition-shadow" placeholder="••••" required />
                            </div>
                            {err && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{err}</p>}
                            {success && <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">{success}</p>}
                            <button type="submit" className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition-colors shadow-md">Login to Portal</button>
                            <div className="flex justify-between text-xs text-green-700 mt-2 font-medium">
                                <button type="button" onClick={() => { setErr(''); setView('forgot'); }}>Forgot PIN?</button>
                                <button type="button" onClick={() => { setErr(''); setView('change'); }}>Change PIN</button>
                            </div>
                        </form>
                    )}

                    {view === 'change' && (
                        <form onSubmit={handleChangePin} className="space-y-4">
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label><input type="text" value={acc} onChange={e => setAcc(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" required /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Old PIN</label><input type="password" value={oldPin} onChange={e => setOldPin(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" required /></div>
                            <div><label className="block text-sm font-semibold text-gray-700 mb-1">New PIN</label><input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none" required /></div>
                            {err && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{err}</p>}
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setView('login'); setErr(''); }} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200">Back</button>
                                <button type="submit" className="flex-1 bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 shadow-md">Update</button>
                            </div>
                        </form>
                    )}

                    {view === 'forgot' && (
                        <div className="text-center space-y-4">
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <h3 className="text-gray-800 font-bold">Secure Recovery</h3>
                                <p className="text-sm text-gray-600 mt-2">For your financial security, account recovery cannot be performed automatically.</p>
                            </div>
                            <p className="text-sm text-gray-700">Please contact the JISPL Trading Desk at <strong className="text-green-700">021-3246XXXX</strong> to verify your identity.</p>
                            <button type="button" onClick={() => setView('login')} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200">Back to Login</button>
                        </div>
                    )}
                    
                    {view === 'login' && <button onClick={onCancel} className="w-full text-center text-gray-500 text-sm mt-4 hover:underline">Continue as Guest</button>}
                </div>
            </div>
        </div>
    );
};

export default ClientPortalLogin;