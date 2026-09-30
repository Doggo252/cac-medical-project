import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on every network address, not just localhost, so the phone on the
    // same wifi can open the app. Vite prints the address to use.
    host: true,
    // The phone only knows the app's address. Anything under /api is passed
    // through to the backend, so the phone never needs a second address.
    proxy: {
      '/api': { target: 'http://localhost:8000', rewrite: (path) => path.replace(/^\/api/, '') },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
