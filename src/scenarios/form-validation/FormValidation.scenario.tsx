import {
  Button,
  FieldDescription,
  FieldError,
  FormGroup,
  Input,
  Label,
} from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import type {
  FormErrors,
  FormField,
  FormValues,
} from '../../utils/formValidation'
import {
  FORM_FIELDS,
  PHONE_DIGIT_LIMITS,
  emptyFormValues,
  validateField,
  validateForm,
} from '../../utils/formValidation'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

interface FieldConfig {
  name: FormField
  testId: string
  type: string
  required: boolean
  // Hints which on-screen keyboard mobile browsers should show
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}

const FIELDS: FieldConfig[] = [
  { name: 'fullName', testId: 'full-name', type: 'text', required: true },
  { name: 'email', testId: 'email', type: 'email', required: true },
  { name: 'phone', testId: 'phone', type: 'tel', required: false },
  {
    name: 'age',
    testId: 'age',
    type: 'text',
    required: true,
    inputMode: 'numeric',
  },
  { name: 'website', testId: 'website', type: 'url', required: false },
  { name: 'password', testId: 'password', type: 'password', required: true },
  {
    name: 'confirmPassword',
    testId: 'confirm-password',
    type: 'password',
    required: true,
  },
]

const noneTouched = (): Record<FormField, boolean> =>
  Object.fromEntries(FORM_FIELDS.map((field) => [field, false])) as Record<
    FormField,
    boolean
  >

const FormValidation = (): JSX.Element => {
  const { t } = useTranslation()

  const [values, setValues] = useState<FormValues>(emptyFormValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState(noneTouched)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const updateError = (
    field: FormField,
    nextValues: FormValues,
    current: FormErrors,
  ): FormErrors => {
    const next = { ...current }
    const error = validateField(field, nextValues)
    if (error === undefined) {
      delete next[field]
    } else {
      next[field] = error
    }
    return next
  }

  const handleChange = (field: FormField, value: string): void => {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    setSubmitted(false)

    // Once a field has been visited, re-validate it as the user types
    let nextErrors = errors
    if (touched[field]) {
      nextErrors = updateError(field, nextValues, nextErrors)
    }
    // Changing the password can fix or break the confirmation match
    if (field === 'password' && touched.confirmPassword) {
      nextErrors = updateError('confirmPassword', nextValues, nextErrors)
    }
    setErrors(nextErrors)
  }

  const handleBlur = (field: FormField): void => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => updateError(field, values, prev))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const nextErrors = validateForm(values)
    setErrors(nextErrors)
    setTouched(
      Object.fromEntries(FORM_FIELDS.map((field) => [field, true])) as Record<
        FormField,
        boolean
      >,
    )
    setSubmitAttempted(true)
    setSubmitted(Object.keys(nextErrors).length === 0)
  }

  const handleReset = (): void => {
    setValues(emptyFormValues)
    setErrors({})
    setTouched(noneTouched())
    setSubmitAttempted(false)
    setSubmitted(false)
  }

  const errorCount = Object.keys(errors).length

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <form
          noValidate
          onSubmit={handleSubmit}
          data-testid='validation-form'
          className='mx-auto flex max-w-xl flex-col gap-4'
        >
          {submitAttempted && errorCount > 0 && (
            <Alert
              severity='error'
              data-testid='form-error-summary'
              role='alert'
            >
              {t(`scenarios.${SLUG}.error-summary`, {
                count: errorCount,
              })}
            </Alert>
          )}
          {submitted && (
            <Alert severity='success' data-testid='form-success' role='status'>
              {t(`scenarios.${SLUG}.success`, {
                name: values.fullName.trim(),
              })}
            </Alert>
          )}
          {FIELDS.map(({ name, testId, type, required, inputMode }) => {
            const error = touched[name] ? errors[name] : undefined
            const errorText =
              error !== undefined
                ? t(`scenarios.${SLUG}.errors.${error}`, PHONE_DIGIT_LIMITS)
                : undefined
            return (
              <FormGroup
                key={name}
                required={required}
                description={t(
                  `scenarios.${SLUG}.hints.${testId}`,
                  PHONE_DIGIT_LIMITS,
                )}
                error={errorText}
              >
                <Label>
                  {t(`scenarios.${SLUG}.fields.${testId}`)}
                  {required && ' *'}
                </Label>
                <Input
                  id={testId}
                  name={name}
                  type={type}
                  variant={error !== undefined ? 'error' : 'primary'}
                  inputMode={inputMode}
                  value={values[name]}
                  onChange={(e) => {
                    handleChange(name, e.currentTarget.value)
                  }}
                  onBlur={() => {
                    handleBlur(name)
                  }}
                  onClear={() => {
                    handleChange(name, '')
                  }}
                  clearable='auto'
                  data-testid={testId}
                />
                {/* Only one of the two renders: the error replaces the hint */}
                <FieldDescription data-testid={`${testId}-hint`} />
                <FieldError data-testid={`${testId}-error`} />
              </FormGroup>
            )
          })}
          <div className='mt-2 flex gap-4'>
            <Button type='submit' variant='primary' data-testid='submit-button'>
              {t(`scenarios.${SLUG}.submit-button`)}
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={handleReset}
              data-testid='reset-button'
            >
              {t(`scenarios.${SLUG}.reset-button`)}
            </Button>
          </div>
        </form>
      </PageSetup>
    </Layout>
  )
}

export default FormValidation
