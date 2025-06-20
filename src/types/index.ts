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
  type: 'network' | 'timeout' | 'rate_limit' | 'server';
  message: string;
  retryable: boolean;
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

export interface ChatConfig {
  webhookUrl: string;
  webhookToken?: string;
  title: string;
  debug: boolean;
} 