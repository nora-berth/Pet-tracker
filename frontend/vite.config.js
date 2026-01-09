import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    reporters: [
      'default',
      ['allure-vitest/reporter', {
        resultsDir: './allure-results',
        detail: true,
        suiteTitle: true,
      }]
    ],
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
