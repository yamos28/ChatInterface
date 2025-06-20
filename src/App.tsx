// Main app component for SiteBuilder Chat - Updated to use full-page interface
// Recent changes: Switched from popup widget to full-page chat interface with history

import { ChatConfig } from './types';
import FullPageChat from './components/FullPageChat';

const config: ChatConfig = {
  title: 'SiteBuilder Chat',
  subtitle: 'Your AI Website Building Assistant',
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || 'https://locallead.app.n8n.cloud/webhook-test/8d78514c-f2bc-43da-8dd8-f6547d4ed2c9',
  webhookToken: import.meta.env.VITE_WEBHOOK_TOKEN || '',
  showQuickReplies: true,
  theme: {
    primaryColor: '#312e81',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    userMessageColor: '#312e81',
    botMessageColor: '#f3f4f6',
  },
  position: 'bottom-right',
  debug: import.meta.env.DEV,
};

function App() {
  return (
    <div className="h-screen">
      <FullPageChat config={config} />
    </div>
  );
}

export default App; 