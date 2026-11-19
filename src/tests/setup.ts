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
