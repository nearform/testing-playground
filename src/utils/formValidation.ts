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

const NAME_PATTERN = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\+?[0-9 ]+$/
const INTEGER_PATTERN = /^-?\d+$/

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.includes('.')
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
    case 'fullName':
      if (value === '') return 'full-name-required'
      if (value.length < 2) return 'full-name-too-short'
      if (!NAME_PATTERN.test(value)) return 'full-name-invalid'
      return undefined

    case 'email':
      if (value === '') return 'email-required'
      if (!EMAIL_PATTERN.test(value)) return 'email-invalid'
      return undefined

    case 'phone': {
      // Optional field: only validate when something has been entered
      if (value === '') return undefined
      if (!PHONE_PATTERN.test(value)) return 'phone-invalid'
      const digits = value.replace(/\D/g, '').length
      if (digits < 10 || digits > 15) return 'phone-length'
      return undefined
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
