import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    // Bind-mounted volumes from a Windows host into a Linux container don't
    // propagate inotify file-change events reliably, so Vite's default watcher
    // misses edits entirely. Polling checks file mtimes on an interval instead,
    // which works regardless of the host filesystem.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
