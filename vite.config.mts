import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { quantumThemeInit } from './quantumThemeInit'

export default defineConfig({
  base: '/testing-playground/',
  build: {
    // Minified for size; the source maps keep the shipped code readable in
    // the browser's developer tools
    sourcemap: true,
  },
  plugins: [react(), quantumThemeInit()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
})
