import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { expect, afterEach } from 'vitest'
import '@testing-library/jest-dom'

expect.extend(matchers)

afterEach(() => {
  cleanup()
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
  Object.defineProperty(global, 'localStorage', {
    value: makeStorageMock(),
    configurable: true,
    writable: true,
  })
}

if (typeof sessionStorage === 'undefined') {
  Object.defineProperty(global, 'sessionStorage', {
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
global.ResizeObserver = ResizeObserver
