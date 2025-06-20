// Simple test webhook server for SiteBuilder Chat development
// Created: Mock n8n webhook responses for testing the chat interface

const http = require('http');
const url = require('url');

const PORT = 3001;

// Sample responses for testing
const responses = {
  default: {
    reply: "Hello! I'm SiteBuilder, your AI assistant. I can help you create amazing websites. What type of website are you looking to build?",
    follow_up: ["Business website", "Personal portfolio", "E-commerce store", "Blog"]
  },
  business: {
    reply: "Great choice! For a business website, I can help you create a professional site that showcases your services and builds trust with customers. What industry is your business in?",
    follow_up: ["Technology", "Healthcare", "Consulting", "Retail"]
  },
  portfolio: {
    reply: "Perfect! A personal portfolio is essential for showcasing your work. What's your profession or area of expertise?",
    follow_up: ["Designer", "Developer", "Photographer", "Writer"]
  },
  ecommerce: {
    reply: "Excellent! E-commerce is booming. I'll help you create a store that converts visitors into customers. What products will you be selling?",
    follow_up: ["Physical products", "Digital products", "Services", "Subscriptions"]
  },
  blog: {
    reply: "Blogging is a fantastic way to share your expertise! I can help you create a blog that engages readers. What topics will you write about?",
    follow_up: ["Technology", "Lifestyle", "Business", "Travel"]
  }
};

function getResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('business')) return responses.business;
  if (lowerMessage.includes('portfolio')) return responses.portfolio;
  if (lowerMessage.includes('ecommerce') || lowerMessage.includes('store')) return responses.ecommerce;
  if (lowerMessage.includes('blog')) return responses.blog;
  
  // For demo purposes, cycle through different responses
  const responseKeys = Object.keys(responses);
  const randomKey = responseKeys[Math.floor(Math.random() * responseKeys.length)];
  return responses[randomKey];
}

const server = http.createServer((req, res) => {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        console.log('Received request:', requestData);
        
        // Simulate processing delay
        setTimeout(() => {
          const response = getResponse(requestData.message);
          console.log('Sending response:', response);
          
          res.writeHead(200);
          res.end(JSON.stringify(response));
        }, 1000); // 1 second delay to simulate real API
        
      } catch (error) {
        console.error('Error parsing request:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    // Handle non-POST requests
    res.writeHead(200);
    res.end(JSON.stringify({ 
      message: 'SiteBuilder Chat Test Webhook Server',
      status: 'running',
      endpoint: `http://localhost:${PORT}/webhook`
    }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 SiteBuilder Chat Test Webhook Server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`\n💡 To test the chat widget:`);
  console.log(`   1. Set VITE_WEBHOOK_URL=http://localhost:${PORT}/webhook in your .env file`);
  console.log(`   2. Run 'npm run dev' in another terminal`);
  console.log(`   3. Open http://localhost:3000 to test the chat`);
  console.log(`\n🛑 Press Ctrl+C to stop the server\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test webhook server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
}); 