// ChatWidget component for SiteBuilder Chat
// Created: Main chat interface integrating all components with state management and webhook communication

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatError, ChatConfig } from '../types';
import ApiClient from '../utils/api';
import sessionManager from '../utils/session';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplyButtons from './QuickReplyButtons';
import ChatInput from './ChatInput';
import ErrorToast from './ErrorToast';

interface ChatWidgetProps {
  config: ChatConfig;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiClientRef = useRef<ApiClient | null>(null);

  // Initialize API client
  useEffect(() => {
    apiClientRef.current = new ApiClient(config.webhookUrl, config.webhookToken);
  }, [config.webhookUrl, config.webhookToken]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      content: `Hello! I'm SiteBuilder, your AI assistant. How can I help you build your website today?`,
      timestamp: new Date().toISOString(),
      isUser: false,
      isMarkdown: false,
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Announce new bot messages for screen readers
    if (!message.isUser) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `New message from SiteBuilder: ${message.content}`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const now = Date.now();
    
    // Rate limiting check
    if (now - lastMessageTime < 500) {
      return;
    }
    setLastMessageTime(now);

    // Clear any existing errors and follow-ups
    setError(null);
    setFollowUps([]);

    // Add user message
    const userMessage = {
      content,
      timestamp: new Date().toISOString(),
      isUser: true,
    };
    addMessage(userMessage);

    // Show typing indicator
    setIsTyping(true);

    try {
      if (!apiClientRef.current) {
        throw new Error('API client not initialized');
      }

      const response = await apiClientRef.current.sendMessage({
        session_id: sessionManager.getSessionId(),
        message: content,
        timestamp: new Date().toISOString(),
      });

      // Add bot response
      const botMessage = {
        content: response.reply,
        timestamp: new Date().toISOString(),
        isUser: false,
        isMarkdown: true,
      };
      addMessage(botMessage);

      // Set follow-up questions if provided
      if (response.follow_up && response.follow_up.length > 0) {
        setFollowUps(response.follow_up);
      }

    } catch (err) {
      const chatError = err as ChatError;
      setError(chatError);
      
      if (config.debug) {
        console.error('Chat error:', chatError);
      }
    } finally {
      setIsTyping(false);
    }
  }, [lastMessageTime, addMessage, config.debug]);

  const handleQuickReply = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  const handleRetry = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
      }
    }
  }, [messages, sendMessage]);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">{config.title}</h3>
            <p className="text-xs opacity-90">AI Website Builder Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          {followUps.length > 0 && !isTyping && (
            <QuickReplyButtons 
              followUps={followUps} 
              onQuickReply={handleQuickReply}
              disabled={isTyping}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput 
          onSendMessage={sendMessage}
          disabled={isTyping}
          placeholder="Ask me about building your website..."
        />
      </div>

      {/* Error Toast */}
      {error && (
        <ErrorToast
          error={error}
          onRetry={error.retryable ? handleRetry : undefined}
          onDismiss={handleDismissError}
        />
      )}
    </>
  );
};

export default ChatWidget; 