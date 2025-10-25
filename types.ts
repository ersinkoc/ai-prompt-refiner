export interface TechStack {
  id: string;
  name: string;
  logo: string;
}

export enum QuestionType {
  CLARIFICATION = 'clarification',
  SPECIFICATION = 'specification',
  SCENARIO = 'scenario',
  CONSTRAINT = 'constraint',
  EXAMPLE = 'example',
  PRIORITY = 'priority'
}

export enum RefinementStatus {
  REFINING = 'refining',
  COMPLETE = 'complete',
  NEEDS_MORE_CONTEXT = 'needs_more_context',
  REFINING_FURTHER = 'refining_further'
}

export interface RefinementQuestion {
  id: string;
  type: QuestionType;
  question: string;
  answers: string[];
  allowCustom?: boolean;
  required?: boolean;
  dependsOn?: string[];
  followUpQuestions?: string[];
}

export interface UserAnswer {
  id: string;
  question: string;
  questionId: string;
  answer: string;
  questionType: QuestionType;
  timestamp: Date;
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
  type: 'request' | 'response' | 'error' | 'retry_attempt' | 'retry_delay' | 'parse_error' | 'fallback_success' | 'validation_fallback_success' | 'validation_error';
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

export interface RefinementContext {
  basePrompt: string;
  selectedStacks: string[];
  conversationHistory: UserAnswer[];
  refinementRound: number;
  maxRounds: number;
  focusAreas: FocusArea[];
  complexity: 'basic' | 'detailed' | 'comprehensive';
  outputStyle: 'professional' | 'casual' | 'technical' | 'educational';
}

export interface FocusArea {
  id: string;
  name: string;
  enabled: boolean;
  weight: number;
}

export interface GeminiResponse {
  status: RefinementStatus;
  questions?: RefinementQuestion[];
  finalPrompts?: string[];
  refinementCount?: number;
  suggestedApproach?: 'detailed' | 'concise' | 'comprehensive';
  confidence?: number;
  nextSteps?: string[];
}

export interface TechStackContext {
  stacks: string[];
  contextualQuestions: RefinementQuestion[];
  bestPractices: string[];
  commonIssues: string[];
}