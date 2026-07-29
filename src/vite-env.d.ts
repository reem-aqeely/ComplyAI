/// <reference types="vite/client" />

// GEMINI_API_KEY is intentionally absent: it is a server-only variable read in
// vite.config.ts and never exposed to the client via import.meta.env.
interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
