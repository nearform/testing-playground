import { describe, expect, it } from 'vitest'

import type { FormValues } from '../utils/formValidation'
import {
  emptyFormValues,
  validateField,
  validateForm,
} from '../utils/formValidation'

const validValues: FormValues = {
  fullName: "Ada O'Brien-Lovelace",
  email: 'ada@example.com',
  phone: '+44 7700 900123',
  age: '36',
  website: 'https://example.com',
  password: 'Passw0rd',
  confirmPassword: 'Passw0rd',
}

const withValue = (overrides: Partial<FormValues>): FormValues => ({
  ...validValues,
  ...overrides,
})

describe('validateForm', () => {
  it('returns no errors for a fully valid form', () => {
    expect(validateForm(validValues)).toEqual({})
  })

  it('reports only the required fields for an empty form', () => {
    expect(validateForm(emptyFormValues)).toEqual({
      fullName: 'full-name-required',
      email: 'email-required',
      age: 'age-required',
      password: 'password-required',
      confirmPassword: 'confirm-password-required',
    })
  })
})

describe('validateField', () => {
  it.each([
    { fullName: '   ', expected: 'full-name-required' },
    { fullName: 'A', expected: 'full-name-too-short' },
    { fullName: 'Ada 99', expected: 'full-name-invalid' },
    { fullName: 'Ada--Lovelace', expected: 'full-name-invalid' },
    { fullName: 'José Álvarez', expected: undefined },
  ])('validates full name "$fullName"', ({ fullName, expected }) => {
    expect(validateField('fullName', withValue({ fullName }))).toBe(expected)
  })

  it.each([
    { email: '', expected: 'email-required' },
    { email: 'ada', expected: 'email-invalid' },
    { email: 'ada@example', expected: 'email-invalid' },
    { email: 'ada @example.com', expected: 'email-invalid' },
    { email: ' ada@example.com ', expected: undefined },
  ])('validates email "$email"', ({ email, expected }) => {
    expect(validateField('email', withValue({ email }))).toBe(expected)
  })

  it.each([
    { phone: '', expected: undefined },
    { phone: '07700-900123', expected: 'phone-invalid' },
    { phone: '123456789', expected: 'phone-length' }, // 9 digits
    { phone: '1234567890', expected: undefined }, // 10 digits
    { phone: '123456789012345', expected: undefined }, // 15 digits
    { phone: '1234567890123456', expected: 'phone-length' }, // 16 digits
  ])('validates phone "$phone"', ({ phone, expected }) => {
    expect(validateField('phone', withValue({ phone }))).toBe(expected)
  })

  it.each([
    { age: '', expected: 'age-required' },
    { age: 'abc', expected: 'age-not-number' },
    { age: '20.5', expected: 'age-not-number' },
    { age: '17', expected: 'age-range' },
    { age: '18', expected: undefined },
    { age: '120', expected: undefined },
    { age: '121', expected: 'age-range' },
  ])('validates age "$age"', ({ age, expected }) => {
    expect(validateField('age', withValue({ age }))).toBe(expected)
  })

  it.each([
    { website: '', expected: undefined },
    { website: 'example.com', expected: 'website-invalid' },
    { website: 'ftp://example.com', expected: 'website-invalid' },
    { website: 'http://localhost', expected: 'website-invalid' },
    { website: 'http://example.com/path?q=1', expected: undefined },
  ])('validates website "$website"', ({ website, expected }) => {
    expect(validateField('website', withValue({ website }))).toBe(expected)
  })

  it.each([
    { password: '', expected: 'password-required' },
    { password: 'Pass0rd', expected: 'password-too-short' },
    { password: 'passw0rd', expected: 'password-uppercase' },
    { password: 'PASSW0RD', expected: 'password-lowercase' },
    { password: 'Password', expected: 'password-number' },
  ])('validates password "$password"', ({ password, expected }) => {
    expect(
      validateField(
        'password',
        withValue({ password, confirmPassword: password }),
      ),
    ).toBe(expected)
  })

  it.each([
    { confirmPassword: '', expected: 'confirm-password-required' },
    { confirmPassword: 'Passw0rd!', expected: 'confirm-password-mismatch' },
    { confirmPassword: 'Passw0rd', expected: undefined },
  ])(
    'validates confirm password "$confirmPassword"',
    ({ confirmPassword, expected }) => {
      expect(
        validateField('confirmPassword', withValue({ confirmPassword })),
      ).toBe(expected)
    },
  )
})
