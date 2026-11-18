import { act, cleanup, fireEvent, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import i18n from '../../i18n/i18nConfig'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ptBr from './locales/pt-br.json'
import TimeAndTimers, {
  DEBOUNCE_DELAY,
  IDLE_WARNING,
  LOGOUT_GRACE,
  OFFER_DURATION,
  THROTTLE_INTERVAL,
  TICK,
} from './TimeAndTimers.scenario'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

// Wednesday 18 November 2026, 10:00 local time
const WEDNESDAY_MORNING = new Date(2026, 10, 18, 10, 0, 0)

const wait = async (ms: number): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

// Moves the time on without firing every timer in between, then lets one
// tick run so the page reads the new time. Stepping hours through a clock that
// ticks every second runs thousands of renders, which is slow enough under
// load to time out.
const jump = async (ms: number): Promise<void> => {
  act(() => {
    vi.setSystemTime(Date.now() + ms)
  })
  await wait(TICK)
}

const button = (name: string): HTMLElement =>
  screen.getByRole('button', { name })
const byTestId = (id: string): HTMLElement => screen.getByTestId(id)

// Every key path under an object, e.g. "clock.greeting.morning"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

const render = (date: Date = WEDNESDAY_MORNING): void => {
  vi.setSystemTime(date)
  TestRenderer(<TimeAndTimers />)
}

describe('TimeAndTimers scenario', () => {
  it('is a hard scenario', () => {
    expect(TimeAndTimers.difficulty).toBe('hard')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has the same text keys in $language as in en', ({ locale }) => {
    expect(keyPaths(locale).sort()).toEqual(keyPaths(en).sort())
  })

  // user-event waits on timers internally, which never fire under Vitest's
  // fake timers, so these use fireEvent instead
  // Stepping ten minutes of one-second ticks takes a second or two of real
  // time on its own, and several times that when the whole suite runs at
  // once, so these get more than the default five seconds. The clock they
  // control is fake; only how long the machine takes varies.
  describe('with a controlled clock', { timeout: 20_000 }, () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(async () => {
      // Unmount first, so the language change does not re-render the page
      cleanup()
      vi.useRealTimers()
      await i18n.changeLanguage('en')
    })

    it('explains why the clock needs controlling', () => {
      render()

      expect(screen.getByText(/take control of the clock/)).toBeInTheDocument()
    })

    describe('time of day', () => {
      it('greets and opens according to the time and day', () => {
        render()

        expect(byTestId('greeting')).toHaveTextContent('Good morning')
        expect(byTestId('current-date')).toHaveTextContent(
          'Wednesday, 18 November 2026',
        )
        expect(byTestId('current-time')).toHaveTextContent('10:00:00')
        expect(byTestId('shop-status')).toHaveTextContent(
          'We are open until 17:00.',
        )
      })

      it('keeps the clock moving', async () => {
        render()

        await wait(3 * TICK)

        expect(byTestId('current-time')).toHaveTextContent('10:00:03')
      })

      it('closes the shop when closing time comes round', async () => {
        render(new Date(2026, 10, 18, 16, 59, 59))
        expect(byTestId('shop-status')).toHaveAttribute('data-status', 'open')

        await wait(TICK)

        expect(byTestId('shop-status')).toHaveTextContent(
          'We closed at 17:00. Come back tomorrow.',
        )
        expect(byTestId('greeting')).toHaveTextContent('Good afternoon')
      })

      it('is closed before opening on a weekday', () => {
        render(new Date(2026, 10, 18, 8, 0))

        expect(byTestId('shop-status')).toHaveTextContent(
          'We are closed. We open today at 09:00.',
        )
      })

      it('is closed all day at the weekend', () => {
        render(new Date(2026, 10, 21, 12, 0))

        expect(byTestId('shop-status')).toHaveTextContent(
          'We are closed at weekends. We open again on Monday at 09:00.',
        )
      })

      it('greets late visitors with good night', () => {
        render(new Date(2026, 10, 18, 23, 30))

        expect(byTestId('greeting')).toHaveTextContent('Good night')
      })

      it('formats the date and greeting in the chosen language', async () => {
        await i18n.changeLanguage('fr')
        render()

        expect(byTestId('greeting')).toHaveTextContent('Bonjour')
        expect(byTestId('current-date')).toHaveTextContent(
          'mercredi 18 novembre 2026',
        )
      })
    })

    describe('countdown', () => {
      it('counts down from five minutes', async () => {
        render()
        expect(byTestId('offer-countdown')).toHaveTextContent(
          'Offer ends in 05:00',
        )

        await wait(TICK)

        expect(byTestId('offer-countdown')).toHaveTextContent(
          'Offer ends in 04:59',
        )
      })

      it('expires the offer when it reaches zero', async () => {
        render()

        await wait(OFFER_DURATION - TICK)
        expect(byTestId('offer-countdown')).toHaveTextContent(
          'Offer ends in 00:01',
        )
        expect(button('Claim offer')).toBeEnabled()

        await wait(TICK)
        expect(byTestId('offer-countdown')).toHaveTextContent(
          'This offer has expired',
        )
        expect(byTestId('offer-countdown')).toHaveAttribute(
          'data-state',
          'expired',
        )
        expect(button('Claim offer')).toBeDisabled()
      })

      it('expires straight away when the clock jumps past the end', async () => {
        render()

        // Like page.clock.fastForward: the time moves on, timers fire once
        act(() => {
          vi.setSystemTime(Date.now() + OFFER_DURATION + 10 * MINUTE)
        })
        await wait(TICK)

        expect(byTestId('offer-countdown')).toHaveTextContent(
          'This offer has expired',
        )
      })

      it('leaves the page clickable when the offer expires', async () => {
        render()

        // No activity at all, as when a test jumps the clock
        await wait(OFFER_DURATION)

        expect(byTestId('offer-countdown')).toHaveAttribute(
          'data-state',
          'expired',
        )
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(OFFER_DURATION).toBeLessThan(IDLE_WARNING)
      })

      it('can be claimed before it expires', async () => {
        render()
        await wait(MINUTE)

        fireEvent.click(button('Claim offer'))

        expect(byTestId('offer-countdown')).toHaveTextContent('Offer claimed')
        expect(button('Claim offer')).toBeDisabled()
      })

      it('starts a fresh five minutes on restart', async () => {
        render()
        await wait(OFFER_DURATION)

        fireEvent.click(button('Restart the offer'))

        expect(byTestId('offer-countdown')).toHaveTextContent(
          'Offer ends in 05:00',
        )
        expect(button('Claim offer')).toBeEnabled()
      })
    })

    describe('session timeout', () => {
      it('warns after ten idle minutes', async () => {
        render()

        await wait(IDLE_WARNING - TICK)
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(byTestId('idle-time')).toHaveTextContent('Idle for 09:59')

        await wait(TICK)
        const dialog = screen.getByRole('alertdialog', {
          name: 'Are you still there?',
        })
        expect(dialog).toHaveTextContent('You will be signed out in 01:00.')
        expect(
          within(dialog).getByRole('button', { name: 'Stay signed in' }),
        ).toHaveFocus()
      })

      it('signs out when the warning is ignored', async () => {
        render()

        await wait(IDLE_WARNING + LOGOUT_GRACE)

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(byTestId('session-status')).toHaveTextContent(
          'You have been signed out because you were inactive',
        )
      })

      it.each([
        'keyDown',
        'mouseMove',
        'pointerDown',
        'wheel',
        'scroll',
      ] as const)('restarts the idle time on %s', async (event) => {
        render()
        await wait(IDLE_WARNING - MINUTE)

        fireEvent[event](window)
        await wait(IDLE_WARNING - TICK)

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(byTestId('idle-time')).toHaveTextContent('Idle for 09:59')
      })

      it('shows the idle time reset as soon as there is activity', async () => {
        render()
        await wait(MINUTE)
        expect(byTestId('idle-time')).toHaveTextContent('Idle for 01:00')

        act(() => {
          fireEvent.mouseMove(window)
        })

        expect(byTestId('idle-time')).toHaveTextContent('Idle for 00:00')
      })

      it('does not re-render for every pointer move', async () => {
        vi.setSystemTime(WEDNESDAY_MORNING)
        let commits = 0
        TestRenderer(
          <React.Profiler
            id='page'
            onRender={() => {
              commits += 1
            }}
          >
            <TimeAndTimers />
          </React.Profiler>,
        )
        await wait(MINUTE)
        commits = 0

        // Separate events 16ms apart, like a pointer moving, all within a TICK
        for (let move = 0; move < 50; move += 1) {
          act(() => {
            vi.advanceTimersByTime(16)
            fireEvent.mouseMove(window)
          })
        }

        // One to reset the idle time. React may render once more before it
        // skips updates that change nothing, but not once per event.
        expect(commits).toBeLessThanOrEqual(2)
        expect(byTestId('idle-time')).toHaveTextContent('Idle for 00:00')
      })

      it('ignores activity once the warning is showing', async () => {
        render()
        await wait(IDLE_WARNING)

        fireEvent.keyDown(window)
        await wait(LOGOUT_GRACE)

        expect(byTestId('session-status')).toHaveAttribute(
          'data-state',
          'signed-out',
        )
      })

      it('keeps the session when Stay signed in is chosen', async () => {
        render()
        await wait(IDLE_WARNING + 30 * TICK)

        fireEvent.click(button('Stay signed in'))
        await wait(LOGOUT_GRACE)

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(byTestId('session-status')).toHaveTextContent(
          'You are signed in',
        )
      })

      it('stays signed out until Sign in again is chosen', async () => {
        render()
        await wait(IDLE_WARNING + LOGOUT_GRACE)

        fireEvent.keyDown(window)
        await wait(TICK)
        expect(byTestId('session-status')).toHaveAttribute(
          'data-state',
          'signed-out',
        )

        fireEvent.click(button('Sign in again'))
        expect(byTestId('session-status')).toHaveTextContent(
          'You are signed in',
        )
        expect(byTestId('idle-time')).toHaveTextContent('Idle for 00:00')
      })
    })

    describe('relative timestamps', () => {
      const times = (): string[] =>
        screen.getAllByTestId('relative-time').map((time) => time.textContent)

      it('updates the text as time passes', async () => {
        render()
        expect(times()).toEqual(['just now'])

        await wait(3 * MINUTE)
        expect(times()).toEqual(['3 minutes ago'])

        await jump(2 * HOUR)
        expect(times()).toEqual(['2 hours ago'])
      })

      it('lists new updates first, each with its exact time', async () => {
        render()
        await wait(MINUTE)

        fireEvent.click(button('Post an update'))

        const updates = screen.getAllByTestId('update')
        expect(updates[0]).toHaveTextContent('Update 1 posted')
        expect(updates[1]).toHaveTextContent('Page opened')
        expect(times()).toEqual(['just now', '1 minute ago'])
        expect(within(updates[0]).getByTestId('relative-time')).toHaveAttribute(
          'datetime',
          new Date(Date.now()).toISOString(),
        )
      })

      it('words the time in the chosen language', async () => {
        await i18n.changeLanguage('fr')
        render()

        await jump(3 * MINUTE)

        expect(times()).toEqual(['il y a 3 minutes'])
      })
    })

    describe('debounced search', () => {
      const search = (value: string): void => {
        fireEvent.change(screen.getByLabelText('Search cities'), {
          target: { value },
        })
      }

      it('waits until typing stops before searching', async () => {
        render()

        search('l')
        await wait(DEBOUNCE_DELAY - 1)
        search('liv')
        await wait(DEBOUNCE_DELAY - 1)
        expect(byTestId('search-status')).toHaveTextContent('Searching…')
        expect(byTestId('search-count')).toHaveTextContent('0 searches run')

        await wait(1)
        expect(byTestId('search-count')).toHaveTextContent('1 search run')
        const results = screen.getByRole('list', { name: 'Matching cities' })
        expect(
          within(results)
            .getAllByRole('listitem')
            .map((item) => item.textContent),
        ).toEqual(['Liverpool'])
      })

      it('says when nothing matches', async () => {
        render()

        search('Tokyo')
        await wait(DEBOUNCE_DELAY)

        expect(byTestId('search-status')).toHaveTextContent(
          'No cities match "Tokyo"',
        )
      })

      it('does not search when the text goes back to what was searched', async () => {
        render()

        search('x')
        search('')
        await wait(DEBOUNCE_DELAY)

        expect(byTestId('search-count')).toHaveTextContent('0 searches run')
        expect(byTestId('search-status')).toHaveTextContent('Type to search')
      })
    })

    describe('throttled button', () => {
      it('is ready again when the clock jumps without firing timers', async () => {
        render()
        fireEvent.click(button('Save'))

        // Like page.clock.setSystemTime: the time moves on, no timer fires
        act(() => {
          vi.setSystemTime(Date.now() + THROTTLE_INTERVAL)
        })
        // The next clock tick re-renders the label. The cooldown timer is
        // not due yet, as jumping the system time does not move timers
        await wait(TICK)
        expect(byTestId('throttle-status')).toHaveAttribute(
          'data-state',
          'ready',
        )

        fireEvent.click(button('Save'))

        expect(byTestId('save-count')).toHaveTextContent('Saved 2 times')
        expect(byTestId('ignored-count')).toHaveTextContent('0 clicks ignored')
      })

      it('ignores clicks until the interval has passed', async () => {
        render()

        fireEvent.click(button('Save'))
        fireEvent.click(button('Save'))
        fireEvent.click(button('Save'))
        expect(byTestId('save-count')).toHaveTextContent('Saved 1 time')
        expect(byTestId('ignored-count')).toHaveTextContent('2 clicks ignored')
        expect(byTestId('throttle-status')).toHaveAttribute(
          'data-state',
          'cooling-down',
        )

        await wait(THROTTLE_INTERVAL - 1)
        fireEvent.click(button('Save'))
        expect(byTestId('save-count')).toHaveTextContent('Saved 1 time')

        await wait(1)
        expect(byTestId('throttle-status')).toHaveTextContent('Ready to save')
        fireEvent.click(button('Save'))
        expect(byTestId('save-count')).toHaveTextContent('Saved 2 times')
        expect(byTestId('ignored-count')).toHaveTextContent('3 clicks ignored')
      })
    })
  })
})
