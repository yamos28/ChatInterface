# Supabase Setup for SiteBuilder Chat

## 🚀 Quick Setup

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com)
- Click "Start your project"
- Create a new project

### 2. Set up Database Schema
Execute the SQL from `supabase/schema.sql` in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of supabase/schema.sql
```

### 3. Environment Variables
Add these to your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key

# n8n Webhook (existing)
VITE_WEBHOOK_URL=https://locallead.app.n8n.cloud/webhook-test/8d78514c-f2bc-43da-8dd8-f6547d4ed2c9
VITE_WEBHOOK_TOKEN=

# Optional
VITE_CHAT_TITLE=SiteBuilder Chat
VITE_DEBUG=false
```

### 4. Get Your Supabase Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy the "Project URL" → This is your `VITE_SUPABASE_URL`
3. Copy the "anon public" key → This is your `VITE_SUPABASE_ANON_KEY`

### 5. Features Enabled
✅ **Persistent Chat History** - Chats saved across browser sessions
✅ **Cross-Device Sync** - Access your chats from any device
✅ **Anonymous Users** - No login required, uses device-specific UUID
✅ **Automatic Cleanup** - Messages deleted when conversations are deleted
✅ **Performance Optimized** - Database indexes for fast queries

### 6. Fallback Mode
If Supabase is not configured, the app automatically falls back to localStorage for basic functionality.

### 7. Database Tables Created
- `conversations` - Chat conversation metadata
- `messages` - Individual chat messages  
- Includes indexes, triggers, and RLS policies for security

### 8. Deploy Environment Variables
For Vercel deployment, add the environment variables in your Vercel dashboard:
- Project Settings → Environment Variables
- Add each VITE_* variable with its value 