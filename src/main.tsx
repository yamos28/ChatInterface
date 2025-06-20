// Main entry point for SiteBuilder Chat - Updated for full-page interface
// Recent changes: Changed from widget embed to full-page React app

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Mount the full-page chat application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}

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
    const root = createRoot(container!);
    root.render(<App />);
  }
}; 