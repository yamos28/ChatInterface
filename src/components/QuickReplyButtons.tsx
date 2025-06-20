// QuickReplyButtons component for SiteBuilder Chat
// Created: Quick reply buttons for follow-up questions from webhook responses

import React from 'react';

interface QuickReplyButtonsProps {
  followUps: string[];
  onQuickReply: (text: string) => void;
  disabled?: boolean;
}

export const QuickReplyButtons: React.FC<QuickReplyButtonsProps> = ({
  followUps,
  onQuickReply,
  disabled = false,
}) => {
  if (!followUps || followUps.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-xs">
        <div className="flex flex-wrap gap-2">
          {followUps.map((question, index) => (
            <button
              key={index}
              onClick={() => onQuickReply(question)}
              disabled={disabled}
              className={`quick-reply-button ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label={`Quick reply: ${question}`}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickReplyButtons; 