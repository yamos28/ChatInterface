// MessageBubble component for SiteBuilder Chat
// Created: Individual message display with markdown rendering and accessibility features

import React from 'react';
import { ChatMessage } from '../types';
import { renderMarkdown, isMarkdown } from '../utils/markdown';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { content, isUser, timestamp } = message;
  
  // Determine if content should be rendered as markdown
  const shouldRenderMarkdown = !isUser && (message.isMarkdown || isMarkdown(content));
  
  const bubbleClasses = `message-bubble ${
    isUser ? 'message-user' : 'message-bot'
  }`;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={bubbleClasses}>
        {shouldRenderMarkdown ? (
          <div
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            aria-label={`Bot message: ${content}`}
          />
        ) : (
          <p 
            className="whitespace-pre-wrap break-words"
            aria-label={`${isUser ? 'Your' : 'Bot'} message: ${content}`}
          >
            {content}
          </p>
        )}
        <div className={`text-xs mt-1 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 