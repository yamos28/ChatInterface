# SiteBuilder Chat

A production-ready, embeddable AI chat widget for website building assistance, powered by n8n Cloud workflows and Supabase for persistent chat history.

## ✨ Features

### Core Features
- 🤖 **AI-Powered Conversations** - Connected to n8n Cloud workflows
- 💬 **Full-Page Chat Interface** - Modern chat application with sidebar navigation
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🎨 **Modern UI/UX** - Clean, accessible design with dark mode support
- ⚡ **Fast & Lightweight** - 72.46 kB gzipped bundle size

### Chat Management
- 💾 **Persistent Chat History** - Conversations saved with Supabase
- 🔄 **Cross-Device Synchronization** - Access chats from any device
- 📁 **Conversation Organization** - Create, switch, and delete conversations
- 🔍 **Smart Search** - Find conversations quickly
- 💡 **Auto-Generated Titles** - Conversations titled from first user message

### Technical Features
- ⚙️ **Environment Configuration** - Easy setup with environment variables
- 🛡️ **Error Handling** - Robust error handling with retry capabilities
- 🚀 **Rate Limiting** - Prevents API abuse with debounced requests
- 🔒 **Secure** - Row-level security with Supabase
- 📊 **Real-time Sync Status** - Visual indicators for sync status

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yamos28/ChatInterface.git
cd ChatInterface
npm install
```

### 2. Configure Environment
Create a `.env.local` file with your configuration:

```env
# n8n Webhook Configuration
VITE_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook-test/your-webhook-id
VITE_WEBHOOK_TOKEN=your-optional-webhook-token

# Supabase Configuration (optional - for persistent history)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key

# Chat Configuration
VITE_CHAT_TITLE=SiteBuilder Chat
VITE_DEBUG=false
```

### 3. Set Up Supabase (Optional)
For persistent chat history and cross-device sync:

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor
3. Add your Supabase credentials to `.env.local`

See `SUPABASE_SETUP.md` for detailed instructions.

### 4. Start Development
```bash
npm run dev
```

The chat interface will be available at `http://localhost:3000`

## 🗄️ Database Schema

When Supabase is configured, the following tables are created:

### `conversations`
- Stores chat conversation metadata
- Includes user_id, title, last_message, timestamps
- Row-level security enabled

### `messages`
- Stores individual chat messages
- Linked to conversations with foreign key
- Supports markdown content and user/bot distinction

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_WEBHOOK_URL`
   - `VITE_SUPABASE_URL` (if using Supabase)
   - `VITE_SUPABASE_ANON_KEY` (if using Supabase)

### Other Platforms
The app builds to static files and can be deployed to any static hosting service:
```bash
npm run build
# Deploy the 'dist' folder
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_WEBHOOK_URL` | ✅ | Your n8n webhook URL |
| `VITE_WEBHOOK_TOKEN` | ❌ | Optional webhook authentication token |
| `VITE_SUPABASE_URL` | ❌ | Supabase project URL (for persistence) |
| `VITE_SUPABASE_ANON_KEY` | ❌ | Supabase anonymous key (for persistence) |
| `VITE_CHAT_TITLE` | ❌ | Custom chat title (default: "SiteBuilder Chat") |
| `VITE_DEBUG` | ❌ | Enable debug mode (default: false) |

### Fallback Mode
If Supabase is not configured, the app automatically falls back to localStorage for basic chat history within the same browser session.

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Package Manager**: npm

### Project Structure
```
src/
├── components/         # React components
│   ├── FullPageChat.tsx   # Main chat interface
│   ├── MessageBubble.tsx  # Individual message display
│   └── ...
├── utils/             # Utility functions
│   ├── api.ts         # n8n webhook client
│   ├── supabase.ts    # Database operations
│   └── ...
├── types/             # TypeScript definitions
└── ...
```

### Build Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests (if configured)
```

## 📚 API Integration

### n8n Webhook Format
The chat sends POST requests to your n8n webhook with:

```json
{
  "session_id": "uuid-v4",
  "message": "user message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Expected response format:
```json
{
  "reply": "AI response message",
  "follow_up": ["Optional", "follow-up", "questions"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check `SUPABASE_SETUP.md` for database setup
- Review environment variable configuration
- Ensure your n8n webhook accepts POST requests
- Test with the included `test-webhook.js` mock server

## 🔗 Links

- [Live Demo](https://your-vercel-deployment-url.vercel.app)
- [GitHub Repository](https://github.com/yamos28/ChatInterface)
- [n8n Documentation](https://docs.n8n.io/)
- [Supabase Documentation](https://supabase.com/docs) 