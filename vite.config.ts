import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleAnalyzeRequest } from './server/geminiAnalyze'

export const ANALYZE_ROUTE = '/api/gemini/analyze'

/**
 * Serves the Gemini call from the Node side of the dev/preview server so the
 * API key never reaches the browser. Mounted on both servers because
 * `vite preview` does not run `configureServer`.
 */
function geminiApiPlugin(mode: string): Plugin {
  // Loaded with an empty prefix: server-side only, never exposed to the client.
  const apiKey = loadEnv(mode, process.cwd(), '').GEMINI_API_KEY

  const middleware = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
      if (req.url !== ANALYZE_ROUTE || req.method !== 'POST') return next()
      void handleAnalyzeRequest(req, res, apiKey)
    })
  }

  return {
    name: 'gemini-api',
    configureServer: middleware,
    configurePreviewServer: middleware,
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), geminiApiPlugin(mode)],
  // NOTE: GEMINI_ is deliberately NOT in envPrefix. Exposing it would inline
  // the API key into the client bundle for anyone to read.
  envPrefix: ['VITE_'],
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
}))
