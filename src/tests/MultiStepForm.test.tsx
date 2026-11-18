import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import en from '../i18n/locales/en.json'
import fr from '../i18n/locales/fr.json'
import ptBr from '../i18n/locales/pt-br.json'
import MultiStepForm from '../scenarios/MultiStepForm.scenario'
import { STORAGE_KEY, emptyWizardData } from '../utils/multiStepForm'

type User = ReturnType<typeof userEvent.setup>

// Every key path under an object, e.g. "errors.city-required"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

// Shows the router's query string, so tests can see the step in the URL
const LocationProbe = (): JSX.Element => {
  const { search } = useLocation()
  return <output data-testid='location'>{search}</output>
}

const renderForm = (search = ''): User => {
  const user = userEvent.setup()
  TestRenderer(
    <>
      <MultiStepForm />
      <LocationProbe />
    </>,
    { initialEntries: [`/multi-step-form${search}`] },
  )
  return user
}

const currentStep = (): string | undefined =>
  screen.getByTestId('wizard-form').dataset.step

const fillPersonal = async (
  user: User,
  accountType: 'personal' | 'business' = 'personal',
): Promise<void> => {
  await user.type(screen.getByTestId('full-name'), 'Ada Lovelace')
  await user.type(screen.getByTestId('email'), 'ada@example.com')
  await user.click(screen.getByTestId(`account-type-${accountType}`))
  await user.click(screen.getByTestId('next-button'))
}

const fillAddress = async (user: User): Promise<void> => {
  await user.type(screen.getByTestId('street'), '12 St James Square')
  await user.type(screen.getByTestId('city'), 'London')
  await user.type(screen.getByTestId('postcode'), 'SW1Y 4JH')
  await user.selectOptions(screen.getByTestId('country'), 'gb')
  await user.click(screen.getByTestId('next-button'))
}

// Saves a finished personal and address step, ready to deep-link past them
const seedCompletedAddress = (): void => {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      data: {
        ...emptyWizardData,
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        accountType: 'personal',
        street: '12 St James Square',
        city: 'London',
        postcode: 'SW1Y 4JH',
        country: 'gb',
      },
      progress: { completed: ['personal', 'address'], skipped: [] },
    }),
  )
}

