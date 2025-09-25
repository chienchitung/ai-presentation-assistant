import { PresentationTemplate, Strings, LlmConfig, Transition } from './types';

export const MOCK_TEMPLATES: PresentationTemplate[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    preview: {
      bg: 'bg-slate-800',
      title: 'text-blue-400',
      subtitle: 'text-slate-300',
      text: 'text-slate-400',
    },
    styles: {
      bg: 'bg-slate-800',
      title: 'text-blue-400 font-bold text-5xl',
      subtitle: 'text-slate-300 text-2xl',
      text: 'text-slate-300 text-lg',
      accent: 'border-blue-400',
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    preview: {
      bg: 'bg-black',
      title: 'text-fuchsia-400',
      subtitle: 'text-cyan-300',
      text: 'text-gray-300',
    },
    styles: {
      bg: 'bg-black from-indigo-900 to-black bg-gradient-to-br',
      title: 'text-fuchsia-400 font-bold text-5xl',
      subtitle: 'text-cyan-400 text-2xl',
      text: 'text-gray-200 text-lg',
      accent: 'border-fuchsia-400',
    },
  },
  {
    id: 'light-minimal',
    name: 'Minimal Light',
    preview: {
      bg: 'bg-gray-100',
      title: 'text-gray-800',
      subtitle: 'text-gray-600',
      text: 'text-gray-500',
    },
    styles: {
      bg: 'bg-gray-100',
      title: 'text-gray-800 font-bold text-5xl',
      subtitle: 'text-gray-700 text-2xl',
      text: 'text-gray-600 text-lg',
      accent: 'border-gray-800',
    },
  },
   {
    id: 'forest-green',
    name: 'Forest Green',
    preview: {
      bg: 'bg-green-900',
      title: 'text-yellow-200',
      subtitle: 'text-green-200',
      text: 'text-green-100',
    },
    styles: {
      bg: 'bg-green-900 bg-opacity-80 backdrop-blur-sm',
      title: 'text-yellow-200 font-bold text-5xl',
      subtitle: 'text-green-100 text-2xl',
      text: 'text-green-50 text-lg',
      accent: 'border-yellow-200',
    },
  },
];

export const TRANSITIONS: { id: Transition; name: string; className: string }[] = [
    { id: 'none', name: 'None', className: '' },
    { id: 'fade', name: 'Fade', className: 'animate-fade-in' },
    { id: 'slide-in', name: 'Slide In', className: 'animate-slide-in-right' },
    { id: 'zoom-in', name: 'Zoom In', className: 'animate-zoom-in' },
];

export const LLM_CONFIG: LlmConfig = {
  gemini: {
    name: "Gemini",
    models: ["gemini-2.5-flash", "gemini-2.5-pro"]
  },
  openai: {
    name: "OpenAI",
    models: ["GPT-4o", "GPT-4o mini", "GPT-5"]
  },
  anthropic: {
    name: "Anthropic",
    models: ["Claude 3.7 Sonnet", "Claude 4 Sonnet"]
  },
  grok: {
    name: "Grok",
    models: ["Grok 3", "Grok 4"]
  }
};


export const STRINGS: { [key: string]: Strings } = {
  EN: {
    // Welcome Screen
    appTitle: "AI Presentation Assistant",
    appSubtitle: "Transform your documents into stunning presentations in seconds.",
    uploadPrompt: "Drag & drop your file here",
    or: "or",
    browseFiles: "Browse Files",
    supportedFiles: "Supported: .txt, .md, .pdf, .docx",
    apiKeyPrompt: "Enter your {providerName} API Key",
    apiKeyPlaceholder: "Your API key...",
    apiKeyMissing: "Please enter a valid API Key above to begin.",
    aiModelConfig: "AI Model Configuration",
    selectProvider: "Select AI Provider",
    selectModel: "Select Model",

    // Loaders
    parsingFile: "Analyzing your document...",
    generatingOutline: "AI is crafting your presentation outline...",

    // Outline Editor
    reviewOutline: "Review & Edit Your Outline",
    reviewDescription: "The AI has generated an outline. You can edit titles, content, or reorder slides before generating the presentation.",
    confirmAndContinue: "Confirm & Continue",
    backToOutline: "Back to Outline",

    // Template Selector
    selectTemplate: "Select a Template",
    templateDescription: "Choose a visual style for your presentation. You can change this later.",

    // Editor
    newPresentation: "New Presentation",
    export: "Export",
    exportPDF: "Export as PDF",
    exportPPTX: "Export as PPTX",
    refineText: "Refine with AI",
    refiningText: "AI is refining the text...",
    original: "Original",
    refined: "Refined",
    replace: "Replace",
    cancel: "Cancel",
    addSlide: "Add Slide",
    deleteSlide: "Delete Slide",
    editTitle: "Click to edit title",
    addImage: "Add Image with AI",
    removeImage: "Remove Image",
    generateImage: "Generate Image with AI",
    imagePrompt: "Describe the image you want to create...",
    generate: "Generate",
    generating: "AI is generating the image...",
    addImageToSlide: "Add to Slide",
    transition: "Transition",
    present: "Present",
    exitPresent: "Exit",

    // Theme
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  ZH_TW: {
    // Welcome Screen
    appTitle: "AI 簡報助理",
    appSubtitle: "在幾秒鐘內將您的文件變成精彩的簡報。",
    uploadPrompt: "將檔案拖放到此處",
    or: "或",
    browseFiles: "瀏覽檔案",
    supportedFiles: "支援格式：.txt, .md, .pdf, .docx",
    apiKeyPrompt: "輸入您的 {providerName} API 金鑰",
    apiKeyPlaceholder: "您的 API 金鑰...",
    apiKeyMissing: "請在上方輸入有效的 API 金鑰以開始。",
    aiModelConfig: "AI 模型組態",
    selectProvider: "選擇 AI 供應商",
    selectModel: "選擇模型",

    // Loaders
    parsingFile: "正在分析您的文件...",
    generatingOutline: "AI 正在為您製作簡報大綱...",

    // Outline Editor
    reviewOutline: "審查並編輯您的大綱",
    reviewDescription: "AI 已產生大綱。在生成簡報之前，您可以編輯標題、內容或重新排序投影片。",
    confirmAndContinue: "確認並繼續",
    backToOutline: "返回大綱",

    // Template Selector
    selectTemplate: "選擇一個範本",
    templateDescription: "為您的簡報選擇一種視覺風格。您可以稍後更改。",

    // Editor
    newPresentation: "新簡報",
    export: "匯出",
    exportPDF: "匯出為 PDF",
    exportPPTX: "匯出為 PPTX",
    refineText: "使用 AI 優化",
    refiningText: "AI 正在優化文字...",
    original: "原文",
    refined: "優化後",
    replace: "取代",
    cancel: "取消",
    addSlide: "新增投影片",
    deleteSlide: "刪除投影片",
    editTitle: "點擊以編輯標題",
    addImage: "使用 AI 新增圖片",
    removeImage: "移除圖片",
    generateImage: "使用 AI 產生圖片",
    imagePrompt: "描述您想要創建的圖片...",
    generate: "產生",
    generating: "AI 正在產生圖片...",
    addImageToSlide: "新增至投影片",
    transition: "轉場",
    present: "播放",
    exitPresent: "結束播放",

    // Theme
    theme: "主題",
    light: "淺色",
    dark: "深色",
    system: "系統",
  }
};