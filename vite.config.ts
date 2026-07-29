import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow GEMINI_API_KEY (no VITE_ prefix) to be read via import.meta.env,
  // per the project's environment variable convention.
  // NOTE: this inlines the key into the client bundle — it is readable by
  // anyone who loads the app. Restrict/rotate the key accordingly.
  envPrefix: ['VITE_', 'GEMINI_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // The bundled DGA knowledge base JSON (~230KB) plus the charting/routing
    // vendor chunk naturally exceed the default 500KB advisory for this app.
    chunkSizeWarningLimit: 1600,
  },
})
