import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { quantumThemeInit } from './quantumThemeInit.ts'

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
    // Node 25+ has its own localStorage, which hides jsdom's and warns once
    // per worker that it has no file to keep it in. Turning it off leaves
    // jsdom's storage, as in a browser. (The --experimental- spelling is the
    // one Node 22 and 24 know too.)
    execArgv: ['--no-experimental-webstorage'],
    // i18next keeps one shared instance, so these are loaded as the app's own
    // modules are: a test that reloads the app with vi.resetModules then
    // starts a fresh instance, as a visitor opening the page does, rather
    // than one still holding the texts and changes of earlier tests
    server: { deps: { inline: ['i18next', 'react-i18next'] } },
  },
})
