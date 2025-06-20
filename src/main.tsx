// Main entry point for SiteBuilder Chat
// Created: React app initialization and rendering to embeddable container

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Find or create the container for the chat widget
const containerId = 'sitebuilder-chat-root';
let container = document.getElementById(containerId);

if (!container) {
  // Create container if it doesn't exist (for standalone mode)
  container = document.createElement('div');
  container.id = containerId;
  document.body.appendChild(container);
}

// Render the chat widget
ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Export for external embedding
declare global {
  interface Window {
    SiteBuilderChat: {
      init: (config?: {
        webhookUrl?: string;
        webhookToken?: string;
        title?: string;
        debug?: boolean;
      }) => void;
    };
  }
}

// Make the chat widget available globally for embedding
window.SiteBuilderChat = {
  init: (config) => {
    // Override environment variables with provided config
    if (config) {
      if (config.webhookUrl) {
        (import.meta.env as any).VITE_WEBHOOK_URL = config.webhookUrl;
      }
      if (config.webhookToken) {
        (import.meta.env as any).VITE_WEBHOOK_TOKEN = config.webhookToken;
      }
      if (config.title) {
        (import.meta.env as any).VITE_CHAT_TITLE = config.title;
      }
      if (config.debug !== undefined) {
        (import.meta.env as any).VITE_DEBUG = config.debug.toString();
      }
    }
    
    // Re-render with new config
    ReactDOM.createRoot(container!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
}; 