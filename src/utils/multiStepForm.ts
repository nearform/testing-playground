// Logic for the multi-step form wizard, kept free of React so the rules for
// which steps exist, which are complete and which can be visited are easy to
// test on their own.

export const ACCOUNT_TYPES = ['personal', 'business'] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const COMPANY_SIZES = ['1-9', '10-49', '50-249', '250+'] as const
export type CompanySize = (typeof COMPANY_SIZES)[number]

export const COUNTRIES = ['gb', 'fr', 'br', 'pt', 'other'] as const
export type Country = (typeof COUNTRIES)[number]

export const CONTACT_METHODS = ['email', 'phone'] as const
export type ContactMethod = (typeof CONTACT_METHODS)[number]

export interface WizardData {
  fullName: string
  email: string
  accountType: AccountType | ''
  companyName: string
  companySize: CompanySize | ''
  street: string
  city: string
  postcode: string
  country: Country | ''
  contactMethod: ContactMethod
  phone: string
  newsletter: boolean
}

export type WizardField = keyof WizardData

// Each error is an i18n key suffix under `scenarios.multi-step-form.errors`
export type WizardErrors = Partial<Record<WizardField, string>>

export const emptyWizardData: WizardData = {
  fullName: '',
  email: '',
  accountType: '',
  companyName: '',
  companySize: '',
  street: '',
  city: '',
  postcode: '',
  country: '',
  contactMethod: 'email',
  phone: '',
  newsletter: false,
}

export const STEP_IDS = [
  'personal',
  'company',
  'address',
  'preferences',
  'review',
] as const
export type StepId = (typeof STEP_IDS)[number]

// Steps that can be skipped without being filled in
export const OPTIONAL_STEPS: readonly StepId[] = ['preferences']

// The fields each step owns, in the order they appear on screen
export const STEP_FIELDS: Record<StepId, WizardField[]> = {
  personal: ['fullName', 'email', 'accountType'],
  company: ['companyName', 'companySize'],
  address: ['street', 'city', 'postcode', 'country'],
  preferences: ['contactMethod', 'phone', 'newsletter'],
  review: [],
}

export interface WizardProgress {
  // Steps left with Next, which is the only way to pass their validation
  completed: StepId[]
  // Optional steps left with Skip
  skipped: StepId[]
}

export const emptyProgress: WizardProgress = { completed: [], skipped: [] }

// The company step only exists for business accounts
export const getSteps = (data: WizardData): StepId[] =>
  STEP_IDS.filter(
    (step) => step !== 'company' || data.accountType === 'business',
  )

export const isStepId = (value: unknown): value is StepId =>
  typeof value === 'string' && (STEP_IDS as readonly string[]).includes(value)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\+?[0-9 ]+$/
// Letters, digits, spaces and hyphens, which covers UK, French, Brazilian and
// Portuguese postcodes without being tied to one of them
const POSTCODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]{1,8}[A-Za-z0-9]$/

const validateField = (
  field: WizardField,
  data: WizardData,
): string | undefined => {
  switch (field) {
    case 'fullName': {
      const name = data.fullName.trim()
      if (name === '') return 'full-name-required'
      if (name.length < 2) return 'full-name-too-short'
      return undefined
    }
    case 'email': {
      const email = data.email.trim()
      if (email === '') return 'email-required'
      if (!EMAIL_PATTERN.test(email)) return 'email-invalid'
      return undefined
    }
    case 'accountType':
      return data.accountType === '' ? 'account-type-required' : undefined
    case 'companyName':
      return data.companyName.trim() === ''
        ? 'company-name-required'
        : undefined
    case 'companySize':
      return data.companySize === '' ? 'company-size-required' : undefined
    case 'street':
      return data.street.trim() === '' ? 'street-required' : undefined
    case 'city':
      return data.city.trim() === '' ? 'city-required' : undefined
    case 'postcode': {
      const postcode = data.postcode.trim()
      if (postcode === '') return 'postcode-required'
      if (!POSTCODE_PATTERN.test(postcode)) return 'postcode-invalid'
      return undefined
    }
    case 'country':
      return data.country === '' ? 'country-required' : undefined
    case 'phone': {
      // Only needed when phone is the chosen way to be contacted
      if (data.contactMethod !== 'phone') return undefined
      const phone = data.phone.trim()
      if (phone === '') return 'phone-required'
      if (!PHONE_PATTERN.test(phone)) return 'phone-invalid'
      const digits = phone.replace(/\D/g, '').length
      if (digits < 10 || digits > 15) return 'phone-length'
      return undefined
    }
    case 'contactMethod':
    case 'newsletter':
      return undefined
  }
}

