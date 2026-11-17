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
    // Vitest stubs stylesheets as empty modules. Let the ?raw import of
    // index.css through so tests can read its source; a plain import still
    // gets the stub, so no test compiles Tailwind
    css: { include: [/\/src\/index\.css\?raw$/] },
  },
})
