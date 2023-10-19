import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './customRender'
import VariousInputs from '../scenarios/VariousInputs'

describe('VariousInputs component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders without crashing', () => {
    TestRenderer(<VariousInputs />)
  })

  it('updates text input value', () => {
    TestRenderer(<VariousInputs />)

    const textInput = screen.getByTestId('text-input')
    fireEvent.change(textInput, { target: { value: 'Hello, World!' } })

    expect(textInput).toHaveValue('Hello, World!')
  })

  it('updates password input value', () => {
    TestRenderer(<VariousInputs />)

    const passwordInput = screen.getByTestId('password-input')
    fireEvent.change(passwordInput, { target: { value: 'Secret123' } })

    expect(passwordInput).toHaveValue('Secret123')
  })

  it('updates number input value', () => {
    TestRenderer(<VariousInputs />)

    const numberInput = screen.getByTestId('number-input')
    fireEvent.change(numberInput, { target: { value: '42' } })

    expect(numberInput).toHaveValue(42)
  })

  it('updates date input value', () => {
    TestRenderer(<VariousInputs />)

    const dateInput = screen.getByTestId('date-input')
    fireEvent.change(dateInput, { target: { value: '2023-01-01' } })

    expect(dateInput).toHaveValue('2023-01-01')
  })

  it('updates textarea input value', () => {
    TestRenderer(<VariousInputs />)

    const textareaInput = screen.getByTestId('textarea-input')
    fireEvent.change(textareaInput, { target: { value: 'Multiline text' } })

    expect(textareaInput).toHaveValue('Multiline text')
  })

  it('clears all input values', () => {
    TestRenderer(<VariousInputs />)

    const textInput = screen.getByTestId('text-input')
    const passwordInput = screen.getByTestId('password-input')
    const numberInput = screen.getByTestId('number-input')
    const dateInput = screen.getByTestId('date-input')
    const textareaInput = screen.getByTestId('textarea-input')

    fireEvent.change(textInput, { target: { value: 'Hello, World!' } })
    fireEvent.change(passwordInput, { target: { value: 'Secret123' } })
    fireEvent.change(numberInput, { target: { value: '42' } })
    fireEvent.change(dateInput, { target: { value: '2023-01-01' } })
    fireEvent.change(textareaInput, { target: { value: 'Multiline text' } })

    expect(textInput).toHaveValue('Hello, World!')
    expect(passwordInput).toHaveValue('Secret123')
    expect(numberInput).toHaveValue(42)
    expect(dateInput).toHaveValue('2023-01-01')
    expect(textareaInput).toHaveValue('Multiline text')

    const clearAllButton = screen.getByText('Clear All')
    fireEvent.click(clearAllButton)

    expect(textInput).toHaveValue('')
    expect(passwordInput).toHaveValue('')
    expect(numberInput).toHaveValue(null)
    expect(dateInput).toHaveValue('')
    expect(textareaInput).toHaveValue('')
  })
})
