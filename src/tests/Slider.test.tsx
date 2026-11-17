import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import Slider from '../scenarios/Slider.scenario'

const thumbsOf = (testId: string): HTMLElement[] =>
  within(screen.getByTestId(testId)).getAllByRole('slider')

describe('Slider component', () => {
  it('can change Basic Slider value', async () => {
    const user = userEvent.setup()
    TestRenderer(<Slider />)
    const [thumb] = thumbsOf('basic-slider')

    thumb.focus()
    await user.keyboard('{End}')

    expect(thumb).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByTestId('basic-slider-value')).toHaveTextContent('100')

    await user.keyboard('{ArrowLeft}')

    expect(screen.getByTestId('basic-slider-value')).toHaveTextContent('99')
  })

  it('can change Range Slider value', async () => {
    const user = userEvent.setup()
    TestRenderer(<Slider />)
    const [minThumb, maxThumb] = thumbsOf('range-slider')

    maxThumb.focus()
    await user.keyboard('{End}')
    minThumb.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')

    expect(screen.getByTestId('range-slider-min')).toHaveTextContent('3')
    expect(screen.getByTestId('range-slider-max')).toHaveTextContent('100')
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
})
