
export enum AppState {
  WELCOME = 'WELCOME',
  PARSING = 'PARSING',
  GENERATING_OUTLINE = 'GENERATING_OUTLINE',
  REVIEWING_OUTLINE = 'REVIEWING_OUTLINE',
  SELECTING_TEMPLATE = 'SELECTING_TEMPLATE',
  EDITOR = 'EDITOR',
}

export type SlideLayout = "TITLE_SLIDE" | "TITLE_CONTENT" | "SECTION_HEADER" | "TWO_COLUMN" | "BLANK";
export type Transition = 'none' | 'fade' | 'slide-in' | 'zoom-in';


export interface Slide {
  id: string;
  title: string;
  content: string[];
  layout: SlideLayout;
  imageUrl?: string;
  transition?: Transition;
}

export interface PresentationTemplate {
  id: string;
  name: string;
  preview: {
    bg: string;
    title: string;
    subtitle: string;
    text: string;
  };
  styles: {
    bg: string;
    title: string;
    subtitle: string;
    text: string;
    accent: string;
  };
}

export interface Presentation {
  title: string;
  slides: Slide[];
  template: PresentationTemplate;
}

export type Strings = {
  [key: string]: string;
}

// AI Model Configuration Types
export type LlmProvider = 'gemini' | 'openai' | 'anthropic' | 'grok';

export type LlmModel = string;

export interface LlmConfig {
  [key: string]: {
    name: string;
    models: LlmModel[];
  };
}

export type LlmApiKeys = {
  [key in LlmProvider]?: string;
};

export interface AiConfig {
  provider: LlmProvider;
  model: LlmModel;
  apiKey?: string;
}
