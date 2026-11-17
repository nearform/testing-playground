import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { expect, afterEach } from 'vitest'
import '@testing-library/jest-dom'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  // The theme toggle writes to <html> and localStorage; keep tests independent
  document.documentElement.classList.remove('dark')
  localStorage.removeItem('theme')
})

// Node.js 22+ exposes a native localStorage/sessionStorage getter that returns
// undefined unless --localstorage-file is passed. jsdom cannot reliably override
// it via simple assignment, so we force the definition here.
const makeStorageMock = (): Storage => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage
}

if (typeof localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: makeStorageMock(),
    configurable: true,
    writable: true,
  })
}

if (typeof sessionStorage === 'undefined') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: makeStorageMock(),
    configurable: true,
    writable: true,
  })
}

// Required, due to Nearform Quantum dependencies
class ResizeObserver {
  [x: string]: unknown
  constructor(callback: unknown) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserver

// jsdom has no matchMedia; Quantum's ThemeToggle reads the system colour
// scheme through it. Report light mode unless a test overrides it.
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  })
}
