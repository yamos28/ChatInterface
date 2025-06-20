/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBHOOK_URL: string
  readonly VITE_WEBHOOK_TOKEN?: string
  readonly VITE_CHAT_TITLE?: string
  readonly VITE_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 