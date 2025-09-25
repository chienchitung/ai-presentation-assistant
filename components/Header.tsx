import React, { useState, useRef, useEffect } from 'react';
import { Strings } from '../types';

interface HeaderProps {
  presentationTitle: string;
  onTitleChange: (newTitle: string) => void;
  onNewPresentation: () => void;
  onExport: (format: 'pdf' | 'pptx') => void;
  strings: Strings;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  onBackToOutline: () => void;
  onPresent: () => void;
}

const ThemeIcon: React.FC<{ theme: string }> = ({ theme }) => {
    if (theme === 'dark') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
    if (theme === 'light') return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.464A1 1 0 106.465 13.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1-1H3a1 1 0 110-2h1a1 1 0 011 1zm4.95-4.95a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 011.5 1.5v10a1.5 1.5 0 01-3 0v-10A1.5 1.5 0 0110 3.5z" /><path d="M10 2a.5.5 0 00-1 0v1a.5.5 0 001 0V2zM10 17a.5.5 0 00-1 0v1a.5.5 0 001 0v-1z" /><path d="M3 5.065A2 2 0 015 4h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 011-1.935zM4 6v8a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1z" /></svg>;
};

const Header: React.FC<HeaderProps> = ({ presentationTitle, onTitleChange, onNewPresentation, onExport, strings, theme, setTheme, onBackToOutline, onPresent }) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const themeOptions = [
    { key: 'light', label: strings.light },
    { key: 'dark', label: strings.dark },
    { key: 'system', label: strings.system },
  ];

  const exportOptions = [
    { key: 'pdf', label: strings.exportPDF },
    { key: 'pptx', label: strings.exportPPTX },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md px-6 py-3 flex items-center justify-between z-10 flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4 flex-1 min-w-0">
         <button onClick={onBackToOutline} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold p-2.5 rounded-md transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">{strings.backToOutline}</span>
         </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
          <input
            type="text"
            value={presentationTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 w-full"
            placeholder={strings.editTitle}
          />
        </h1>
      </div>
      <div className="flex items-center gap-4">
         <div className="relative" ref={themeRef}>
            <button
                onClick={() => setIsThemeOpen(prev => !prev)}
                className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-md transition-colors"
            >
                <ThemeIcon theme={theme} />
                <span className="hidden sm:inline">{strings.theme}</span>
            </button>
            {isThemeOpen && (
                 <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                    {themeOptions.map(opt => (
                         <a
                            key={opt.key}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setTheme(opt.key as any);
                                setIsThemeOpen(false);
                            }}
                            className={`block px-4 py-2 text-sm ${theme === opt.key ? 'bg-indigo-500 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                         >
                            {opt.label}
                         </a>
                    ))}
                </div>
            )}
        </div>
        <button
          onClick={onNewPresentation}
          className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors hidden sm:block"
        >
          {strings.newPresentation}
        </button>
        <div className="relative" ref={exportRef}>
            <button
                onClick={() => setIsExportOpen(prev => !prev)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
            >
                {strings.export}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isExportOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                    {exportOptions.map(opt => (
                         <a
                            key={opt.key}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onExport(opt.key as any);
                                setIsExportOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                         >
                            {opt.label}
                         </a>
                    ))}
                </div>
            )}
        </div>
         <button
            onClick={onPresent}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">{strings.present}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;