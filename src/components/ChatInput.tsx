// ChatInput component for SiteBuilder Chat
// Created: Input field with debouncing, keyboard shortcuts (Ctrl+Enter), and emoji support

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { debounce } from '../utils/debounce';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const BASIC_EMOJIS = ['😊', '👍', '❤️', '😄', '😢', '😮', '😡', '🤔', '👏', '🙏'];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Debounced send function to prevent spam
  const debouncedSend = useCallback(
    debounce((msg: string) => {
      if (msg.trim()) {
        onSendMessage(msg.trim());
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }, 500),
    [onSendMessage]
  );

  const handleSend = () => {
    if (message.trim() && !disabled) {
      debouncedSend(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd + Enter to send
        e.preventDefault();
        handleSend();
      } else if (!e.shiftKey) {
        // Enter to send (unless Shift is held for new line)
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  return (
    <div className="chat-input-container">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="chat-input min-h-[40px] max-h-[120px]"
            rows={1}
            aria-label="Type your message"
          />
          
          {/* Emoji picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Add emoji"
            >
              😊
            </button>
            
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10"
              >
                {BASIC_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    aria-label={`Add ${emoji} emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            disabled || !message.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-sitebuilder-primary text-white hover:bg-opacity-90'
          }`}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line, Ctrl+Enter to send
      </div>
    </div>
  );
};

export default ChatInput; 