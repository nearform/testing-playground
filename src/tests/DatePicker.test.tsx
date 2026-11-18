import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import i18n from '../i18n/i18nConfig'
import DatePicker, { NO_VALUE } from '../scenarios/DatePicker.scenario'

// Wednesday 18 November 2026, mid-morning local time. Only Date is faked, so
// user-event's own timers still run
const TODAY = new Date(2026, 10, 18, 10, 30)

const appointmentTrigger = (): HTMLElement =>
  screen.getByRole('button', { name: /^Appointment date/ })
const tripTrigger = (): HTMLElement =>
  screen.getByRole('button', { name: /^Trip dates/ })
const birthDateInput = (): HTMLElement =>
  screen.getByRole('textbox', { name: 'Date of birth' })

const calendar = (name: string): HTMLElement =>
  screen.getByRole('dialog', { name })
const appointmentCalendar = (): HTMLElement =>
  calendar('Choose an appointment date')
const tripCalendar = (): HTMLElement => calendar('Choose trip dates')
const birthDateCalendar = (): HTMLElement => calendar('Choose date of birth')

// A day button in a calendar, found by its ISO data-date
const day = (popup: HTMLElement, iso: string): HTMLElement => {
  const button = popup.querySelector<HTMLElement>(`[data-date="${iso}"]`)
  if (button === null) throw new Error(`No day ${iso} in the calendar`)
  return button
}

const setLanguage = async (language: string): Promise<void> => {
  await act(async () => {
    await i18n.changeLanguage(language)
  })
}

