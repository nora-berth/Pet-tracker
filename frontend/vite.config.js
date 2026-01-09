import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Allure Vitest reporter configuration
const allureAvailable = existsSync(resolve(__dirname, 'node_modules/allure-vitest'))
const reporters = ['default']
if (allureAvailable) {
  reporters.push(['allure-vitest/reporter', {
    resultsDir: './allure-results',
    detail: true,
    suiteTitle: true,
  }])
}

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
    reporters,
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
