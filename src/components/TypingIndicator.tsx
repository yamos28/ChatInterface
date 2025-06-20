// TypingIndicator component for SiteBuilder Chat
// Created: Animated typing indicator to show bot is responding

import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-3">
      <div className="message-bubble message-bot">
        <div className="typing-indicator" aria-label="Bot is typing">
          <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
          <div className="typing-dot" style={{ animationDelay: '150ms' }}></div>
          <div className="typing-dot" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="sr-only">Bot is typing a response...</span>
      </div>
    </div>
  );
};

export default TypingIndicator; 