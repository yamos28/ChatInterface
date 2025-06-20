// TypeScript type definitions for SiteBuilder Chat
// Created: Initial types for chat interface, webhook communication, and UI components

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  isMarkdown?: boolean;
}

export interface WebhookRequest {
  session_id: string;
  message: string;
  timestamp: string;
}

export interface WebhookResponse {
  reply: string;
  follow_up?: string[];
}

export interface ChatError {
  type: 'network' | 'timeout' | 'rate_limit' | 'server' | 'unknown';
  message: string;
  retryable: boolean;
  code?: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: ChatError | null;
  sessionId: string;
  lastMessageTime: number;
}

export interface EmojiPickerData {
  emoji: string;
  name: string;
}

export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  userMessageColor: string;
  botMessageColor: string;
}

export interface ChatConfig {
  title: string;
  subtitle?: string;
  webhookUrl: string;
  webhookToken?: string;
  showQuickReplies?: boolean;
  theme?: Theme;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  debug?: boolean;
}

export interface EmbedOptions extends ChatConfig {
  containerId?: string;
  autoOpen?: boolean;
} 