// Supabase client configuration and database utilities
// Created: Database operations for persistent chat history and cross-device sync

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatMessage } from '../types';

// Database types
export interface DbConversation {
  id: string;
  user_id: string;
  title: string;
  last_message: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  content: string;
  is_user: boolean;
  is_markdown: boolean;
  timestamp: string;
  created_at: string;
}

class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private userId: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.initializeUser();
    } else {
      console.warn('Supabase not configured. Using localStorage fallback.');
    }
  }

  private async initializeUser() {
    if (!this.supabase) return;

    // Generate or retrieve anonymous user ID
    let userId = localStorage.getItem('sitebuilder-user-id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('sitebuilder-user-id', userId);
    }
    this.userId = userId;
  }

  isEnabled(): boolean {
    return this.supabase !== null;
  }

  getUserId(): string | null {
    return this.userId;
  }

  // Conversations operations
  async getConversations(): Promise<DbConversation[]> {
    if (!this.supabase || !this.userId) return [];

    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async createConversation(title: string, lastMessage: string): Promise<string | null> {
    if (!this.supabase || !this.userId) return null;

    try {
      const conversationId = crypto.randomUUID();
      const { error } = await this.supabase
        .from('conversations')
        .insert({
          id: conversationId,
          user_id: this.userId,
          title,
          last_message: lastMessage,
        });

      if (error) throw error;
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  async updateConversation(conversationId: string, title: string, lastMessage: string): Promise<boolean> {
    if (!this.supabase || !this.userId) return false;

    try {
      const { error } = await this.supabase
        .from('conversations')
        .update({
          title,
          last_message: lastMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    if (!this.supabase || !this.userId) return false;

    try {
      // Delete messages first
      await this.supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Then delete conversation
      const { error } = await this.supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Messages operations
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return (data || []).map((msg: DbMessage) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp,
        isUser: msg.is_user,
        isMarkdown: msg.is_markdown,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async addMessage(conversationId: string, message: Omit<ChatMessage, 'id'>): Promise<string | null> {
    if (!this.supabase) return null;

    try {
      const messageId = crypto.randomUUID();
      const { error } = await this.supabase
        .from('messages')
        .insert({
          id: messageId,
          conversation_id: conversationId,
          content: message.content,
          is_user: message.isUser,
          is_markdown: message.isMarkdown || false,
          timestamp: message.timestamp,
        });

      if (error) throw error;
      return messageId;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }

  // Sync operations
  async syncConversation(conversationId: string, messages: ChatMessage[]): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      // Get existing messages
      const existingMessages = await this.getMessages(conversationId);
      const existingIds = new Set(existingMessages.map(m => m.id));

      // Add new messages
      const newMessages = messages.filter(m => !existingIds.has(m.id));
      
      for (const message of newMessages) {
        await this.addMessage(conversationId, message);
      }

      return true;
    } catch (error) {
      console.error('Error syncing conversation:', error);
      return false;
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
export default supabaseService; 