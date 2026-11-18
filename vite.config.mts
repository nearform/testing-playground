import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/testing-playground/',
  build: {
    // Minified for size; the source maps keep the shipped code readable in
    // the browser's developer tools
    sourcemap: true,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
  },
})
