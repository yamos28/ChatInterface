// API utility functions for SiteBuilder Chat webhook communication
// Created: Webhook communication, rate limiting, retry logic, and error handling

import { WebhookRequest, WebhookResponse, ChatError } from '../types';

class ApiClient {
  private webhookUrl: string;
  private webhookToken?: string;
  private retryCount = 0;
  private maxRetries = 3;
  private baseDelay = 2000; // 2 seconds base delay

  constructor(webhookUrl: string, webhookToken?: string) {
    this.webhookUrl = webhookUrl;
    this.webhookToken = webhookToken;
  }

  async sendMessage(request: WebhookRequest): Promise<WebhookResponse> {
    this.retryCount = 0;
    return this.makeRequest(request);
  }

  private async makeRequest(request: WebhookRequest): Promise<WebhookResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.webhookToken) {
        headers['Authorization'] = `Bearer ${this.webhookToken}`;
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        // Rate limited - implement exponential backoff
        if (this.retryCount < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, this.retryCount);
          this.retryCount++;
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(request);
        } else {
          throw this.createError('rate_limit', 'Too many requests. Please try again later.', false);
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw this.createError('server', `Server error (${response.status}): ${errorText}`, response.status >= 500);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.reply || typeof data.reply !== 'string') {
        throw this.createError('server', 'Invalid response format from webhook', false);
      }

      return {
        reply: data.reply,
        follow_up: Array.isArray(data.follow_up) ? data.follow_up : undefined,
      };

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createError('timeout', 'Connection lost – retry', true);
        }
        
        if (error.message.includes('fetch')) {
          throw this.createError('network', 'Network error. Please check your connection.', true);
        }
      }

      // Re-throw ChatError instances
      if (this.isChatError(error)) {
        throw error;
      }

      // Unknown error
      throw this.createError('network', 'An unexpected error occurred', true);
    }
  }

  private createError(type: ChatError['type'], message: string, retryable: boolean): ChatError {
    return { type, message, retryable };
  }

  private isChatError(error: unknown): error is ChatError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error &&
      'retryable' in error
    );
  }
}

export default ApiClient; 