// ErrorToast component for SiteBuilder Chat
// Created: Error message display with retry functionality and auto-dismiss

import React, { useEffect } from 'react';
import { ChatError } from '../types';

interface ErrorToastProps {
  error: ChatError;
  onRetry?: () => void;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onRetry,
  onDismiss,
  autoHide = true,
  duration = 5000,
}) => {
  useEffect(() => {
    if (autoHide && !error.retryable) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, error.retryable, onDismiss]);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return '🌐';
      case 'timeout':
        return '⏱️';
      case 'rate_limit':
        return '⚠️';
      case 'server':
        return '🔧';
      default:
        return '❌';
    }
  };

  return (
    <div className="error-toast" role="alert" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg" aria-hidden="true">
            {getErrorIcon()}
          </span>
          <div>
            <p className="font-medium">{error.message}</p>
            {error.type === 'rate_limit' && (
              <p className="text-sm opacity-90">Please wait before sending another message.</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition-colors"
              aria-label="Retry sending message"
            >
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            aria-label="Dismiss error message"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast; 