describe('Date picker scenario', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(TODAY)
  })

  afterEach(async () => {
    vi.useRealTimers()
    if (i18n.language !== 'en') await setLanguage('en')
    localStorage.removeItem('language')
  })

  describe('appointment picker', () => {
    it('starts with nothing chosen', () => {
      TestRenderer(<DatePicker />)

      expect(appointmentTrigger()).toHaveTextContent('Choose a date')
      expect(screen.getByTestId('appointment-value')).toHaveTextContent(
        NO_VALUE,
      )
    })

    it('opens the calendar outside the page content, on the current month', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(appointmentTrigger())

      const popup = appointmentCalendar()
      expect(appointmentTrigger()).toHaveAttribute('aria-expanded', 'true')
      expect(popup.parentElement).toBe(document.body)
      expect(within(popup).getByRole('grid')).toHaveAccessibleName(
        'November 2026',
      )
    })

    it('focuses today when it opens', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(appointmentTrigger())

      expect(day(appointmentCalendar(), '2026-11-18')).toHaveFocus()
      expect(day(appointmentCalendar(), '2026-11-18')).toHaveAttribute(
        'aria-current',
        'date',
      )
    })

    it('names each day with the full date', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(appointmentTrigger())

      expect(day(appointmentCalendar(), '2026-11-20')).toHaveAccessibleName(
        'Friday, November 20, 2026',
      )
      expect(day(appointmentCalendar(), '2026-11-20')).toHaveTextContent(/^20$/)
    })

    it('picks a weekday, closes and shows it in ISO and display formats', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(appointmentTrigger())
      await user.click(day(appointmentCalendar(), '2026-11-20'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByTestId('appointment-value')).toHaveTextContent(
        '2026-11-20',
      )
      expect(appointmentTrigger()).toHaveTextContent('11/20/2026')
      expect(appointmentTrigger()).toHaveFocus()
    })

    it.each([
      { iso: '2026-11-21', reason: 'a Saturday' },
      { iso: '2026-11-22', reason: 'a Sunday' },
      { iso: '2026-11-17', reason: 'yesterday' },
    ])('does not pick $iso, $reason', async ({ iso }) => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())

      await user.click(day(appointmentCalendar(), iso))

      expect(day(appointmentCalendar(), iso)).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      expect(screen.getByTestId('appointment-value')).toHaveTextContent(
        NO_VALUE,
      )
    })

    it('cannot go back before the current month', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(appointmentTrigger())

      expect(
        within(appointmentCalendar()).getByRole('button', {
          name: 'Previous month',
        }),
      ).toBeDisabled()
    })

    it('moves to the next month with its button', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())

      await user.click(
        within(appointmentCalendar()).getByRole('button', {
          name: 'Next month',
        }),
      )
      await user.click(day(appointmentCalendar(), '2026-12-07'))

      expect(screen.getByTestId('appointment-value')).toHaveTextContent(
        '2026-12-07',
      )
    })

    it('jumps to another month and year with the lists', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())
      const popup = appointmentCalendar()

      await user.selectOptions(
        within(popup).getByRole('combobox', { name: 'Year' }),
        '2028',
      )
      await user.selectOptions(
        within(popup).getByRole('combobox', { name: 'Month' }),
        'February',
      )

      expect(within(popup).getByRole('grid')).toHaveAccessibleName(
        'February 2028',
      )
    })

    it('picks a day with the keyboard', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())

      // Wednesday 18th: right to the 19th, down a week to the 26th
      await user.keyboard('{ArrowRight}{ArrowDown}{Enter}')

      expect(screen.getByTestId('appointment-value')).toHaveTextContent(
        '2026-11-26',
      )
    })

    it('moves a month with Page Down', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())

      await user.keyboard('{PageDown}')

      expect(day(appointmentCalendar(), '2026-12-18')).toHaveFocus()
    })

    it('closes on Escape and gives focus back to the trigger', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(appointmentTrigger()).toHaveFocus()
    })

    it('closes without picking when something outside is pressed', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())

      await user.click(screen.getByText('Book a weekday', { exact: false }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByTestId('appointment-value')).toHaveTextContent(
        NO_VALUE,
      )
    })

    it('clears the chosen date', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(appointmentTrigger())
      await user.click(day(appointmentCalendar(), '2026-11-20'))

      await user.click(screen.getByTestId('appointment-clear'))

      expect(screen.getByTestId('appointment-value')).toHaveTextContent(
        NO_VALUE,
      )
    })
  })

  describe('trip range picker', () => {
    it('stays open after the first day and asks for the last', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(tripTrigger())

      await user.click(day(tripCalendar(), '2026-11-20'))

      expect(screen.getByTestId('trip-calendar-status')).toHaveTextContent(
        'Pick the last day',
      )
      expect(screen.getByTestId('trip-start-value')).toHaveTextContent(
        '2026-11-20',
      )
      expect(screen.getByTestId('trip-end-value')).toHaveTextContent(NO_VALUE)
    })

    it('closes once the last day is picked and shows both ends', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(tripTrigger())

      await user.click(day(tripCalendar(), '2026-11-20'))
      await user.click(day(tripCalendar(), '2026-11-24'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByTestId('trip-start-value')).toHaveTextContent(
        '2026-11-20',
      )
      expect(screen.getByTestId('trip-end-value')).toHaveTextContent(
        '2026-11-24',
      )
      expect(tripTrigger()).toHaveTextContent('11/20/2026 – 11/24/2026')
    })

    it('marks the days of the range as selected or in between', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(tripTrigger())
      await user.click(day(tripCalendar(), '2026-11-20'))
      await user.click(day(tripCalendar(), '2026-11-24'))

      await user.click(tripTrigger())

      const selected = within(tripCalendar())
        .getAllByRole('gridcell', { selected: true })
        .map((cell) => cell.textContent)
      expect(selected).toEqual(['20', '24'])
    })

    it('starts again from a day picked before the first', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(tripTrigger())

      await user.click(day(tripCalendar(), '2026-11-25'))
      await user.click(day(tripCalendar(), '2026-11-19'))

      expect(screen.getByTestId('trip-start-value')).toHaveTextContent(
        '2026-11-19',
      )
      expect(screen.getByTestId('trip-end-value')).toHaveTextContent(NO_VALUE)
    })

    it('allows weekends but not past days', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(tripTrigger())

      expect(day(tripCalendar(), '2026-11-21')).not.toHaveAttribute(
        'aria-disabled',
      )
      expect(day(tripCalendar(), '2026-11-17')).toHaveAttribute(
        'aria-disabled',
        'true',
      )
    })
  })

  describe('date of birth field', () => {
    it('accepts a typed date in the English format on Enter', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.type(birthDateInput(), '3/4/2000{Enter}')

      expect(screen.getByTestId('birth-date-value')).toHaveTextContent(
        '2000-03-04',
      )
      expect(birthDateInput()).toHaveValue('03/04/2000')
    })

    it('checks the typed date when the field loses focus', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.type(birthDateInput(), '12/25/1990')
      expect(screen.getByTestId('birth-date-value')).toHaveTextContent(NO_VALUE)
      await user.tab()

      expect(screen.getByTestId('birth-date-value')).toHaveTextContent(
        '1990-12-25',
      )
    })

    it.each([
      { typed: '25/12/1990', error: 'Enter a real date as MM/DD/YYYY' },
      { typed: '12/25/2027', error: 'Date of birth cannot be in the future' },
      { typed: '12/25/1899', error: 'Date of birth cannot be before 1900' },
    ])('refuses "$typed"', async ({ typed, error }) => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.type(birthDateInput(), `${typed}{Enter}`)

      expect(screen.getByRole('alert')).toHaveTextContent(error)
      expect(birthDateInput()).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('birth-date-value')).toHaveTextContent(NO_VALUE)
    })

    it('picks a date from the calendar into the field', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.click(
        screen.getByRole('button', { name: 'Choose date of birth' }),
      )
      const popup = birthDateCalendar()

      await user.selectOptions(
        within(popup).getByRole('combobox', { name: 'Year' }),
        '1990',
      )
      await user.click(day(popup, '1990-11-05'))

      expect(birthDateInput()).toHaveValue('11/05/1990')
      expect(screen.getByTestId('birth-date-value')).toHaveTextContent(
        '1990-11-05',
      )
    })

    it('does not offer days after today', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(
        screen.getByRole('button', { name: 'Choose date of birth' }),
      )

      expect(day(birthDateCalendar(), '2026-11-19')).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      expect(
        within(birthDateCalendar()).getByRole('button', {
          name: 'Next month',
        }),
      ).toBeDisabled()
    })
  })

  describe('in other languages', () => {
    it('reads a typed date day first in French', async () => {
      await setLanguage('fr')
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.type(
        screen.getByRole('textbox', { name: 'Date de naissance' }),
        '03/04/2000{Enter}',
      )

      expect(screen.getByTestId('birth-date-value')).toHaveTextContent(
        '2000-04-03',
      )
    })

    it('rewrites the chosen date in the new format after a language switch', async () => {
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)
      await user.type(birthDateInput(), '03/04/2000{Enter}')

      await setLanguage('ptBr')

      expect(
        screen.getByRole('textbox', { name: 'Data de nascimento' }),
      ).toHaveValue('04/03/2000')
      expect(screen.getByTestId('birth-date-value')).toHaveTextContent(
        '2000-03-04',
      )
    })

    it.each([
      { language: 'en', first: 'Sun' },
      { language: 'fr', first: 'lun.' },
      { language: 'ptBr', first: 'dom.' },
    ])(
      'starts the week on $first in $language',
      async ({ language, first }) => {
        await setLanguage(language)
        const user = userEvent.setup()
        TestRenderer(<DatePicker />)

        await user.click(screen.getByTestId('appointment-trigger'))

        expect(
          within(screen.getByRole('dialog')).getAllByRole('columnheader')[0],
        ).toHaveTextContent(first)
      },
    )

    it('names the days in French', async () => {
      await setLanguage('fr')
      const user = userEvent.setup()
      TestRenderer(<DatePicker />)

      await user.click(screen.getByTestId('appointment-trigger'))

      expect(
        day(screen.getByRole('dialog'), '2026-11-20'),
      ).toHaveAccessibleName('vendredi 20 novembre 2026')
    })
  })
})
