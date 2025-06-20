// Full-page chat interface for SiteBuilder Chat
// Recent changes: Added Supabase integration for persistent history and cross-device sync

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatError, ChatConfig } from '../types';
import ApiClient from '../utils/api';
import sessionManager from '../utils/session';
import supabaseService from '../utils/supabase';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplyButtons from './QuickReplyButtons';
import ChatInput from './ChatInput';
import ErrorToast from './ErrorToast';

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessage: string;
  timestamp: string;
}

interface FullPageChatProps {
  config: ChatConfig;
}

export const FullPageChat: React.FC<FullPageChatProps> = ({ config }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiClientRef = useRef<ApiClient | null>(null);

  // Initialize API client
  useEffect(() => {
    apiClientRef.current = new ApiClient(config.webhookUrl, config.webhookToken);
  }, [config.webhookUrl, config.webhookToken]);

  // Load chat history (Supabase or localStorage fallback)
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setSyncStatus('syncing');

    try {
      if (supabaseService.isEnabled()) {
        // Load from Supabase
        const dbConversations = await supabaseService.getConversations();
        const conversations: Conversation[] = [];

        for (const dbConv of dbConversations) {
          const messages = await supabaseService.getMessages(dbConv.id);
          conversations.push({
            id: dbConv.id,
            title: dbConv.title,
            messages,
            lastMessage: dbConv.last_message,
            timestamp: dbConv.updated_at,
          });
        }

        setConversations(conversations);
        setSyncStatus('synced');

        // Load the most recent conversation
        if (conversations.length > 0) {
          setCurrentConversationId(conversations[0].id);
          setCurrentMessages(conversations[0].messages);
        } else {
          createNewConversation();
        }
      } else {
        // Fallback to localStorage
        const savedConversations = localStorage.getItem('sitebuilder-conversations');
        if (savedConversations) {
          const parsedConversations = JSON.parse(savedConversations);
          setConversations(parsedConversations);
          
          if (parsedConversations.length > 0) {
            const latest = parsedConversations[0];
            setCurrentConversationId(latest.id);
            setCurrentMessages(latest.messages);
          }
        } else {
          createNewConversation();
        }
        setSyncStatus('offline');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setSyncStatus('offline');
      
      // Fallback to localStorage
      const savedConversations = localStorage.getItem('sitebuilder-conversations');
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
        
        if (parsedConversations.length > 0) {
          const latest = parsedConversations[0];
          setCurrentConversationId(latest.id);
          setCurrentMessages(latest.messages);
        }
      } else {
        createNewConversation();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage (fallback)
  const saveToLocalStorage = useCallback((convs: Conversation[]) => {
    localStorage.setItem('sitebuilder-conversations', JSON.stringify(convs));
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping, scrollToBottom]);

  const createNewConversation = useCallback(async () => {
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      content: `Hello! I'm SiteBuilder, your AI assistant. How can I help you build your website today?`,
      timestamp: new Date().toISOString(),
      isUser: false,
      isMarkdown: false,
    };

    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [welcomeMessage],
      lastMessage: 'Hello! I\'m SiteBuilder...',
      timestamp: new Date().toISOString(),
    };

    try {
      if (supabaseService.isEnabled()) {
        // Save to Supabase
        const conversationId = await supabaseService.createConversation(
          newConversation.title,
          newConversation.lastMessage
        );
        
        if (conversationId) {
          newConversation.id = conversationId;
          await supabaseService.addMessage(conversationId, {
            content: welcomeMessage.content,
            timestamp: welcomeMessage.timestamp,
            isUser: false,
            isMarkdown: false,
          });
          setSyncStatus('synced');
        }
      }

      setConversations(prev => {
        const updated = [newConversation, ...prev];
        saveToLocalStorage(updated);
        return updated;
      });
      
      setCurrentConversationId(newConversation.id);
      setCurrentMessages(newConversation.messages);
      setFollowUps([]);
      setError(null);
    } catch (error) {
      console.error('Error creating conversation:', error);
      setSyncStatus('offline');
    }
  }, [saveToLocalStorage]);

  const updateConversation = useCallback(async (conversationId: string, messages: ChatMessage[]) => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const title = messages.find(m => m.isUser)?.content.substring(0, 30) + '...' || 'New Chat';

    try {
      if (supabaseService.isEnabled()) {
        // Update in Supabase
        await supabaseService.updateConversation(
          conversationId,
          title,
          lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
        );
        setSyncStatus('synced');
      }

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages,
              lastMessage: lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : ''),
              timestamp: lastMessage.timestamp,
              title: conv.title === 'New Chat' ? title : conv.title,
            };
          }
          return conv;
        });
        saveToLocalStorage(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
      setSyncStatus('offline');
    }
  }, [saveToLocalStorage]);

  const switchConversation = useCallback(async (conversationId: string) => {
    try {
      if (supabaseService.isEnabled()) {
        // Load messages from Supabase
        const messages = await supabaseService.getMessages(conversationId);
        setCurrentMessages(messages);
      } else {
        // Load from local state
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          setCurrentMessages(conversation.messages);
        }
      }
      
      setCurrentConversationId(conversationId);
      setFollowUps([]);
      setError(null);
    } catch (error) {
      console.error('Error switching conversation:', error);
      // Fallback to local state
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversationId(conversationId);
        setCurrentMessages(conversation.messages);
        setFollowUps([]);
        setError(null);
      }
    }
  }, [conversations]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      if (supabaseService.isEnabled()) {
        await supabaseService.deleteConversation(conversationId);
        setSyncStatus('synced');
      }

      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== conversationId);
        saveToLocalStorage(filtered);
        
        // If deleting current conversation, switch to another or create new
        if (conversationId === currentConversationId) {
          if (filtered.length > 0) {
            setCurrentConversationId(filtered[0].id);
            setCurrentMessages(filtered[0].messages);
          } else {
            createNewConversation();
          }
        }
        
        return filtered;
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setSyncStatus('offline');
    }
  }, [currentConversationId, saveToLocalStorage, createNewConversation]);

  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
    };
    
    try {
      if (supabaseService.isEnabled() && currentConversationId) {
        // Save to Supabase
        await supabaseService.addMessage(currentConversationId, message);
        setSyncStatus('synced');
      }

      setCurrentMessages(prev => {
        const updated = [...prev, newMessage];
        if (currentConversationId) {
          updateConversation(currentConversationId, updated);
        }
        return updated;
      });
      
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
    } catch (error) {
      console.error('Error adding message:', error);
      setSyncStatus('offline');
    }
  }, [currentConversationId, updateConversation]);

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
    if (currentMessages.length > 0) {
      const lastUserMessage = [...currentMessages].reverse().find(msg => msg.isUser);
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
      }
    }
  }, [currentMessages, sendMessage]);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sitebuilder-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sitebuilder-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🤖</span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 dark:text-white">{config.title}</h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI Website Builder</p>
                    <div className={`w-2 h-2 rounded-full ${
                      syncStatus === 'synced' ? 'bg-green-500' : 
                      syncStatus === 'syncing' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} title={syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline mode'}></div>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7M21 12H3" : "M13 5l7 7-7 7M5 12h14"} />
              </svg>
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        {sidebarOpen && (
          <div className="p-4">
            <button
              onClick={createNewConversation}
              className="w-full flex items-center space-x-3 p-3 bg-sitebuilder-primary hover:bg-opacity-90 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          {sidebarOpen && (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    conversation.id === currentConversationId
                      ? 'bg-sitebuilder-primary bg-opacity-10 border-l-4 border-sitebuilder-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => switchConversation(conversation.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(conversation.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all"
                    aria-label="Delete conversation"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {conversations.find(c => c.id === currentConversationId)?.title || 'Chat'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connected to n8n workflow • {sessionManager.getSessionId().substring(0, 8)}...
                {supabaseService.isEnabled() && (
                  <span className="ml-2">• Supabase enabled</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto space-y-4">
            {currentMessages.map(message => (
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
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSendMessage={sendMessage}
              disabled={isTyping}
              placeholder="Ask me about building your website..."
            />
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <ErrorToast
          error={error}
          onRetry={error.retryable ? handleRetry : undefined}
          onDismiss={handleDismissError}
        />
      )}
    </div>
  );
};

export default FullPageChat; 