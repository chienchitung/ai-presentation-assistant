import React, { useState, useEffect } from 'react';
import { AiConfig, Strings } from '../types';
import { refineText } from '../services/aiService';

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newText: string) => void;
  originalText: string;
  refineAction: typeof refineText;
  strings: Strings;
  aiConfig: AiConfig;
}

const RefineModal: React.FC<RefineModalProps> = ({ isOpen, onClose, onConfirm, originalText, refineAction, strings, aiConfig }) => {
  const [refinedText, setRefinedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setRefinedText('');
      
      const handleChunk = (textChunk: string) => {
        if (isLoading) setIsLoading(false);
        setRefinedText(textChunk);
      };

      refineAction(aiConfig, originalText, handleChunk)
        .then((finalText) => {
            setRefinedText(finalText); // Ensure final, trimmed text is set
            setIsLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to refine text.');
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, originalText, aiConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8 w-full max-w-3xl text-slate-900 dark:text-white">
        <h2 className="text-3xl font-bold mb-6">{strings.refineText}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">{strings.original}</h3>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md h-56 overflow-y-auto text-slate-700 dark:text-slate-300">{originalText}</div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">{strings.refined}</h3>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md h-56 overflow-y-auto">
              {isLoading && <p className="text-slate-500 dark:text-slate-400">{strings.refiningText}</p>}
              {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
              {!isLoading && !error && <p className="text-slate-700 dark:text-slate-200">{refinedText}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-5 rounded-md transition-colors">
            {strings.cancel}
          </button>
          <button
            onClick={() => onConfirm(refinedText)}
            disabled={isLoading || !!error}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-md transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {strings.replace}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefineModal;
