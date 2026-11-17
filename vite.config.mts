import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/testing-playground/#',
  build: {
    minify: false,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    // Vitest stubs stylesheets as empty modules; let index.css load so tests
    // can read its source with a ?raw import
    css: { include: [/\/src\/index\.css(\?|$)/] },
  },
})
