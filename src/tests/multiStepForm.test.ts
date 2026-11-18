import { describe, expect, it } from 'vitest'

import type { WizardData, WizardProgress } from '../utils/multiStepForm'
import {
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

const validPersonal: WizardData = {
  ...emptyWizardData,
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  accountType: 'personal',
}

const validAddress: WizardData = {
  ...validPersonal,
  street: '12 St James Square',
  city: 'London',
  postcode: 'SW1Y 4JH',
  country: 'gb',
}

const progress = (
  completed: WizardProgress['completed'],
  skipped: WizardProgress['skipped'] = [],
): WizardProgress => ({ completed, skipped })

describe('getSteps', () => {
  it('leaves out the company step for a personal account', () => {
    expect(getSteps(validPersonal)).toEqual([
      'personal',
      'address',
      'preferences',
      'review',
    ])
  })

  it('adds the company step after personal details for a business account', () => {
    expect(getSteps({ ...validPersonal, accountType: 'business' })).toEqual([
      'personal',
      'company',
      'address',
      'preferences',
      'review',
    ])
  })
})

describe('validateStep', () => {
  it('reports every missing required field on the personal step', () => {
    expect(validateStep('personal', emptyWizardData)).toEqual({
      fullName: 'full-name-required',
      email: 'email-required',
      accountType: 'account-type-required',
    })
  })

  it.each([
    { postcode: 'SW1Y 4JH', expected: undefined },
    { postcode: '75001', expected: undefined },
    { postcode: '01310-100', expected: undefined },
    { postcode: 'A1', expected: 'postcode-invalid' },
    { postcode: 'SW1Y#4JH', expected: 'postcode-invalid' },
    { postcode: '   ', expected: 'postcode-required' },
  ])(
    'gives postcode "$postcode" the error $expected',
    ({ postcode, expected }) => {
      expect(
        validateStep('address', { ...validAddress, postcode }).postcode,
      ).toBe(expected)
    },
  )

  it('ignores the phone number while email is the contact method', () => {
    expect(
      validateStep('preferences', { ...validPersonal, phone: 'abc' }),
    ).toEqual({})
  })

  it.each([
    { phone: '', expected: 'phone-required' },
    { phone: '12-34', expected: 'phone-invalid' },
    { phone: '123456789', expected: 'phone-length' },
    { phone: '+44 20 7946 0000', expected: undefined },
  ])(
    'gives phone "$phone" the error $expected when contacting by phone',
    ({ phone, expected }) => {
      const data: WizardData = {
        ...validPersonal,
        contactMethod: 'phone',
        phone,
      }
      expect(validateStep('preferences', data).phone).toBe(expected)
    },
  )
})

describe('isStepDone', () => {
  it('does not count a valid step that was never left with Next', () => {
    expect(isStepDone('personal', validPersonal, emptyProgress)).toBe(false)
  })

  it('does not count a completed step that has since been made invalid', () => {
    const data = { ...validPersonal, email: 'not-an-email' }
    expect(isStepDone('personal', data, progress(['personal']))).toBe(false)
  })

  it('counts a skipped optional step whatever its answers', () => {
    const data: WizardData = { ...validPersonal, contactMethod: 'phone' }
    expect(isStepDone('preferences', data, progress([], ['preferences']))).toBe(
      true,
    )
  })
})

describe('resolveStep', () => {
  it('shows the first step when no step is asked for', () => {
    expect(resolveStep(null, emptyWizardData, emptyProgress)).toBe('personal')
  })

  it('shows the first step for an unknown step', () => {
    expect(resolveStep('payment', validPersonal, emptyProgress)).toBe(
      'personal',
    )
  })

  it('stops a deep link at the first unfinished step', () => {
    expect(resolveStep('review', validAddress, progress(['personal']))).toBe(
      'address',
    )
  })

  it('shows the asked-for step once every earlier step is done', () => {
    const done = progress(['personal', 'address'], ['preferences'])
    expect(resolveStep('review', validAddress, done)).toBe('review')
  })

  it('treats the company step as unknown for a personal account', () => {
    expect(resolveStep('company', validPersonal, progress(['personal']))).toBe(
      'personal',
    )
  })
})

describe('nextStep and previousStep', () => {
  it('goes from personal details to the company step for a business', () => {
    expect(
      nextStep('personal', { ...validPersonal, accountType: 'business' }),
    ).toBe('company')
  })

  it('goes back from the address to personal details for a personal account', () => {
    expect(previousStep('address', validPersonal)).toBe('personal')
  })
})

describe('parseSaved', () => {
  it('reads back answers and progress that were saved', () => {
    const saved = { data: validAddress, progress: progress(['personal']) }
    expect(parseSaved(JSON.stringify(saved))).toEqual(saved)
  })

  it.each([{ raw: null }, { raw: '{not json' }, { raw: '"a string"' }])(
    'falls back to an empty form for $raw',
    ({ raw }) => {
      expect(parseSaved(raw)).toEqual({
        data: emptyWizardData,
        progress: emptyProgress,
      })
    },
  )

  it('drops values that are not one of the allowed choices', () => {
    const raw = JSON.stringify({
      data: { accountType: 'admin', country: 'xx', contactMethod: 'fax' },
      progress: { completed: ['personal', 'payment'], skipped: ['address'] },
    })
    expect(parseSaved(raw)).toEqual({
      data: emptyWizardData,
      progress: progress(['personal']),
    })
  })
})
