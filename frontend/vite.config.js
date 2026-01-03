import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Exclude Playwright e2e tests from Vitest
    exclude: [
      'node_modules',
      'dist',
      'build',
      'e2e/**',
      '**/e2e/**',
      'playwright-report/**',
    ],
  },
})