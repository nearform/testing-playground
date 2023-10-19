import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './customRender'
import RadioButton from '../scenarios/RadioButton'

describe('RadioButton component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('updates first radio button value', () => {
    TestRenderer(<RadioButton />)

    const firstRadioButton = screen.getByRole('radio', { name: 'Red' })
    const secondRadioButton = screen.getByRole('radio', { name: 'Blue' })
    const thirdRadioButton = screen.getByRole('radio', { name: 'Yellow' })
    const fourthRadioButton = screen.getByRole('radio', { name: 'White' })

    fireEvent.click(thirdRadioButton)
    expect(firstRadioButton).not.toBeChecked()
    expect(secondRadioButton).not.toBeChecked()
    expect(thirdRadioButton).toBeChecked()
    expect(fourthRadioButton).not.toBeChecked()

    fireEvent.click(firstRadioButton)
    expect(firstRadioButton).toBeChecked()
    expect(secondRadioButton).not.toBeChecked()
    expect(thirdRadioButton).not.toBeChecked()
    expect(fourthRadioButton).not.toBeChecked()

    const secondRadioFirstButton = screen.getByRole('radio', { name: 'Purple' })
    const secondRadioSecondButton = screen.getByRole('radio', { name: 'Orange' })

    fireEvent.click(secondRadioFirstButton)
    expect(secondRadioFirstButton).toBeChecked()
    expect(secondRadioSecondButton).not.toBeChecked()

    fireEvent.click(secondRadioSecondButton)
    expect(secondRadioFirstButton).not.toBeChecked()
    expect(secondRadioSecondButton).toBeChecked()
  })

  it('disables the last radio button in the first group', () => {
    TestRenderer(<RadioButton />)
    const fourthRadioButton = screen.getByTestId('radio-button-group-1-4')
    expect(fourthRadioButton).toHaveAttribute('aria-disabled', 'true')
  })
})
