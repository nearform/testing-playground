import { fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import Slider from '../scenarios/Slider.scenario'

describe('Slider component', () => {
  it('can change Basic Slider value', async () => {
    TestRenderer(<Slider />)
    const sliderContainer = screen.getByTestId('basic-slider')
    const hiddenInput = sliderContainer.querySelector('input[type="range"]')
    if (hiddenInput !== null) {
      fireEvent.change(hiddenInput, { target: { value: '99' } })
      await waitFor(() => {
        expect(screen.getByText('99')).toBeInTheDocument()
      })
    } else {
      console.warn('Hidden input not found within the slider container')
    }
  })

  it('can change Range Slider value', async () => {
    TestRenderer(<Slider />)
    const sliderContainer = screen.getByTestId('range-slider')
    const hiddenInputs = sliderContainer.querySelectorAll('input[type="range"]')
    if (hiddenInputs.length === 2) {
      const [handle1, handle2] = hiddenInputs
      // Move the second one first, as the initial value of the second is 25
      fireEvent.change(handle2, { target: { value: '66' } })
      fireEvent.change(handle1, { target: { value: '33' } })
      await waitFor(() => {
        expect(screen.getByText('33')).toBeInTheDocument()
        expect(screen.getByText('66')).toBeInTheDocument()
      })
    } else {
      console.warn('Hidden input not found within the slider container')
    }
  })

  it('renders SliderWithInput component', async () => {
    TestRenderer(<Slider />)
    const slider = screen
      .getByTestId('input-slider')
      .querySelector('input[type="range"]')
    if (slider !== null) {
      fireEvent.change(slider, { target: { value: '41' } })
      await waitFor(() => {
        expect(screen.getByText('41')).toBeInTheDocument()
      })
    } else {
      console.warn('Hidden input not found within the slider container')
    }
    const sliderInput = screen
      .getByTestId('input-slider-text')
      .querySelector('input') as HTMLInputElement
    fireEvent.change(sliderInput, { target: { value: '75' } })
    await waitFor(() => {
      expect(
        screen.getByTestId('input-slider-text').querySelector('input')
      ).toHaveValue(75)
    })
  })
})
