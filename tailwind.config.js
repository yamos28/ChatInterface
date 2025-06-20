// Tailwind CSS configuration for SiteBuilder Chat
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sitebuilder': {
          'primary': '#312e81', // Header color
          'user-bubble': '#4f46e5', // Indigo user bubble
          'bot-bubble': '#f1f5f9', // Gray-100 bot bubble
          'bot-text': '#0f172a' // Slate-900 bot text
        }
      },
      animation: {
        'typing': 'typing 1.4s infinite ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-10px)' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideUp: {
          'from': { transform: 'translateY(10px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
  // Ensure dark mode works
  darkMode: 'media'
} 