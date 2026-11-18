import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import Slider from './Slider.scenario'

const thumbsOf = (testId: string): HTMLElement[] =>
  within(screen.getByTestId(testId)).getAllByRole('slider')

const readoutIn = (containerTestId: string, text: string): HTMLElement =>
  within(screen.getByTestId(containerTestId)).getByText(text)

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

  it('lets the number input be cleared and a new value typed in', async () => {
    const user = userEvent.setup()
    TestRenderer(<Slider />)
    const [thumb] = thumbsOf('input-slider')
    const input = screen.getByTestId('input-slider-text')

    await user.clear(input)
    await user.type(input, '50')

    expect(input).toHaveValue(50)
    expect(thumb).toHaveAttribute('aria-valuenow', '50')
  })

  it("puts the slider's value back when the number input is left empty", async () => {
    const user = userEvent.setup()
    TestRenderer(<Slider />)
    const input = screen.getByTestId('input-slider-text')
    fireEvent.change(input, { target: { value: '40' } })

    await user.clear(input)
    await user.tab()

    expect(input).toHaveValue(40)
  })
})