export const validateStep = (step: StepId, data: WizardData): WizardErrors => {
  const errors: WizardErrors = {}
  for (const field of STEP_FIELDS[step]) {
    const error = validateField(field, data)
    if (error !== undefined) errors[field] = error
  }
  return errors
}

const isValid = (step: StepId, data: WizardData): boolean =>
  Object.keys(validateStep(step, data)).length === 0

// A step is done once it has been skipped (optional steps only), or left with
// Next and is still valid: Back does not validate, so a completed step can be
// made invalid again by editing it and going back.
export const isStepDone = (
  step: StepId,
  data: WizardData,
  progress: WizardProgress,
): boolean =>
  (OPTIONAL_STEPS.includes(step) && progress.skipped.includes(step)) ||
  (progress.completed.includes(step) && isValid(step, data))

// The step to show for the one asked for in the URL. A step can only be
// visited once every step before it is done, so deep-linking past an
// unfinished step lands on the first unfinished one instead. Unknown steps,
// and the company step for a personal account, count as asking for the
// first step.
export const resolveStep = (
  requested: string | null,
  data: WizardData,
  progress: WizardProgress,
): StepId => {
  const steps = getSteps(data)
  const target =
    isStepId(requested) && steps.includes(requested) ? requested : steps[0]
  for (const step of steps) {
    if (step === target) return step
    if (!isStepDone(step, data, progress)) return step
  }
  return target
}

export const nextStep = (step: StepId, data: WizardData): StepId => {
  const steps = getSteps(data)
  return steps[Math.min(steps.indexOf(step) + 1, steps.length - 1)]
}

export const previousStep = (step: StepId, data: WizardData): StepId => {
  const steps = getSteps(data)
  return steps[Math.max(steps.indexOf(step) - 1, 0)]
}

export const STORAGE_KEY = 'multi-step-form'

export interface SavedWizard {
  data: WizardData
  progress: WizardProgress
}

const pickString = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T | '',
): T | '' =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback

const text = (value: unknown): string =>
  typeof value === 'string' ? value : ''

const stepList = (value: unknown): StepId[] =>
  Array.isArray(value) ? value.filter(isStepId) : []

// Reads saved answers back, falling back to an empty form for anything
// missing or malformed so a bad value in storage cannot break the page
export const parseSaved = (raw: string | null): SavedWizard => {
  let parsed: unknown
  try {
    parsed = raw === null ? null : JSON.parse(raw)
  } catch {
    parsed = null
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { data: emptyWizardData, progress: emptyProgress }
  }
  const { data, progress } = parsed as Record<string, unknown>
  const d = (typeof data === 'object' && data !== null ? data : {}) as Record<
    string,
    unknown
  >
  const p = (
    typeof progress === 'object' && progress !== null ? progress : {}
  ) as Record<string, unknown>
  return {
    data: {
      fullName: text(d.fullName),
      email: text(d.email),
      accountType: pickString(d.accountType, ACCOUNT_TYPES, ''),
      companyName: text(d.companyName),
      companySize: pickString(d.companySize, COMPANY_SIZES, ''),
      street: text(d.street),
      city: text(d.city),
      postcode: text(d.postcode),
      country: pickString(d.country, COUNTRIES, ''),
      contactMethod:
        pickString(d.contactMethod, CONTACT_METHODS, '') || 'email',
      phone: text(d.phone),
      newsletter: d.newsletter === true,
    },
    progress: {
      completed: stepList(p.completed),
      skipped: stepList(p.skipped).filter((step) =>
        OPTIONAL_STEPS.includes(step),
      ),
    },
  }
}
