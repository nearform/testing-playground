import { render, screen, waitFor } from '@testing-library/react'
import type { CSSProperties } from 'react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import FrameHost from './FrameHost'

const frameRoot = (
  testId: string,
  inside: Document = document,
): HTMLElement => {
  const frame = inside.querySelector<HTMLIFrameElement>(
    `[data-testid="${testId}"]`,
  )
  const root = frame?.contentDocument?.documentElement
  if (root === undefined) throw new Error(`${testId} has not loaded yet`)
  return root
}

const accent = (root: HTMLElement): string =>
  root.style.getPropertyValue('--frame-accent')

describe('FrameHost', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('copies the theme from around the frame into it', async () => {
    render(
      <div style={{ '--frame-accent': 'red' } as CSSProperties}>
        <FrameHost name='outer' title='Outer'>
          <p>Inside</p>
        </FrameHost>
      </div>,
    )

    await waitFor(() => {
      expect(accent(frameRoot('outer'))).toBe('red')
    })
  })

  it('copies the theme again when the theme is toggled', async () => {
    render(
      <div
        data-testid='themed'
        style={{ '--frame-accent': 'red' } as CSSProperties}
      >
        <FrameHost name='outer' title='Outer'>
          <p>Inside</p>
        </FrameHost>
      </div>,
    )
    await waitFor(() => {
      expect(accent(frameRoot('outer'))).toBe('red')
    })

    screen.getByTestId('themed').style.setProperty('--frame-accent', 'blue')
    document.documentElement.classList.add('dark')

    await waitFor(() => {
      expect(accent(frameRoot('outer'))).toBe('blue')
    })
  })

  it('passes the theme on to a frame nested in another', async () => {
    render(
      <div style={{ '--frame-accent': 'red' } as CSSProperties}>
        <FrameHost name='outer' title='Outer'>
          <FrameHost name='inner' title='Inner'>
            <p>Inside</p>
          </FrameHost>
        </FrameHost>
      </div>,
    )

    await waitFor(() => {
      const outerDocument = frameRoot('outer').ownerDocument
      expect(accent(frameRoot('inner', outerDocument))).toBe('red')
    })
  })
})
