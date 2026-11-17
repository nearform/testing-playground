import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import stylesheet from '../index.css?raw'
import Slider from '../scenarios/Slider.scenario'

const thumbsOf = (testId: string): HTMLElement[] =>
  within(screen.getByTestId(testId)).getAllByRole('slider')

const readoutIn = (containerTestId: string, text: string): HTMLElement =>
  within(screen.getByTestId(containerTestId)).getByText(text)

// index.css lifts the slider track's contrast with a rule tied to Quantum's
// Radix markup. jsdom does not apply the stylesheet, so read the rule from it
// to check it still exists, still sets grey-500 and matches the tracks. The
// pattern only matches the rule as the content of `@layer utilities`, where it
// sits beside the Quantum classes it has to outrank.
const trackRule = (): { selector: string; body: string } => {
  const rule =
    /@layer utilities\s*\{\s*\/\* slider-track-contrast \*\/\s*([^{]+)\{([^}]*)\}\s*\}/.exec(
      stylesheet,
    )
  if (rule === null) {
    throw new Error(
      'index.css has no slider-track-contrast rule in @layer utilities',
    )
  }
  return { selector: rule[1].replace(/\s+/g, ' ').trim(), body: rule[2] }
}

describe('Slider component', () => {
  it('can change Basic Slider value', async () => {
    const user = userEvent.setup()
    TestRenderer(<Slider />)
    const [thumb] = thumbsOf('basic-slider')

    thumb.focus()
    await user.keyboard('{End}')

    expect(thumb).toHaveAttribute('aria-valuenow', '100')
    expect(readoutIn('basic-slider-container', '100')).toBeVisible()

    await user.keyboard('{ArrowLeft}')

    expect(thumb).toHaveAttribute('aria-valuenow', '99')
    expect(readoutIn('basic-slider-container', '99')).toBeVisible()
  })

  it('can change Range Slider value', async () => {
    const user = userEvent.setup()
    TestRenderer(<Slider />)
    const [minThumb, maxThumb] = thumbsOf('range-slider')

    maxThumb.focus()
    await user.keyboard('{End}')
    minThumb.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')

    expect(minThumb).toHaveAttribute('aria-valuenow', '3')
    expect(maxThumb).toHaveAttribute('aria-valuenow', '100')
    expect(readoutIn('range-slider-container', '3 – 100')).toBeVisible()
  })

  it('keeps the slider and its number input in sync', async () => {
    const user = userEvent.setup()
    TestRenderer(<Slider />)
    const [thumb] = thumbsOf('input-slider')
    const input = screen.getByTestId('input-slider-text')

    thumb.focus()
    await user.keyboard('{End}')
    expect(input).toHaveValue(100)

    fireEvent.change(input, { target: { value: '75' } })
    expect(input).toHaveValue(75)
    expect(thumb).toHaveAttribute('aria-valuenow', '75')
  })

  it('clamps the number input to the slider range', () => {
    TestRenderer(<Slider />)
    const input = screen.getByTestId('input-slider-text')

    fireEvent.change(input, { target: { value: '250' } })

    expect(input).toHaveValue(100)
  })

  it('lets the track contrast rule in index.css reach every slider track', () => {
    const { selector, body } = trackRule()
    TestRenderer(<Slider />)
    const sliders = ['basic-slider', 'range-slider', 'input-slider'].map(
      (testId) => screen.getByTestId(testId),
    )

    const tracks = [...document.querySelectorAll<HTMLElement>(selector)]

    // One match per slider, each a direct child of that slider's root, and
    // nothing else on the page
    expect(tracks).toHaveLength(sliders.length)
    tracks.forEach((track, index) => {
      expect(track.parentElement).toBe(sliders[index])
    })
    for (const track of tracks) {
      // A track wraps the filled range, never the thumbs
      expect(track.querySelector('[data-orientation]')).not.toBeNull()
      expect(within(track).queryAllByRole('slider')).toHaveLength(0)
    }
    // grey-500 is what lifts the track to 3:1 on both themes' surfaces
    expect(body).toMatch(/background-color:\s*--theme\(--color-grey-500\);/)
  })
})
