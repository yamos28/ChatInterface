# SiteBuilder Chat

A production-ready embeddable chat widget for n8n Cloud workflows. Built with React, TypeScript, and TailwindCSS.

## Features

- 🚀 **Embeddable**: Simple `<script>` tag integration
- 💬 **Modern UI**: Responsive design with Relevance-AI styling
- 🔒 **Secure**: Built-in XSS protection and rate limiting
- ♿ **Accessible**: ARIA labels and screen reader support
- 🌙 **Dark Mode**: Automatic dark mode support
- 📱 **Mobile**: Responsive design for all devices
- ⚡ **Fast**: Optimized bundle size (<150KB gzipped)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.sample` to `.env` and configure your settings:

```bash
cp .env.sample .env
```

Required environment variables:

```env
# Required: Your n8n Cloud webhook URL
VITE_WEBHOOK_URL=https://hook.n8n.cloud/webhook/your-webhook-path

# Optional: Bearer token for authentication
VITE_WEBHOOK_TOKEN=your-bearer-token

# Optional: Chat widget title (default: "SiteBuilder")
VITE_CHAT_TITLE=SiteBuilder

# Optional: Enable debug mode (default: false)
VITE_DEBUG=false
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## n8n Cloud Setup

### 1. Create Webhook Node

1. In your n8n workflow, add a **Webhook** node
2. Set the HTTP Method to `POST`
3. Set the Path to something like `/sitebuilder-chat`
4. The webhook URL will be: `https://hook.n8n.cloud/webhook/sitebuilder-chat`

### 2. Configure Webhook Response

Your n8n workflow should return a JSON response in this format:

```json
{
  "reply": "Your bot response here (markdown supported)",
  "follow_up": ["Question 1?", "Question 2?"]
}
```

- `reply`: The bot's response (supports markdown)
- `follow_up`: Optional array of quick-reply buttons

### 3. Domain Whitelisting

In n8n Cloud settings:
1. Go to your webhook settings
2. Add your domain to the CORS whitelist
3. Include both `http://localhost:3000` (for development) and your production domain

## Embedding the Widget

### Method 1: Direct Script Tag

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your content -->
    
    <!-- SiteBuilder Chat Widget -->
    <div id="sitebuilder-chat-root"></div>
    <script src="./dist/sitebuilder-chat.js"></script>
    <script>
        SiteBuilderChat.init({
            webhookUrl: 'https://hook.n8n.cloud/webhook/your-webhook-path',
            title: 'SiteBuilder',
            debug: false
        });
    </script>
</body>
</html>
```

### Method 2: Dynamic Loading

```html
<script>
(function() {
    // Create container
    const container = document.createElement('div');
    container.id = 'sitebuilder-chat-root';
    document.body.appendChild(container);
    
    // Load script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/sitebuilder-chat.js';
    script.onload = function() {
        SiteBuilderChat.init({
            webhookUrl: 'https://hook.n8n.cloud/webhook/your-webhook-path',
            webhookToken: 'optional-bearer-token',
            title: 'Your Assistant',
            debug: false
        });
    };
    document.head.appendChild(script);
})();
</script>
```

## API Reference

### Chat Widget Configuration

```typescript
interface ChatConfig {
  webhookUrl: string;    // Required: n8n webhook URL
  webhookToken?: string; // Optional: Bearer token
  title: string;         // Chat widget title
  debug: boolean;        // Enable debug logging
}
```

### Webhook Request Format

Your n8n webhook will receive:

```json
{
  "session_id": "uuid-v4-string",
  "message": "User's message",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Webhook Response Format

Your n8n workflow should return:

```json
{
  "reply": "Bot response (markdown supported)",
  "follow_up": ["Optional", "Quick replies"]
}
```

## Features in Detail

### Rate Limiting
- Prevents spam with 500ms debounce
- Handles 429 responses with exponential backoff
- Maximum 3 retry attempts

### Error Handling
- Network timeouts (30 seconds)
- Retry functionality for failed requests
- User-friendly error messages
- Graceful fallbacks

### Accessibility
- ARIA labels on all interactive elements
- Screen reader announcements for new messages
- Keyboard navigation support
- High contrast mode compatibility

### Security
- XSS protection with DOMPurify
- CORS support
- No inline scripts in production
- Environment variable validation

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

### Project Structure

```
src/
├── components/         # React components
│   ├── ChatWidget.tsx     # Main chat interface
│   ├── MessageBubble.tsx  # Individual messages
│   ├── ChatInput.tsx      # Message input
│   ├── TypingIndicator.tsx # Typing animation
│   ├── QuickReplyButtons.tsx # Follow-up buttons
│   └── ErrorToast.tsx     # Error handling
├── types/             # TypeScript definitions
├── utils/             # Utility functions
│   ├── api.ts            # Webhook communication
│   ├── session.ts        # Session management
│   ├── markdown.ts       # Markdown rendering
│   └── debounce.ts       # Rate limiting
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Styles
```

### Customization

To customize the appearance, modify:

1. **Colors**: Update `tailwind.config.js` color scheme
2. **Layout**: Modify CSS classes in `src/index.css`
3. **Branding**: Change title and avatar in `ChatWidget.tsx`

## Troubleshooting

### Common Issues

**Error: "Webhook URL not configured"**
- Ensure `VITE_WEBHOOK_URL` is set in your `.env` file
- Verify the URL is accessible and returns JSON

**Error: "CORS blocked"**
- Add your domain to n8n Cloud CORS whitelist
- Include both development and production URLs

**Error: "Network error"**
- Check your internet connection
- Verify the webhook URL is correct
- Test the webhook directly with curl

### Debug Mode

Enable debug mode to see detailed logging:

```env
VITE_DEBUG=true
```

This will log all API requests and responses to the browser console.

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the GitHub repository. 