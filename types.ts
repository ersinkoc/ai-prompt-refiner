export interface TechStack {
  id: string;
  name: string;
  logo: string;
}

export interface RefinementQuestion {
  question: string;
  answers: string[];
}

export interface UserAnswer {
  question: string;
  answer: string;
}

export interface PromptHistoryItem {
  id: string;
  originalPrompt: string;
  conversationHistory: UserAnswer[];
  finalPrompts: string[];
  timestamp: Date;
}

export interface PromptTemplate {
  title: string;
  icon: string;
  prompt: string;
}

export interface PromptExample {
  title: string;
  description: string;
  prompt: string;
}

export type OutputFormat = 'Markdown' | 'JSON' | 'Plain Text';

export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash';

export interface DebugLog {
  timestamp: string;
  type: 'request' | 'response' | 'error';
  data: any;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
}

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  requiredOpenSection?: string;
}