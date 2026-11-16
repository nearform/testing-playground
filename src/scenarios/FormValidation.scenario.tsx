import { Alert, Box, Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import type { FormErrors, FormField, FormValues } from '../utils/formValidation'
import {
  FORM_FIELDS,
  emptyFormValues,
  validateField,
  validateForm,
} from '../utils/formValidation'

interface FieldConfig {
  name: FormField
  testId: string
  type: string
  required: boolean
}

const FIELDS: FieldConfig[] = [
  { name: 'fullName', testId: 'full-name', type: 'text', required: true },
  { name: 'email', testId: 'email', type: 'email', required: true },
  { name: 'phone', testId: 'phone', type: 'tel', required: false },
  { name: 'age', testId: 'age', type: 'text', required: true },
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
        title={t('scenarios.form-validation.title')}
        description={t('scenarios.form-validation.description')}
        information={t('scenarios.form-validation.information')}
      >
        <Box
          component='form'
          noValidate
          onSubmit={handleSubmit}
          data-testid='validation-form'
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          {submitAttempted && errorCount > 0 && (
            <Alert
              severity='error'
              data-testid='form-error-summary'
              role='alert'
            >
              {t('scenarios.form-validation.error-summary', {
                count: errorCount,
              })}
            </Alert>
          )}
          {submitted && (
            <Alert severity='success' data-testid='form-success' role='status'>
              {t('scenarios.form-validation.success', {
                name: values.fullName.trim(),
              })}
            </Alert>
          )}
          {FIELDS.map(({ name, testId, type, required }) => {
            const error = touched[name] ? errors[name] : undefined
            const hint = t(`scenarios.form-validation.hints.${testId}`)
            return (
              <TextField
                key={name}
                id={testId}
                name={name}
                label={t(`scenarios.form-validation.fields.${testId}`)}
                type={type}
                required={required}
                variant='outlined'
                margin='normal'
                fullWidth
                value={values[name]}
                error={error !== undefined}
                helperText={
                  error !== undefined
                    ? t(`scenarios.form-validation.errors.${error}`)
                    : hint
                }
                onChange={(e) => {
                  handleChange(name, e.target.value)
                }}
                onBlur={() => {
                  handleBlur(name)
                }}
                slotProps={{
                  htmlInput: { 'data-testid': testId },
                  // The helper text is an error message or a hint, each with its own test id
                  formHelperText: {
                    'data-testid':
                      error !== undefined
                        ? `${testId}-error`
                        : `${testId}-hint`,
                  } as Record<string, string>,
                }}
              />
            )
          })}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              data-testid='submit-button'
            >
              {t('scenarios.form-validation.submit-button')}
            </Button>
            <Button
              type='button'
              variant='outlined'
              color='primary'
              onClick={handleReset}
              data-testid='reset-button'
            >
              {t('scenarios.form-validation.reset-button')}
            </Button>
          </Box>
        </Box>
      </PageSetup>
    </Layout>
  )
}

export default FormValidation
