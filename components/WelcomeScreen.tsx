
import React, { useCallback, useState } from 'react';
import { Strings, LlmProvider, LlmModel, LlmApiKeys } from '../types';
import { LLM_CONFIG } from '../constants';

interface WelcomeScreenProps {
  onFileSelect: (file: File) => void;
  error: string | null;
  strings: Strings;
  llmProvider: LlmProvider;
  llmModel: LlmModel;
  apiKeys: LlmApiKeys;
  onLlmProviderChange: (provider: LlmProvider) => void;
  onLlmModelChange: (model: LlmModel) => void;
  onApiKeysChange: (provider: LlmProvider, key: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const UploadIcon: React.FC = () => (
  <svg className="w-12 h-12 mb-4 text-slate-500 dark:text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
  </svg>
);


const WelcomeScreen: React.FC<WelcomeScreenProps> = (props) => {
  const { onFileSelect, error, strings, llmProvider, llmModel, apiKeys, onLlmProviderChange, onLlmModelChange, onApiKeysChange, theme, setTheme } = props;
  const [isDragging, setIsDragging] = useState(false);
  const isApiKeySet = !!apiKeys[llmProvider];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isApiKeySet && e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if(isApiKeySet) {
      setIsDragging(dragging);
    }
  }, [isApiKeySet]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    if (isApiKeySet && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect, handleDragEvents, isApiKeySet]);

  const currentProviderConfig = LLM_CONFIG[llmProvider];
  const apiKeyPrompt = strings.apiKeyPrompt.replace('{providerName}', currentProviderConfig.name);
  
  return (
    <div className="text-center max-w-2xl w-full">
      <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4">{strings.appTitle}</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{strings.appSubtitle}</p>
      
      <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{strings.aiModelConfig}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="provider-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">{strings.selectProvider}</label>
            <select
              id="provider-select"
              value={llmProvider}
              onChange={(e) => onLlmProviderChange(e.target.value as LlmProvider)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {Object.keys(LLM_CONFIG).map(key => (
                <option key={key} value={key}>{LLM_CONFIG[key].name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">{strings.selectModel}</label>
            <select
              id="model-select"
              value={llmModel}
              onChange={(e) => onLlmModelChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {currentProviderConfig.models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">{apiKeyPrompt}</label>
          <input 
            id="api-key-input"
            type="password"
            value={apiKeys[llmProvider] || ''}
            onChange={(e) => onApiKeysChange(llmProvider, e.target.value)}
            placeholder={strings.apiKeyPlaceholder}
            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
           <label htmlFor="theme-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">{strings.theme}</label>
           <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                  <option value="light">{strings.light}</option>
                  <option value="dark">{strings.dark}</option>
                  <option value="system">{strings.system}</option>
            </select>
        </div>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-lg p-12 transition-colors duration-300 ${!isApiKeySet ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800' : (isDragging ? 'border-indigo-400 bg-indigo-50 dark:bg-slate-800' : 'border-slate-400 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-500 bg-slate-50 dark:bg-transparent')}`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        {!isApiKeySet && (
          <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-900/50 flex items-center justify-center rounded-lg z-10">
            <p className="font-semibold text-indigo-600 dark:text-indigo-400 px-4">{strings.apiKeyMissing}</p>
          </div>
        )}
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          accept=".txt,.md,.pdf,.docx"
          disabled={!isApiKeySet}
        />
        <label htmlFor="file-upload" className={`flex flex-col items-center justify-center ${isApiKeySet ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
          <UploadIcon />
          <p className="mb-2 text-lg text-slate-500 dark:text-slate-400"><span className="font-semibold">{strings.uploadPrompt}</span></p>
          <p className="text-slate-500 mb-4">{strings.or}</p>
          <span className={`font-bold py-2 px-4 rounded-md transition-colors ${isApiKeySet ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-500'}`}>{strings.browseFiles}</span>
          <p className="text-xs text-slate-500 mt-4">{strings.supportedFiles}</p>
        </label>
      </div>

      {error && <p className="mt-4 text-red-400 bg-red-900 bg-opacity-50 px-4 py-2 rounded-md">{error}</p>}
    </div>
  );
};

export default WelcomeScreen;