describe('MultiStepForm scenario', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('is a medium scenario', () => {
    expect(MultiStepForm.difficulty).toBe('medium')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has every English text translated into $language', ({ locale }) => {
    expect(keyPaths(locale.scenarios['multi-step-form'])).toEqual(
      keyPaths(en.scenarios['multi-step-form']),
    )
  })

  it('puts the first step in the URL when none is given', () => {
    renderForm()

    expect(screen.getByTestId('location')).toHaveTextContent('?step=personal')
  })

  it('blocks Next and lists the errors when the step is incomplete', async () => {
    const user = renderForm()

    await user.click(screen.getByTestId('next-button'))

    expect(currentStep()).toBe('personal')
    expect(screen.getByTestId('step-error-summary')).toHaveTextContent(
      'Please fix the 3 errors below to continue.',
    )
  })

  it('moves focus to the first invalid field when Next is blocked', async () => {
    const user = renderForm()
    await user.type(screen.getByTestId('full-name'), 'Ada Lovelace')

    await user.click(screen.getByTestId('next-button'))

    expect(screen.getByTestId('email')).toHaveFocus()
  })

  it('clears an error as soon as the field is fixed', async () => {
    const user = renderForm()
    await user.click(screen.getByTestId('next-button'))

    await user.type(screen.getByTestId('full-name'), 'Ada')

    expect(screen.queryByTestId('full-name-error')).toBeNull()
  })

  it('moves to the address step and updates the URL once the step is valid', async () => {
    const user = renderForm()

    await fillPersonal(user)

    expect(screen.getByTestId('location')).toHaveTextContent('?step=address')
    expect(screen.getByTestId('step-count')).toHaveTextContent('Step 2 of 4')
  })

  it('focuses the new step heading after moving on', async () => {
    const user = renderForm()

    await fillPersonal(user)

    expect(screen.getByTestId('step-heading')).toHaveFocus()
  })

  it('adds the company step for a business account', async () => {
    const user = renderForm()

    await fillPersonal(user, 'business')

    expect(currentStep()).toBe('company')
    expect(screen.getByTestId('step-count')).toHaveTextContent('Step 2 of 5')
  })

  it('keeps answers when going back a step', async () => {
    const user = renderForm()
    await fillPersonal(user)

    await user.click(screen.getByTestId('back-button'))

    expect(screen.getByTestId('full-name')).toHaveValue('Ada Lovelace')
  })

  it('redirects a deep link past unfinished steps to the first of them', () => {
    renderForm('?step=review')

    expect(currentStep()).toBe('personal')
    expect(screen.getByTestId('location')).toHaveTextContent('?step=personal')
  })

  it('opens a deep-linked step when the earlier steps were saved as finished', () => {
    seedCompletedAddress()

    renderForm('?step=preferences')

    expect(currentStep()).toBe('preferences')
  })

  it('restores saved answers after a reload', async () => {
    const user = renderForm()
    await user.type(screen.getByTestId('full-name'), 'Ada Lovelace')
    // Unmounting and rendering again is a reload: only storage survives
    cleanup()

    renderForm()

    expect(screen.getByTestId('full-name')).toHaveValue('Ada Lovelace')
  })

  it('asks for a phone number only when phone is the contact method', async () => {
    seedCompletedAddress()
    const user = renderForm('?step=preferences')

    await user.click(screen.getByTestId('contact-method-phone'))

    expect(screen.getByTestId('phone')).toBeInTheDocument()
  })

  it('shows a skipped optional step as skipped on the review', async () => {
    seedCompletedAddress()
    const user = renderForm('?step=preferences')

    await user.click(screen.getByTestId('skip-button'))

    expect(screen.getByTestId('review-preferences-skipped')).toHaveTextContent(
      'Skipped',
    )
  })

  it('shows every answer on the review', async () => {
    seedCompletedAddress()
    const user = renderForm('?step=preferences')

    await user.click(screen.getByTestId('next-button'))

    const address = screen.getByTestId('review-address')
    expect(within(address).getByTestId('review-postcode')).toHaveTextContent(
      'SW1Y 4JH',
    )
    expect(within(address).getByTestId('review-country')).toHaveTextContent(
      'United Kingdom',
    )
  })

  it('returns to the review after editing a step from it', async () => {
    seedCompletedAddress()
    const user = renderForm('?step=preferences')
    await user.click(screen.getByTestId('skip-button'))
    await user.click(screen.getByRole('link', { name: 'Edit Address' }))
    await user.clear(screen.getByTestId('city'))
    await user.type(screen.getByTestId('city'), 'Paris')

    await user.click(
      screen.getByRole('button', { name: 'Save and return to review' }),
    )

    expect(screen.getByTestId('review-city')).toHaveTextContent('Paris')
  })

  it('returns to the review after an edit from it adds the company step', async () => {
    seedCompletedAddress()
    const user = renderForm('?step=preferences')
    await user.click(screen.getByTestId('skip-button'))
    await user.click(
      screen.getByRole('link', { name: 'Edit Personal details' }),
    )
    await user.click(screen.getByTestId('account-type-business'))
    await user.click(screen.getByTestId('next-button'))
    expect(currentStep()).toBe('company')
    expect(screen.getByTestId('location')).toHaveTextContent(
      '?step=company&from=review',
    )
    await user.type(screen.getByTestId('company-name'), 'Analytical Engines')
    await user.selectOptions(screen.getByTestId('company-size'), '10-49')

    await user.click(screen.getByTestId('next-button'))

    expect(currentStep()).toBe('review')
    expect(screen.getByTestId('location')).toHaveTextContent(/^\?step=review$/)
  })

  it('confirms the submission and clears the saved answers', async () => {
    seedCompletedAddress()
    const user = renderForm('?step=preferences')
    await user.click(screen.getByTestId('skip-button'))

    await user.click(screen.getByTestId('submit-button'))

    expect(screen.getByTestId('form-success')).toHaveTextContent(
      'Thanks Ada Lovelace, your application has been submitted.',
    )
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('walks through every step from start to submission', async () => {
    const user = renderForm()
    await fillPersonal(user, 'business')
    await user.type(screen.getByTestId('company-name'), 'Analytical Engines')
    await user.selectOptions(screen.getByTestId('company-size'), '10-49')
    await user.click(screen.getByTestId('next-button'))
    await fillAddress(user)
    await user.click(screen.getByTestId('next-button'))

    await user.click(screen.getByTestId('submit-button'))

    expect(screen.getByTestId('form-success')).toBeInTheDocument()
  })
})
