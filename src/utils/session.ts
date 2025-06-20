// Session management utilities for SiteBuilder Chat
// Created: UUID session management, localStorage handling, and session persistence

import { v4 as uuidv4 } from 'uuid';

const SESSION_STORAGE_KEY = 'sitebuilder-chat-session';

export class SessionManager {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSession();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  private getOrCreateSession(): string {
    try {
      // Try to get existing session from localStorage
      const existingSession = localStorage.getItem(SESSION_STORAGE_KEY);
      
      if (existingSession && this.isValidUUID(existingSession)) {
        return existingSession;
      }
    } catch (error) {
      // localStorage might not be available (incognito mode, etc.)
      console.warn('localStorage not available, using temporary session');
    }

    // Generate new session ID
    const newSessionId = uuidv4();
    this.saveSession(newSessionId);
    return newSessionId;
  }

  private saveSession(sessionId: string): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch (error) {
      // Ignore localStorage errors - session will be temporary
      console.warn('Could not save session to localStorage');
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear session from localStorage');
    }
    this.sessionId = uuidv4();
    this.saveSession(this.sessionId);
  }
}

export default new SessionManager(); 