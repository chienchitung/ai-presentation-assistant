
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Presentation, AppState, Slide, PresentationTemplate, LlmProvider, LlmApiKeys, LlmModel, AiConfig } from './types';
import { MOCK_TEMPLATES, STRINGS, LLM_CONFIG } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import Loader from './components/Loader';
import OutlineEditor from './components/OutlineEditor';
import TemplateSelector from './components/TemplateSelector';
import Editor from './components/Editor';
import { parseFile } from './services/fileParserService';
import { generateOutlineFromText } from './services/aiService';

// Helper function to get a valid initial state from localStorage
const getInitialAiConfig = (): { provider: LlmProvider; model: LlmModel } => {
  const provider = (localStorage.getItem('llm_provider') as LlmProvider) || 'gemini';
  const model = localStorage.getItem('llm_model') as LlmModel;

  const providerConfig = LLM_CONFIG[provider];
  // Check if provider exists and if the stored model is valid for that provider
  if (providerConfig && providerConfig.models.includes(model)) {
    return { provider, model };
  }

  // Fallback to default if stored config is invalid
  const defaultProvider: LlmProvider = 'gemini';
  const defaultModel = LLM_CONFIG[defaultProvider].models[0];
  // Also update localStorage to reflect the fallback
  localStorage.setItem('llm_provider', defaultProvider);
  localStorage.setItem('llm_model', defaultModel);
  return { provider: defaultProvider, model: defaultModel };
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [outline, setOutline] = useState<Slide[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'EN' | 'ZH_TW'>('EN');
  
  const initialAiConfig = getInitialAiConfig();
  const [llmProvider, setLlmProvider] = useState<LlmProvider>(initialAiConfig.provider);
  const [llmModel, setLlmModel] = useState<LlmModel>(initialAiConfig.model);

  const [apiKeys, setApiKeys] = useState<LlmApiKeys>(
    JSON.parse(localStorage.getItem('llm_api_keys') || '{}')
  );

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const strings = STRINGS[language];

  const handleLlmProviderChange = useCallback((provider: LlmProvider) => {
    setLlmProvider(provider);
    setLlmModel(LLM_CONFIG[provider].models[0]); // Default to first model of new provider
    localStorage.setItem('llm_provider', provider);
    localStorage.setItem('llm_model', LLM_CONFIG[provider].models[0]);
    setError(null);
  }, []);

  const handleLlmModelChange = useCallback((model: LlmModel) => {
      setLlmModel(model);
      localStorage.setItem('llm_model', model);
  }, []);

  const handleApiKeysChange = useCallback((provider: LlmProvider, key: string) => {
    const newKeys = { ...apiKeys, [provider]: key };
    setApiKeys(newKeys);
    localStorage.setItem('llm_api_keys', JSON.stringify(newKeys));
    if (error === strings.apiKeyMissing) {
      setError(null);
    }
  }, [apiKeys, error, strings]);

  const aiConfig: AiConfig = useMemo(() => ({
    provider: llmProvider,
    model: llmModel,
    apiKey: apiKeys[llmProvider]
  }), [llmProvider, llmModel, apiKeys]);

  const handleFileProcess = useCallback(async (file: File) => {
    const currentApiKey = aiConfig.apiKey;
    if (!currentApiKey) {
      setError(strings.apiKeyMissing);
      return;
    }
    setAppState(AppState.PARSING);
    setError(null);
    try {
      const textContent = await parseFile(file);
      setAppState(AppState.GENERATING_OUTLINE);
      const generatedOutline = await generateOutlineFromText(aiConfig, textContent, language);
      setOutline(generatedOutline);
      setAppState(AppState.REVIEWING_OUTLINE);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAppState(AppState.WELCOME);
    }
  }, [aiConfig, strings, language]);

  const handleOutlineConfirm = useCallback((finalOutline: Slide[]) => {
    setOutline(finalOutline);
    setAppState(AppState.SELECTING_TEMPLATE);
  }, []);

  const handleBackToOutline = useCallback(() => {
    setAppState(AppState.REVIEWING_OUTLINE);
  }, []);

  const handleTemplateSelect = useCallback((template: PresentationTemplate) => {
    if (outline) {
      const newPresentation: Presentation = {
        title: 'My AI Presentation',
        slides: outline,
        template: template,
      };
      setPresentation(newPresentation);
      setAppState(AppState.EDITOR);
    }
  }, [outline]);

  const handleNewPresentation = () => {
    setAppState(AppState.WELCOME);
    setPresentation(null);
    setOutline(null);
    setError(null);
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.WELCOME:
        return (
          <WelcomeScreen
            onFileSelect={handleFileProcess}
            error={error}
            strings={strings}
            llmProvider={llmProvider}
            llmModel={llmModel}
            apiKeys={apiKeys}
            onLlmProviderChange={handleLlmProviderChange}
            onLlmModelChange={handleLlmModelChange}
            onApiKeysChange={handleApiKeysChange}
            theme={theme}
            setTheme={setTheme}
          />
        );
      case AppState.PARSING:
        return <Loader message={strings.parsingFile} />;
      case AppState.GENERATING_OUTLINE:
        return <Loader message={strings.generatingOutline} />;
      case AppState.REVIEWING_OUTLINE:
        return outline && <OutlineEditor initialOutline={outline} onConfirm={handleOutlineConfirm} strings={strings} />;
      case AppState.SELECTING_TEMPLATE:
        return <TemplateSelector templates={MOCK_TEMPLATES} onSelect={handleTemplateSelect} onBack={handleBackToOutline} strings={strings} />;
      case AppState.EDITOR:
        return presentation && (
          <Editor
            initialPresentation={presentation}
            onNewPresentation={handleNewPresentation}
            strings={strings}
            theme={theme}
            setTheme={setTheme}
            aiConfig={aiConfig}
            onBackToOutline={handleBackToOutline}
          />
        );
      default:
        return (
          <WelcomeScreen
            onFileSelect={handleFileProcess}
            error={error}
            strings={strings}
            llmProvider={llmProvider}
            llmModel={llmModel}
            apiKeys={apiKeys}
            onLlmProviderChange={handleLlmProviderChange}
            onLlmModelChange={handleLlmModelChange}
            onApiKeysChange={handleApiKeysChange}
            theme={theme}
            setTheme={setTheme}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 transition-colors duration-300">
       <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setLanguage(lang => lang === 'EN' ? 'ZH_TW' : 'EN')}
          className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-md transition-colors"
        >
          {language === 'EN' ? '繁體中文' : 'English'}
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default App;
