export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  feedback?: 'positive' | 'negative';
}

export interface Conversation {
  id: string;
  messages: Message[];
  lastUpdated: number;
  summary?: string;
}

export type Language = 'en' | 'hi' | 'kn';

export interface ChatState {
  isOpen: boolean;
  isFullScreen: boolean;
  isHistoryOpen: boolean;
  currentLanguage: Language;
  conversations: Conversation[];
  currentConversationId: string | null;
  isGenerating: boolean;
  abortController: AbortController | null;
}

export interface ChatContextType extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  setLanguage: (language: Language) => void;
  toggleFullScreen: () => void;
  toggleHistory: () => void;
  closeChat: () => void;
  openChat: () => void;
  clearCurrentConversation: () => void;
  deleteConversation: (id: string) => void;
  provideFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
} 