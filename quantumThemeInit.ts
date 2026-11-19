import { themeInitScript } from '@nearform/quantum/theme-init'
import type { Plugin } from 'vite'

// Apply the saved or system theme before first paint, so dark mode does not
// flash light on load. Quantum's own script, first in <head> so it runs
// before the stylesheet loads. Kept out of vite.config.mts so tests can load
// it without loading Vite.
export const quantumThemeInit = (): Plugin => ({
  name: 'quantum-theme-init',
  transformIndexHtml: () => [
    { tag: 'script', children: themeInitScript, injectTo: 'head-prepend' },
  ],
})
