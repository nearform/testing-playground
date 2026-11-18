export interface FormValues {
  fullName: string
  email: string
  phone: string
  age: string
  website: string
  password: string
  confirmPassword: string
}

export type FormField = keyof FormValues

// Each error is an i18n key suffix under `scenarios.form-validation.errors`
export type FormErrors = Partial<Record<FormField, string>>

export const FORM_FIELDS: FormField[] = [
  'fullName',
  'email',
  'phone',
  'age',
  'website',
  'password',
  'confirmPassword',
]

export const emptyFormValues: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  age: '',
  website: '',
  password: '',
  confirmPassword: '',
}

export const MIN_AGE = 18
export const MAX_AGE = 120
export const MIN_PASSWORD_LENGTH = 8

// Letters may carry combining marks (\p{M}) so decomposed accents are accepted
const NAME_PATTERN = /^(?:\p{L}\p{M}*)+(?:[ '-](?:\p{L}\p{M}*)+)*$/u
// Top-level domain: at least two letters (e.g. `.io`), or the punycode form
// `new URL` gives internationalised TLDs (e.g. `.рф` becomes `xn--p1ai`)
const TLD_PATTERN = /^(?:\p{L}{2,}|xn--[a-z0-9-]+)$/u
// `new URL` has already rejected out-of-range octets by the time this runs
const IPV4_PATTERN = /^\d{1,3}(?:\.\d{1,3}){3}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\+?[0-9 ]+$/
const INTEGER_PATTERN = /^-?\d+$/

const MIN_PHONE_DIGITS = 10
const MAX_PHONE_DIGITS = 15

// Passed to the phone hint and error texts, so they always state the limits
// the rule applies
export const PHONE_DIGIT_LIMITS = {
  minDigits: MIN_PHONE_DIGITS,
  maxDigits: MAX_PHONE_DIGITS,
}

// Shared with the multi-step form, so both scenarios accept the same input.
// Both take a trimmed, non-empty value.
export const isValidEmail = (value: string): boolean =>
  EMAIL_PATTERN.test(value)

export const phoneNumberError = (
  value: string,
): 'phone-invalid' | 'phone-length' | undefined => {
  if (!PHONE_PATTERN.test(value)) return 'phone-invalid'
  const digits = value.replace(/\D/g, '').length
  if (digits < MIN_PHONE_DIGITS || digits > MAX_PHONE_DIGITS)
    return 'phone-length'
  return undefined
}

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (IPV4_PATTERN.test(url.hostname)) return true
    // Require a dotted hostname with no empty labels (rejects `example.`,
    // `.com`, `a..com`) that ends in an alphabetic top-level domain
    const labels = url.hostname.split('.')
    return (
      labels.length >= 2 &&
      labels.every((label) => label !== '') &&
      TLD_PATTERN.test(labels[labels.length - 1])
    )
  } catch {
    return false
  }
}

export const validateField = (
  field: FormField,
  values: FormValues,
): string | undefined => {
  const value = values[field].trim()

  switch (field) {
    case 'fullName': {
      // NFC-normalise so `e` + combining accent counts as a single `é`
      const name = value.normalize('NFC')
      if (name === '') return 'full-name-required'
      if (name.length < 2) return 'full-name-too-short'
      if (!NAME_PATTERN.test(name)) return 'full-name-invalid'
      return undefined
    }

    case 'email':
      if (value === '') return 'email-required'
      if (!isValidEmail(value)) return 'email-invalid'
      return undefined

    case 'phone': {
      // Optional field: only validate when something has been entered
      if (value === '') return undefined
      return phoneNumberError(value)
    }

    case 'age': {
      if (value === '') return 'age-required'
      if (!INTEGER_PATTERN.test(value)) return 'age-not-number'
      const age = Number(value)
      if (age < MIN_AGE || age > MAX_AGE) return 'age-range'
      return undefined
    }

    case 'website':
      // Optional field: only validate when something has been entered
      if (value === '') return undefined
      if (!isValidUrl(value)) return 'website-invalid'
      return undefined

    case 'password': {
      // Passwords are not trimmed; whitespace is significant
      const password = values.password
      if (password === '') return 'password-required'
      if (password.length < MIN_PASSWORD_LENGTH) return 'password-too-short'
      if (!/[A-Z]/.test(password)) return 'password-uppercase'
      if (!/[a-z]/.test(password)) return 'password-lowercase'
      if (!/[0-9]/.test(password)) return 'password-number'
      return undefined
    }

    case 'confirmPassword':
      if (values.confirmPassword === '') return 'confirm-password-required'
      if (values.confirmPassword !== values.password)
        return 'confirm-password-mismatch'
      return undefined
  }
}

export const validateForm = (values: FormValues): FormErrors => {
  const errors: FormErrors = {}
  for (const field of FORM_FIELDS) {
    const error = validateField(field, values)
    if (error !== undefined) errors[field] = error
  }
  return errors
}
