import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // ── SPA Fallback ─────────────────────────────────────────────────────────
    // Without this, directly navigating to /submit-project, /dashboard, etc.
    // in the browser returns 404 because Vite looks for a physical file.
    // historyApiFallback ensures ALL unmatched paths serve index.html so
    // React Router can handle them on the client.
    historyApiFallback: true,

    // ── Port config ───────────────────────────────────────────────────────────
    // Use 5173 as primary; if busy Vite auto-increments. strictPort: false
    // avoids crashes when the port is already in use (dev ergonomics).
    port: 5173,
    strictPort: false,

    // ── CORS proxy for backend API calls ──────────────────────────────────────
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ── Preview (production build) also needs the SPA fallback ────────────────
  preview: {
    historyApiFallback: true,
    port: 4173,
  },
})
