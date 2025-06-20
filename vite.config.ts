// Vite configuration for SiteBuilder Chat embeddable widget
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Single file for easy embedding
        entryFileNames: 'sitebuilder-chat.js',
        chunkFileNames: 'sitebuilder-chat-[hash].js',
        assetFileNames: 'sitebuilder-chat-[hash].[ext]'
      }
    },
    // Optimize for size
    minify: true,
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'es2020'
  },
  define: {
    // Ensure environment variables are available
    'process.env': process.env
  },
  server: {
    port: 3000,
    open: true
  }
}) 