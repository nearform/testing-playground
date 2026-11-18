import { fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ptBr from './locales/pt-br.json'
import AccessibilityViolations, {
  AREA_ID,
  EXPECTED_RULES,
  MANUAL_ISSUES,
  NEEDS_REVIEW_RULES,
  versionFrom,
} from './AccessibilityViolations.scenario'
import { DIFFICULTY } from './meta'

// Every key path under an object, e.g. "form.title"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

// Shows the current URL, so tests can see what the switch does to it
const LocationProbe = (): JSX.Element => {
  const { search } = useLocation()
  return <output data-testid='location-search'>{search}</output>
}

const renderPage = (search = ''): void => {
  TestRenderer(
    <>
      <AccessibilityViolations />
      <LocationProbe />
    </>,
    { initialEntries: [`/accessibility-violations${search}`] },
  )
}

const renderBroken = (): void => {
  renderPage()
}

const renderFixed = (): void => {
  renderPage('?version=fixed')
}

const area = (): HTMLElement => screen.getByTestId('violations-area')

const listedItems = (testId: string, attribute: string): string[] =>
  within(screen.getByTestId(testId))
    .getAllByRole('row')
    .map((row) => row.getAttribute(attribute) ?? '')

// The text of each cell in the expected problems row with this attribute
const rowCells = (selector: string): string[] => {
  const row = screen
    .getByTestId('expected-problems')
    .querySelector<HTMLElement>(selector)
  if (row === null) throw new Error(`No expected problem row ${selector}`)
  return within(row)
    .getAllByRole('cell')
    .map((cell) => cell.textContent ?? '')
}

describe('Accessibility violations scenario', () => {
  it('is a medium scenario', () => {
    expect(DIFFICULTY).toBe('medium')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has the same text keys in $language as in en', ({ locale }) => {
    expect(keyPaths(locale).sort()).toEqual(keyPaths(en).sort())
  })

  it.each([
    { value: null, expected: 'broken' },
    { value: 'fixed', expected: 'fixed' },
    { value: 'broken', expected: 'broken' },
    { value: 'FIXED', expected: 'broken' },
  ])('reads version=$value as the $expected version', ({ value, expected }) => {
    expect(versionFrom(value)).toBe(expected)
  })

  it('keeps every problem inside the scan area', () => {
    renderBroken()

    expect(area()).toHaveAttribute('id', AREA_ID)
  })

  describe('version switch', () => {
    it('shows the broken version by default', () => {
      renderBroken()

      expect(screen.getByTestId('switch-fixed-version')).not.toBeChecked()
      expect(area()).toHaveAttribute('data-version', 'broken')
      expect(screen.getByTestId('version-status')).toHaveTextContent(
        'Showing the broken version',
      )
    })

    it('opens the fixed version from the URL', () => {
      renderFixed()

      expect(screen.getByTestId('switch-fixed-version')).toBeChecked()
      expect(area()).toHaveAttribute('data-version', 'fixed')
    })

    it('puts the version in the URL when switched on and removes it when switched off', () => {
      renderBroken()
      const toggle = screen.getByRole('switch', {
        name: 'Show the fixed version',
      })

      fireEvent.click(toggle)
      expect(screen.getByTestId('location-search')).toHaveTextContent(
        '?version=fixed',
      )
      expect(area()).toHaveAttribute('data-version', 'fixed')

      fireEvent.click(toggle)
      expect(screen.getByTestId('location-search')).toBeEmptyDOMElement()
      expect(area()).toHaveAttribute('data-version', 'broken')
    })
  })

  describe('expected problems list', () => {
    it('lists the axe-core rules, the rules needing review and the keyboard problems in the broken version', () => {
      renderBroken()

      expect(listedItems('expected-rules', 'data-rule')).toEqual([
        ...EXPECTED_RULES,
      ])
      expect(listedItems('expected-review', 'data-rule')).toEqual([
        ...NEEDS_REVIEW_RULES,
      ])
      expect(listedItems('expected-manual', 'data-issue')).toEqual([
        ...MANUAL_ISSUES,
      ])
    })

    it.each([
      {
        selector: '[data-rule="label"]',
        cells: ['label', 'The Email address field has no label', 'Violation'],
      },
      {
        selector: '[data-rule="duplicate-id-aria"]',
        cells: [
          'duplicate-id-aria',
          'The First name and Last name labels share an ID, so both fields are named First name',
          'Needs review (incomplete)',
        ],
      },
      {
        selector: '[data-issue="keyboard-trap"]',
        cells: [
          'Keyboard trap',
          'Tab and Shift+Tab never leave the Message box',
          'Keyboard test only',
        ],
      },
    ])(
      'shows what is wrong and how it is reported for $selector',
      ({ selector, cells }) => {
        renderBroken()

        expect(rowCells(selector)).toEqual(cells)
      },
    )

    it('lists nothing in the fixed version', () => {
      renderFixed()

      expect(screen.queryByTestId('expected-rules')).not.toBeInTheDocument()
      expect(screen.getByTestId('expected-none')).toBeInTheDocument()
    })
  })

  describe('broken version', () => {
    it('leaves the email field without a label', () => {
      renderBroken()

      expect(screen.getByTestId('input-email')).not.toHaveAccessibleName()
    })

    it('gives the first and last name labels the same ID, so both fields are named First name', () => {
      renderBroken()

      expect(area().querySelectorAll('[id="name-label"]')).toHaveLength(2)
      expect(screen.getByTestId('input-last-name')).toHaveAccessibleName(
        'First name',
      )
    })

    it('leaves the profile picture without alt text', () => {
      renderBroken()

      expect(screen.getByTestId('profile-image')).not.toHaveAttribute('alt')
    })

    it('skips from a level 2 to a level 4 heading', () => {
      renderBroken()

      expect(
        within(area()).getByRole('heading', { name: 'Newsletter sign-up' })
          .tagName,
      ).toBe('H2')
      expect(screen.getByTestId('heading-details').tagName).toBe('H4')
    })

    it('never says whether the digest checkbox is checked', () => {
      renderBroken()
      const checkbox = screen.getByTestId('checkbox-digest')

      fireEvent.click(checkbox)

      expect(checkbox).toHaveAttribute('data-checked', 'true')
      expect(checkbox).not.toHaveAttribute('aria-checked')
    })

    it('sets aria-expanded to yes or no on More options', () => {
      renderBroken()
      const button = screen.getByTestId('button-more-options')

      expect(button).toHaveAttribute('aria-expanded', 'no')
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'yes')
      expect(screen.getByTestId('more-options')).toBeVisible()
    })

    it('makes the terms box impossible to focus', () => {
      renderBroken()

      expect(screen.getByTestId('terms-box')).not.toHaveAttribute('tabindex')
    })

    it('uses a low-contrast colour for the privacy note', () => {
      renderBroken()

      expect(screen.getByTestId('privacy-note')).toHaveStyle({
        color: 'rgb(176, 176, 176)',
        backgroundColor: 'rgb(255, 255, 255)',
      })
    })

    it('leaves the help button and the GitHub link without names', () => {
      renderBroken()

      expect(screen.getByTestId('button-help')).not.toHaveAccessibleName()
      expect(screen.getByTestId('link-github')).not.toHaveAccessibleName()
    })

    it('keeps Tab inside the message box and types a tab character instead', () => {
      renderBroken()
      const textarea = screen.getByTestId('textarea-message')
      fireEvent.change(textarea, { target: { value: 'ab' } })
      ;(textarea as HTMLTextAreaElement).setSelectionRange(2, 2)

      const tabNotCancelled = fireEvent.keyDown(textarea, { key: 'Tab' })
      const shiftTabNotCancelled = fireEvent.keyDown(textarea, {
        key: 'Tab',
        shiftKey: true,
      })

      expect(tabNotCancelled).toBe(false)
      expect(shiftTabNotCancelled).toBe(false)
      expect(textarea).toHaveValue('ab\t')
    })

    it('makes Subscribe a div that only a mouse click can use', () => {
      renderBroken()
      const subscribe = screen.getByTestId('button-subscribe')

      expect(subscribe.tagName).toBe('DIV')
      expect(subscribe).not.toHaveAttribute('tabindex')
      expect(screen.queryByRole('button', { name: 'Subscribe' })).toBeNull()

      fireEvent.click(subscribe)
      expect(screen.getByTestId('subscribe-status')).toHaveTextContent(
        'Thanks, you are now subscribed.',
      )
    })
  })

  describe('fixed version', () => {
    it('labels the email field', () => {
      renderFixed()

      expect(screen.getByTestId('input-email')).toHaveAccessibleName(
        'Email address',
      )
    })

    it('gives each name field its own label', () => {
      renderFixed()

      expect(area().querySelectorAll('[id="name-label"]')).toHaveLength(0)
      expect(screen.getByTestId('input-first-name')).toHaveAccessibleName(
        'First name',
      )
      expect(screen.getByTestId('input-last-name')).toHaveAccessibleName(
        'Last name',
      )
    })

    it('describes the profile picture', () => {
      renderFixed()

      expect(
        screen.getByRole('img', { name: 'Default profile picture' }),
      ).toBeInTheDocument()
    })

    it('follows a level 2 heading with level 3 headings', () => {
      renderFixed()

      expect(screen.getByTestId('heading-details').tagName).toBe('H3')
    })

    it('says whether the digest checkbox is checked', () => {
      renderFixed()
      const checkbox = screen.getByRole('checkbox', {
        name: 'Send me the weekly digest',
      })

      expect(checkbox).not.toBeChecked()
      fireEvent.keyDown(checkbox, { key: ' ' })
      expect(checkbox).toBeChecked()
    })

    it('sets aria-expanded to true or false on More options', () => {
      renderFixed()
      const button = screen.getByRole('button', { name: 'More options' })

      expect(button).toHaveAttribute('aria-expanded', 'false')
      fireEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('makes the terms box a focusable, named region', () => {
      renderFixed()

      expect(
        screen.getByRole('region', { name: 'Terms and conditions' }),
      ).toHaveAttribute('tabindex', '0')
    })

    it('uses a high-contrast colour for the privacy note', () => {
      renderFixed()

      expect(screen.getByTestId('privacy-note')).toHaveStyle({
        color: 'rgb(89, 89, 89)',
      })
    })

    it('names the help button and the GitHub link', () => {
      renderFixed()

      expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Testing Playground on GitHub' }),
      ).toBeInTheDocument()
    })

    it('lets Tab leave the message box', () => {
      renderFixed()
      const textarea = screen.getByTestId('textarea-message')

      const notCancelled = fireEvent.keyDown(textarea, { key: 'Tab' })

      expect(notCancelled).toBe(true)
      expect(textarea).toHaveValue('')
    })

    it('makes Subscribe a real button', () => {
      renderFixed()

      fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }))

      expect(screen.getByTestId('subscribe-status')).toHaveTextContent(
        'Thanks, you are now subscribed.',
      )
    })
  })
})
