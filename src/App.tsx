// Main App component for SiteBuilder Chat
// Created: Environment configuration and ChatWidget initialization

import { useMemo } from 'react';
import ChatWidget from './components/ChatWidget';
import { ChatConfig } from './types';

function App() {
  const config: ChatConfig = useMemo(() => {
    // Get configuration from environment variables
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || '';
    const webhookToken = import.meta.env.VITE_WEBHOOK_TOKEN || undefined;
    const title = import.meta.env.VITE_CHAT_TITLE || 'SiteBuilder';
    const debug = import.meta.env.VITE_DEBUG === 'true';

    // Validate required configuration
    if (!webhookUrl) {
      console.error('VITE_WEBHOOK_URL is required but not set');
    }

    return {
      webhookUrl,
      webhookToken,
      title,
      debug,
    };
  }, []);

  // Show configuration error if webhook URL is missing
  if (!config.webhookUrl) {
    return (
      <div className="fixed bottom-4 right-4 w-80 h-96 bg-red-50 border border-red-200 rounded-xl shadow-2xl flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <h3 className="font-semibold text-red-800 mb-1">Configuration Error</h3>
          <p className="text-sm text-red-600">
            Webhook URL not configured. Please set VITE_WEBHOOK_URL environment variable.
          </p>
        </div>
      </div>
    );
  }

  return <ChatWidget config={config} />;
}

export default App; 