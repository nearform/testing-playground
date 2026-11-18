import {
  Button,
  Checkbox,
  ControlLabel,
  FieldError,
  FormGroup,
  Input,
  Label,
  Radio,
  RadioGroup,
} from '@nearform/quantum'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import Alert from '../components/Alert'
import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { PHONE_DIGIT_LIMITS } from '../utils/formValidation'
import { translateInformation } from '../utils/information'
import type {
  StepId,
  WizardData,
  WizardField,
  WizardProgress,
} from '../utils/multiStepForm'
import {
  ACCOUNT_TYPES,
  COMPANY_SIZES,
  CONTACT_METHODS,
  COUNTRIES,
  OPTIONAL_STEPS,
  STEP_FIELDS,
  STORAGE_KEY,
  emptyProgress,
  emptyWizardData,
  getSteps,
  isStepDone,
  nextStep,
  parseSaved,
  previousStep,
  resolveStep,
  validateStep,
} from '../utils/multiStepForm'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'multi-step-form'

const STEP_PARAM = 'step'
const FROM_PARAM = 'from'

// Each field's key in the translations, which is also its id and test id.
// The radio groups are an exception: their radios carry the ids.
const FIELD_KEYS: Record<WizardField, string> = {
  fullName: 'full-name',
  email: 'email',
  accountType: 'account-type',
  companyName: 'company-name',
  companySize: 'company-size',
  street: 'street',
  city: 'city',
  postcode: 'postcode',
  country: 'country',
  contactMethod: 'contact-method',
  phone: 'phone',
  newsletter: 'newsletter',
}

// The element to focus for an invalid field: the first radio of a group
const focusId = (field: WizardField): string =>
  field === 'accountType' ? 'account-type-personal' : FIELD_KEYS[field]

// Quantum only styles its own (custom) select, so the native ones borrow the
// same look as its inputs
const nativeSelectClasses = [
  'w-full rounded-lg border-2 border-border bg-grey-100 px-3 py-2 text-sm text-foreground',
  'hover:border-border-hover focus:outline-hidden focus-visible:shadow-brandGreen',
  'aria-invalid:border-red-500',
  'dark:border-border-dark dark:bg-background-alt-dark dark:text-foreground-muted-dark',
  'dark:hover:border-border-hover-dark dark:focus-visible:shadow-brandGreen10',
].join(' ')

const key = (path: string): string => `scenarios.${SLUG}.${path}`

const loadSaved = (): ReturnType<typeof parseSaved> => {
  try {
    return parseSaved(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return parseSaved(null)
  }
}

interface TextFieldProps {
  field: WizardField
  type?: string
  autoComplete?: string
  value: string
  error?: string
  onChange: (value: string) => void
}

const TextField = ({
  field,
  type = 'text',
  autoComplete,
  value,
  error,
  onChange,
}: TextFieldProps): JSX.Element => {
  const { t } = useTranslation()
  const id = FIELD_KEYS[field]
  return (
    <FormGroup
      required
      error={
        error !== undefined
          ? t(key(`errors.${error}`), PHONE_DIGIT_LIMITS)
          : undefined
      }
    >
      <Label>{t(key(`fields.${id}`))} *</Label>
      <Input
        id={id}
        name={field}
        type={type}
        autoComplete={autoComplete}
        variant={error !== undefined ? 'error' : 'primary'}
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value)
        }}
        onClear={() => {
          onChange('')
        }}
        clearable='auto'
        data-testid={id}
      />
      <FieldError data-testid={`${id}-error`} />
    </FormGroup>
  )
}

interface SelectFieldProps {
  field: WizardField
  options: readonly string[]
  optionLabel: (option: string) => string
  value: string
  error?: string
  onChange: (value: string) => void
}

const SelectField = ({
  field,
  options,
  optionLabel,
  value,
  error,
  onChange,
}: SelectFieldProps): JSX.Element => {
  const { t } = useTranslation()
  const id = FIELD_KEYS[field]
  return (
    <FormGroup
      required
      error={
        error !== undefined
          ? t(key(`errors.${error}`), PHONE_DIGIT_LIMITS)
          : undefined
      }
    >
      <Label>{t(key(`fields.${id}`))} *</Label>
      <select
        id={id}
        name={field}
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value)
        }}
        className={nativeSelectClasses}
        data-testid={id}
      >
        <option value=''>{t(key('choose'))}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
      <FieldError data-testid={`${id}-error`} />
    </FormGroup>
  )
}

