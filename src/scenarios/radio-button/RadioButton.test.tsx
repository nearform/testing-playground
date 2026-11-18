import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import RadioButton from './RadioButton.scenario'

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
    const secondRadioSecondButton = screen.getByRole('radio', {
      name: 'Orange',
    })

    fireEvent.click(secondRadioFirstButton)
    expect(secondRadioFirstButton).toBeChecked()
    expect(secondRadioSecondButton).not.toBeChecked()

    fireEvent.click(secondRadioSecondButton)
    expect(secondRadioFirstButton).not.toBeChecked()
    expect(secondRadioSecondButton).toBeChecked()
  })

  it('clears the secondary colour when the primary colour changes', () => {
    TestRenderer(<RadioButton />)
    fireEvent.click(screen.getByRole('radio', { name: 'Red' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Purple' }))

    fireEvent.click(screen.getByRole('radio', { name: 'Blue' }))

    expect(screen.getByRole('radio', { name: 'Purple' })).not.toBeChecked()
  })

  it('does not pick a secondary colour again when its primary colour is picked again', () => {
    TestRenderer(<RadioButton />)
    fireEvent.click(screen.getByRole('radio', { name: 'Red' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Purple' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Yellow' }))

    fireEvent.click(screen.getByRole('radio', { name: 'Red' }))

    expect(screen.getByRole('radio', { name: 'Purple' })).not.toBeChecked()
  })

  it('disables the last radio button in the first group', () => {
    TestRenderer(<RadioButton />)
    const fourthRadioButton = screen.getByRole('radio', { name: 'White' })
    expect(fourthRadioButton).toBeDisabled()
  })
})

describe('RadioButton when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  it('keeps the chosen colours picked, with their names in the new language', async () => {
    TestRenderer(<RadioButton />)
    fireEvent.click(screen.getByRole('radio', { name: 'Red' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Orange' }))

    await switchLanguage('fr')

    expect(screen.getByRole('radio', { name: 'Rouge' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Orange' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Violet' })).not.toBeChecked()
    expect(screen.getByTestId('radio-button-group-2')).toBeInTheDocument()
  })
})
