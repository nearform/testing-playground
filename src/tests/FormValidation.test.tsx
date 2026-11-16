import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import '@testing-library/jest-dom'
import { describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import FormValidation from '../scenarios/FormValidation.scenario'

const validInput: Record<string, string> = {
  'full-name': 'Ada Lovelace',
  email: 'ada@example.com',
  age: '36',
  password: 'Passw0rd',
  'confirm-password': 'Passw0rd',
}

const renderForm = (): ReturnType<typeof userEvent.setup> => {
  const user = userEvent.setup()
  TestRenderer(<FormValidation />)
  return user
}

const fillValidForm = async (
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> => {
  for (const [testId, value] of Object.entries(validInput)) {
    await user.type(screen.getByTestId(testId), value)
  }
}

describe('FormValidation scenario', () => {
  it('shows hints and no errors before the user interacts', () => {
    TestRenderer(<FormValidation />)

    expect(screen.getByTestId('email-hint')).toHaveTextContent(
      'e.g. name@example.com',
    )
    expect(screen.queryByTestId('email-error')).toBeNull()
    expect(screen.queryByTestId('form-error-summary')).toBeNull()
  })

  it('asks mobile browsers for a numeric keypad on the age field', () => {
    TestRenderer(<FormValidation />)

    expect(screen.getByTestId('age')).toHaveAttribute('inputmode', 'numeric')
  })

  it('shows a format error when leaving a field with an invalid value', async () => {
    const user = renderForm()

    await user.type(screen.getByTestId('email'), 'not-an-email')
    await user.tab()

    expect(screen.getByTestId('email-error')).toHaveTextContent(
      'Please enter a valid email address',
    )
    expect(screen.getByTestId('email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('clears the error as soon as the value becomes valid', async () => {
    const user = renderForm()
    const age = screen.getByTestId('age')

    await user.type(age, '12')
    await user.tab()
    expect(screen.getByTestId('age-error')).toHaveTextContent(
      'Age must be between 18 and 120',
    )

    await user.clear(age)
    await user.type(age, '42')

    expect(screen.queryByTestId('age-error')).toBeNull()
    expect(age).toHaveAttribute('aria-invalid', 'false')
  })

  it('lists every invalid field when an empty form is submitted', async () => {
    const user = renderForm()

    await user.click(screen.getByTestId('submit-button'))

    expect(screen.getByTestId('form-error-summary')).toHaveTextContent(
      'Please fix the 5 errors below.',
    )
    expect(screen.getByTestId('full-name-error')).toHaveTextContent(
      'Full name is required',
    )
    expect(screen.getByTestId('confirm-password-error')).toHaveTextContent(
      'Please confirm your password',
    )
    // Optional fields stay valid when left empty
    expect(screen.queryByTestId('phone-error')).toBeNull()
    expect(screen.queryByTestId('website-error')).toBeNull()
  })

  it('flags a mismatched password confirmation and re-checks it when the password changes', async () => {
    const user = renderForm()

    await user.type(screen.getByTestId('password'), 'Passw0rd')
    await user.type(screen.getByTestId('confirm-password'), 'Passw0rd1')
    await user.tab()
    expect(screen.getByTestId('confirm-password-error')).toHaveTextContent(
      'Passwords do not match',
    )

    await user.type(screen.getByTestId('password'), '1')

    expect(screen.queryByTestId('confirm-password-error')).toBeNull()
  })

  it('submits successfully once every field is valid', async () => {
    const user = renderForm()

    await fillValidForm(user)
    await user.click(screen.getByTestId('submit-button'))

    expect(screen.getByTestId('form-success')).toHaveTextContent(
      'Thanks Ada Lovelace, the form was submitted successfully!',
    )
    expect(screen.queryByTestId('form-error-summary')).toBeNull()
  })

  it('clears values and errors on reset', async () => {
    const user = renderForm()

    await user.type(screen.getByTestId('full-name'), 'A')
    await user.click(screen.getByTestId('submit-button'))
    await user.click(screen.getByTestId('reset-button'))

    expect(screen.getByTestId('full-name')).toHaveValue('')
    expect(screen.queryByTestId('full-name-error')).toBeNull()
    expect(screen.queryByTestId('form-error-summary')).toBeNull()
  })
})
