import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { expect, afterEach } from 'vitest'
import '@testing-library/jest-dom'

expect.extend(matchers)

afterEach(() => {
  cleanup()
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
global.ResizeObserver = ResizeObserver
