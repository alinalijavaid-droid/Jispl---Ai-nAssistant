
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  className?: string;
  onToggleLang?: () => void;
  inputLang?: 'en-US' | 'ur-PK';
  onMicClick?: () => void;
  isLive?: boolean;
  isRecording?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  inputRef,
  className = '',
  onToggleLang,
  inputLang,
  onMicClick,
  isLive,
}) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef || localRef;

  const adjustHeight = () => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const insertFormat = (startTag: string, endTag: string = '', lineStart: boolean = false) => {
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = '';
    let newCursorPos = 0;

    if (lineStart) {
        const lastNewLine = before.lastIndexOf('\n');
        const insertAt = lastNewLine === -1 ? 0 : lastNewLine + 1;
        const beforeLine = text.substring(0, insertAt);
        const lineContent = text.substring(insertAt);
        newText = beforeLine + startTag + lineContent;
        newCursorPos = insertAt + startTag.length + (end - insertAt);
    } else {
        newText = before + startTag + selection + endTag + after;
        newCursorPos = end + startTag.length;
    }

    onChange(newText);
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onKeyDown) onKeyDown(e);
    }
  };

  const BoldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H8v6H6V4zm2 6h6a2 2 0 000-4H8v4zm0 4v4h6a2 2 0 000-4H8z" />
    </svg>
  );

  const ItalicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M10 4h4v2h-1.56l-2.88 12H13v2H9v-2h1.56l2.88-12H10V4z" />
    </svg>
  );

  const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M3 6a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm0 6a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H4a1 1 0 01-1-1V12zm0 6a1 1 0 011-1h1.5a1 1 0 011 1v1.5a1 1 0 01-1 1H4a1 1 0 01-1-1V18zM9 6a1 1 0 011-1h11a1 1 0 110 2H10a1 1 0 01-1-1zm0 6a1 1 0 011-1h11a1 1 0 110 2H10a1 1 0 01-1-1zm0 6a1 1 0 011-1h11a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );

  const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  return (
    <div className={`flex flex-col border rounded-xl bg-white overflow-hidden transition-all duration-300 ${isLive ? 'border-blue-400 ring-1 ring-blue-300' : 'border-gray-300 focus-within:ring-2 focus-within:ring-green-500'} ${className}`}>
      <div className={`flex items-center justify-between px-2 py-1 border-b border-gray-100 bg-gray-50 ${isLive ? 'bg-blue-50' : ''}`}>
        <div className="flex items-center space-x-1">
          <button type="button" onClick={() => insertFormat('**', '**')} className="p-1 text-gray-500 hover:text-green-700 hover:bg-gray-200 rounded" disabled={disabled}><BoldIcon /></button>
          <button type="button" onClick={() => insertFormat('_', '_')} className="p-1 text-gray-500 hover:text-green-700 hover:bg-gray-200 rounded" disabled={disabled}><ItalicIcon /></button>
          <button type="button" onClick={() => insertFormat('- ', '', true)} className="p-1 text-gray-500 hover:text-green-700 hover:bg-gray-200 rounded" disabled={disabled}><ListIcon /></button>
        </div>
        <div className="flex items-center space-x-1.5">
            {onToggleLang && (
                <button type="button" onClick={onToggleLang} className="text-[9px] font-bold px-1 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 uppercase" disabled={disabled && !isLive}>
                    {inputLang === 'en-US' ? 'EN' : 'UR'}
                </button>
            )}
             {onMicClick && (
                <button type="button" onClick={onMicClick} className={`p-1 rounded-full ${isLive ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-green-600'}`} disabled={disabled && !isLive}>
                    <MicIcon />
                </button>
             )}
        </div>
      </div>
      <textarea
        ref={ref as any}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="w-full px-3 py-1.5 text-sm text-gray-800 bg-transparent resize-none focus:outline-none placeholder-gray-400"
        style={{ minHeight: '36px', maxHeight: '120px' }}
        dir={inputLang === 'ur-PK' && !value ? 'rtl' : 'auto'}
      />
    </div>
  );
};

export default RichTextEditor;