const MultiStepForm = (): JSX.Element => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [saved] = useState(loadSaved)
  const [data, setData] = useState<WizardData>(saved.data)
  const [progress, setProgress] = useState<WizardProgress>(saved.progress)
  // The step whose Next was clicked while it had errors. Its errors are then
  // shown, and re-checked as the user fixes them, until they leave the step.
  const [attemptedStep, setAttemptedStep] = useState<StepId | null>(null)
  const [submittedName, setSubmittedName] = useState<string | null>(null)

  const requested = searchParams.get(STEP_PARAM)
  const step = resolveStep(requested, data, progress)
  const steps = getSteps(data)
  const returnToReview =
    searchParams.get(FROM_PARAM) === 'review' && step !== 'review'
  const errors = attemptedStep === step ? validateStep(step, data) : {}
  const errorCount = Object.keys(errors).length

  // Keep answers across reloads, until the form is submitted
  useEffect(() => {
    if (submittedName !== null) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, progress }))
    } catch {
      // Storage can be unavailable (private mode, quota); the form still works
    }
  }, [data, progress, submittedName])

  // Correct the URL when it asks for a step that cannot be shown yet, or for
  // no step at all, so the address bar always names the step on screen. A
  // return to review is dropped here: a link that asks for one before the
  // earlier steps are done has no review to return to.
  useEffect(() => {
    if (submittedName === null && requested !== step) {
      setSearchParams({ [STEP_PARAM]: step }, { replace: true })
    }
  }, [requested, step, submittedName, setSearchParams])

  // Move focus to the new step's heading, so keyboard and screen reader users
  // start at the top of it. Not on first load, where focus is left alone.
  const headingRef = useRef<HTMLHeadingElement>(null)
  const shownStep = useRef(step)
  useEffect(() => {
    if (shownStep.current !== step) {
      shownStep.current = step
      headingRef.current?.focus()
    }
  }, [step])

  const update = <F extends WizardField>(field: F, value: WizardData[F]) => {
    setData((current) => ({ ...current, [field]: value }))
  }

  const goTo = (target: StepId, from?: 'review'): void => {
    setAttemptedStep(null)
    setSearchParams(
      from
        ? { [STEP_PARAM]: target, [FROM_PARAM]: from }
        : { [STEP_PARAM]: target },
    )
  }

  // Records the step as completed or skipped, then moves on. After an edit
  // from review it goes back to review, unless the edit added a step that
  // still needs filling in (such as Company after switching to a business
  // account): then it goes there, still on the way back to review.
  const finishStep = (completed: boolean): void => {
    const updated: WizardProgress = {
      completed: completed
        ? [...progress.completed.filter((s) => s !== step), step]
        : progress.completed.filter((s) => s !== step),
      skipped: completed
        ? progress.skipped.filter((s) => s !== step)
        : [...progress.skipped.filter((s) => s !== step), step],
    }
    setProgress(updated)
    if (!returnToReview) {
      goTo(nextStep(step, data))
      return
    }
    const target = resolveStep('review', data, updated)
    goTo(target, target === 'review' ? undefined : 'review')
  }

  const handleNext = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const stepErrors = validateStep(step, data)
    const firstInvalid = STEP_FIELDS[step].find(
      (field) => stepErrors[field] !== undefined,
    )
    if (firstInvalid !== undefined) {
      setAttemptedStep(step)
      document.getElementById(focusId(firstInvalid))?.focus()
      return
    }
    finishStep(true)
  }

  const handleSkip = (): void => {
    finishStep(false)
  }

  const handleStartOver = (): void => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing saved to remove
    }
    setData(emptyWizardData)
    setProgress(emptyProgress)
    setSubmittedName(null)
    goTo('personal')
  }

  const handleSubmit = (): void => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing saved to remove
    }
    setSubmittedName(data.fullName.trim())
    setData(emptyWizardData)
    setProgress(emptyProgress)
    setAttemptedStep(null)
    setSearchParams({}, { replace: true })
  }

  const errorFor = (field: WizardField): string | undefined => errors[field]
  const errorText = (field: WizardField): string | undefined => {
    const error = errorFor(field)
    return error !== undefined
      ? t(key(`errors.${error}`), PHONE_DIGIT_LIMITS)
      : undefined
  }

  const stepStatus = (s: StepId): 'current' | 'done' | 'skipped' | 'todo' => {
    if (s === step) return 'current'
    if (progress.skipped.includes(s)) return 'skipped'
    if (isStepDone(s, data, progress)) return 'done'
    return 'todo'
  }

  const renderFields = (): React.ReactNode => {
    switch (step) {
      case 'personal':
        return (
          <>
            <TextField
              field='fullName'
              autoComplete='name'
              value={data.fullName}
              error={errorFor('fullName')}
              onChange={(value) => {
                update('fullName', value)
              }}
            />
            <TextField
              field='email'
              type='email'
              autoComplete='email'
              value={data.email}
              error={errorFor('email')}
              onChange={(value) => {
                update('email', value)
              }}
            />
            <RadioGroup
              legend={`${t(key('fields.account-type'))} *`}
              description={t(key('hints.account-type'))}
              error={errorText('accountType')}
              value={data.accountType}
              onValueChange={(value) => {
                update('accountType', value as WizardData['accountType'])
              }}
              name='accountType'
              data-testid='account-type'
            >
              {ACCOUNT_TYPES.map((type) => (
                <Radio
                  key={type}
                  id={`account-type-${type}`}
                  value={type}
                  label={t(key(`account-types.${type}`))}
                  data-testid={`account-type-${type}`}
                />
              ))}
            </RadioGroup>
          </>
        )
      case 'company':
        return (
          <>
            <TextField
              field='companyName'
              autoComplete='organization'
              value={data.companyName}
              error={errorFor('companyName')}
              onChange={(value) => {
                update('companyName', value)
              }}
            />
            <SelectField
              field='companySize'
              options={COMPANY_SIZES}
              optionLabel={(size) => t(key('company-size-option'), { size })}
              value={data.companySize}
              error={errorFor('companySize')}
              onChange={(value) => {
                update('companySize', value as WizardData['companySize'])
              }}
            />
          </>
        )
      case 'address':
        return (
          <>
            <TextField
              field='street'
              autoComplete='street-address'
              value={data.street}
              error={errorFor('street')}
              onChange={(value) => {
                update('street', value)
              }}
            />
            <TextField
              field='city'
              autoComplete='address-level2'
              value={data.city}
              error={errorFor('city')}
              onChange={(value) => {
                update('city', value)
              }}
            />
            <TextField
              field='postcode'
              autoComplete='postal-code'
              value={data.postcode}
              error={errorFor('postcode')}
              onChange={(value) => {
                update('postcode', value)
              }}
            />
            <SelectField
              field='country'
              options={COUNTRIES}
              optionLabel={(country) => t(key(`countries.${country}`))}
              value={data.country}
              error={errorFor('country')}
              onChange={(value) => {
                update('country', value as WizardData['country'])
              }}
            />
          </>
        )
      case 'preferences':
        return (
          <>
            <RadioGroup
              legend={t(key('fields.contact-method'))}
              value={data.contactMethod}
              onValueChange={(value) => {
                update('contactMethod', value as WizardData['contactMethod'])
              }}
              name='contactMethod'
              data-testid='contact-method'
            >
              {CONTACT_METHODS.map((method) => (
                <Radio
                  key={method}
                  id={`contact-method-${method}`}
                  value={method}
                  label={t(key(`contact-methods.${method}`))}
                  data-testid={`contact-method-${method}`}
                />
              ))}
            </RadioGroup>
            {/* Only asked for when phone is the chosen contact method */}
            {data.contactMethod === 'phone' && (
              <TextField
                field='phone'
                type='tel'
                autoComplete='tel'
                value={data.phone}
                error={errorFor('phone')}
                onChange={(value) => {
                  update('phone', value)
                }}
              />
            )}
            <ControlLabel label={t(key('fields.newsletter'))}>
              <Checkbox
                id='newsletter'
                checked={data.newsletter}
                onCheckedChange={(checked) => {
                  update('newsletter', checked === true)
                }}
                data-testid='newsletter'
              />
            </ControlLabel>
          </>
        )
      case 'review':
        return <Review data={data} progress={progress} steps={steps} />
    }
  }

  const stepNumber = steps.indexOf(step) + 1
  const isOptional = OPTIONAL_STEPS.includes(step)

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
      >
        <div className='mx-auto flex w-full max-w-xl flex-col gap-6'>
          {submittedName !== null ? (
            <div className='flex flex-col items-start gap-4'>
              <Alert
                severity='success'
                role='status'
                data-testid='form-success'
              >
                {t(key('success'), { name: submittedName })}
              </Alert>
              <Button
                type='button'
                variant='primary'
                onClick={handleStartOver}
                data-testid='start-new-button'
              >
                {t(key('buttons.start-new'))}
              </Button>
            </div>
          ) : (
            <>
              <nav aria-label={t(key('progress-label'))}>
                <ol
                  className='flex flex-wrap gap-x-4 gap-y-2 text-sm'
                  data-testid='step-indicator'
                >
                  {steps.map((s, index) => {
                    const status = stepStatus(s)
                    return (
                      <li
                        key={s}
                        aria-current={status === 'current' ? 'step' : undefined}
                        data-step={s}
                        data-status={status}
                        className={
                          status === 'current'
                            ? 'font-bold underline underline-offset-4'
                            : status === 'todo'
                              ? 'opacity-60'
                              : undefined
                        }
                        data-testid={`step-indicator-${s}`}
                      >
                        {index + 1}. {t(key(`steps.${s}`))}
                        {status !== 'current' && status !== 'todo' && (
                          // Done steps show a tick instead, so their status
                          // is only spelled out for screen readers
                          <span
                            className={status === 'done' ? 'sr-only' : 'italic'}
                          >
                            {' '}
                            ({t(key(`status.${status}`))})
                          </span>
                        )}
                        {status === 'done' && <span aria-hidden> ✓</span>}
                      </li>
                    )
                  })}
                </ol>
              </nav>

              <form
                noValidate
                onSubmit={handleNext}
                className='flex flex-col gap-4'
                data-testid='wizard-form'
                data-step={step}
              >
                <div>
                  <p className='text-sm' data-testid='step-count'>
                    {t(key('step-count'), {
                      current: stepNumber,
                      total: steps.length,
                    })}
                  </p>
                  <h3
                    ref={headingRef}
                    tabIndex={-1}
                    className='text-xl font-bold outline-none'
                    data-testid='step-heading'
                  >
                    {t(key(`steps.${step}`))}
                    {isOptional && ` (${t(key('optional'))})`}
                  </h3>
                </div>

                {errorCount > 0 && (
                  <Alert
                    severity='error'
                    role='alert'
                    data-testid='step-error-summary'
                  >
                    {t(key('error-summary'), { count: errorCount })}
                  </Alert>
                )}

                {renderFields()}

                <div className='mt-2 flex flex-wrap gap-4'>
                  {stepNumber > 1 && (
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => {
                        goTo(previousStep(step, data))
                      }}
                      data-testid='back-button'
                    >
                      {t(key('buttons.back'))}
                    </Button>
                  )}
                  {step === 'review' ? (
                    <Button
                      type='button'
                      variant='primary'
                      onClick={handleSubmit}
                      data-testid='submit-button'
                    >
                      {t(key('buttons.submit'))}
                    </Button>
                  ) : (
                    <Button
                      type='submit'
                      variant='primary'
                      data-testid='next-button'
                    >
                      {returnToReview
                        ? t(key('buttons.return-to-review'))
                        : t(key('buttons.next'))}
                    </Button>
                  )}
                  {isOptional && (
                    <Button
                      type='button'
                      variant='tertiary'
                      onClick={handleSkip}
                      data-testid='skip-button'
                    >
                      {t(key('buttons.skip'))}
                    </Button>
                  )}
                  <Button
                    type='button'
                    variant='tertiary'
                    onClick={handleStartOver}
                    data-testid='start-over-button'
                  >
                    {t(key('buttons.start-over'))}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

interface ReviewProps {
  data: WizardData
  progress: WizardProgress
  steps: StepId[]
}

const Review = ({ data, progress, steps }: ReviewProps): JSX.Element => {
  const { t } = useTranslation()

  const valueOf = (field: WizardField): string => {
    switch (field) {
      case 'accountType':
        return t(key(`account-types.${data.accountType}`))
      case 'companySize':
        return t(key('company-size-option'), { size: data.companySize })
      case 'country':
        return t(key(`countries.${data.country}`))
      case 'contactMethod':
        return t(key(`contact-methods.${data.contactMethod}`))
      case 'newsletter':
        return t(key(data.newsletter ? 'yes' : 'no'))
      default:
        return data[field].trim()
    }
  }

  return (
    <div className='flex flex-col gap-4' data-testid='review'>
      <p>{t(key('review-intro'))}</p>
      {steps
        .filter((s) => s !== 'review')
        .map((s) => {
          const skipped = progress.skipped.includes(s)
          const fields = STEP_FIELDS[s].filter(
            (field) => field !== 'phone' || data.contactMethod === 'phone',
          )
          const title = t(key(`steps.${s}`))
          return (
            <section
              key={s}
              aria-labelledby={`review-${s}-title`}
              className='rounded-lg border-2 border-border p-4 dark:border-border-dark'
              data-testid={`review-${s}`}
            >
              <div className='flex items-baseline justify-between gap-4'>
                <h4 id={`review-${s}-title`} className='font-bold'>
                  {title}
                </h4>
                <Link
                  to={{ search: `?step=${s}&from=review` }}
                  aria-label={t(key('edit-label'), { step: title })}
                  className='text-sm underline'
                  data-testid={`edit-${s}`}
                >
                  {t(key('edit'))}
                </Link>
              </div>
              {skipped ? (
                <p className='mt-2 text-sm' data-testid={`review-${s}-skipped`}>
                  {t(key('skipped'))}
                </p>
              ) : (
                <dl className='mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm'>
                  {fields.map((field) => (
                    <React.Fragment key={field}>
                      <dt className='font-semibold'>
                        {t(key(`fields.${FIELD_KEYS[field]}`))}
                      </dt>
                      <dd data-testid={`review-${FIELD_KEYS[field]}`}>
                        {valueOf(field)}
                      </dd>
                    </React.Fragment>
                  ))}
                </dl>
              )}
            </section>
          )
        })}
    </div>
  )
}

export default defineScenario(MultiStepForm, {
  slug: SLUG,
  difficulty: 'medium',
})
