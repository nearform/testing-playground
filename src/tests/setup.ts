// Adds jest-dom's matchers, such as toBeVisible, to Vitest's expect
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom 31 has no srcdoc, so an iframe given one fires the load of its empty
// first document as soon as it is inserted. That happens while React is
// committing, when it ignores events, so onLoad never runs. Browsers load a
// srcdoc a moment later, so the load is passed on a moment later here too.
// Frames can be nested, so each frame's document is watched in turn.
const delayedLoads = new WeakSet<Event>()
const delaySrcdocLoads = (watched: Document): void => {
  watched.addEventListener(
    'load',
    (event) => {
      // Compared by tag, as a nested frame's elements are from its own window
      const frame = event.target as HTMLIFrameElement
      if (
        frame.tagName !== 'IFRAME' ||
        !frame.hasAttribute('srcdoc') ||
        delayedLoads.has(event)
      ) {
        return
      }
      event.stopImmediatePropagation()
      setTimeout(() => {
        const frameDocument = frame.contentDocument
        if (frameDocument !== null) delaySrcdocLoads(frameDocument)
        const load = new (watched.defaultView?.Event ?? Event)('load')
        delayedLoads.add(load)
        frame.dispatchEvent(load)
      })
    },
    true,
  )
}
delaySrcdocLoads(document)

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
