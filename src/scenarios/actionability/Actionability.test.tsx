import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import i18n from '../../i18n/i18nConfig'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ptBr from './locales/pt-br.json'
import Actionability, {
  LAYOUT_SHIFT_DELAY,
  OVERLAY_DELAY,
  PASS_DURATION,
  PRODUCTS,
  SETTLE_PASSES,
  TERMS_CLAUSES,
} from './Actionability.scenario'
import { DIFFICULTY } from './meta'

const lastAction = (): HTMLElement => screen.getByTestId('last-action')
const button = (name: string): HTMLElement =>
  screen.getByRole('button', { name })

const wait = async (ms: number): Promise<void> => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

// Every key path under an object, e.g. "result.title"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

describe('Actionability scenario', () => {
  it('is a hard scenario', () => {
    expect(DIFFICULTY).toBe('hard')
  })

  it.each([
    { language: 'fr', locale: fr },
    { language: 'pt-br', locale: ptBr },
  ])('has the same text keys in $language as in en', ({ locale }) => {
    expect(keyPaths(locale).sort()).toEqual(keyPaths(en).sort())
  })

  // user-event waits on timers internally, which never fire under Vitest's
  // fake timers, so these click with fireEvent instead
  describe('with a controlled clock', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      TestRenderer(<Actionability />)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('starts with no action', () => {
      expect(lastAction()).toHaveTextContent('Nothing yet')
    })

    describe('overlays', () => {
      it('intercepts the click aimed at the always covered button', () => {
        const overlay = screen.getByTestId('permanent-overlay')

        fireEvent.click(overlay)

        expect(overlay.parentElement).toContainElement(button('Accept terms'))
        expect(lastAction()).toHaveTextContent(
          'The click was intercepted by a transparent overlay',
        )
      })

      it('still runs the covered button when it is clicked directly', () => {
        fireEvent.click(button('Accept terms'))

        expect(lastAction()).toHaveTextContent('Accepted the terms')
      })

      it('covers the Continue button until the loading overlay clears', async () => {
        expect(screen.getByTestId('overlay-status')).toHaveTextContent(
          'Waiting for the loading overlay to clear…',
        )

        await wait(OVERLAY_DELAY - 1)
        fireEvent.click(screen.getByTestId('loading-overlay'))
        expect(lastAction()).toHaveTextContent(
          'The click was intercepted by a transparent overlay',
        )

        await wait(1)
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument()
        expect(screen.getByTestId('overlay-status')).toHaveTextContent(
          'The loading overlay has cleared',
        )

        fireEvent.click(button('Continue'))
        expect(lastAction()).toHaveTextContent(
          'Continued after the overlay cleared',
        )
      })

      it('brings the loading overlay back on request', async () => {
        await wait(OVERLAY_DELAY)

        fireEvent.click(button('Show the overlay again'))

        expect(screen.getByTestId('loading-overlay')).toBeInTheDocument()
        await wait(OVERLAY_DELAY)
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument()
      })
    })

    describe('sticky header', () => {
      it('sticks to the top of the window above the product rows', () => {
        expect(screen.getByTestId('sticky-header')).toHaveClass(
          'sticky',
          'top-0',
          'z-20',
        )
        expect(screen.getAllByRole('button', { name: /^Add / })).toHaveLength(
          PRODUCTS.length,
        )
      })

      it('counts the products added to the basket', () => {
        const count = screen.getByTestId('basket-count')
        expect(count).toHaveTextContent('0 items')

        fireEvent.click(button('Add Pears'))
        expect(count).toHaveTextContent('1 item')
        expect(lastAction()).toHaveTextContent('Added Pears to the basket')

        fireEvent.click(button('Add Eggs'))
        expect(count).toHaveTextContent('2 items')
      })

      it('reports a click that lands on the header', () => {
        fireEvent.click(screen.getByTestId('sticky-header'))

        expect(lastAction()).toHaveTextContent(
          'The click landed on the sticky header',
        )
      })
    })

    describe('moving elements', () => {
      it('keeps the first button moving forever', () => {
        expect(button('Catch me')).toHaveStyle({
          animationName: 'actionability-slide',
          animationIterationCount: 'infinite',
        })

        fireEvent.click(button('Catch me'))

        expect(lastAction()).toHaveTextContent(
          'Caught the button that never stops moving',
        )
      })

      it('moves the second button for a set number of passes', () => {
        expect(button('Wait for me')).toHaveStyle({
          animationIterationCount: String(SETTLE_PASSES),
        })
        expect(screen.getByTestId('settle-status')).toHaveTextContent(
          'The second button is still moving',
        )

        fireEvent.click(button('Wait for me'))

        expect(lastAction()).toHaveTextContent(
          'Clicked the settling button while it was still moving',
        )
      })

      it('settles once its passes are done', async () => {
        await wait(PASS_DURATION * SETTLE_PASSES - 1)
        expect(button('Wait for me')).toHaveAttribute('data-settled', 'false')

        await wait(1)

        expect(screen.getByTestId('settle-status')).toHaveTextContent(
          'The second button has settled',
        )
        expect(button('Wait for me')).toHaveAttribute('data-settled', 'true')
        expect(button('Wait for me')).not.toHaveStyle({
          animationName: 'actionability-slide',
        })

        fireEvent.click(button('Wait for me'))
        expect(lastAction()).toHaveTextContent(
          'Clicked the settling button after it stopped',
        )
      })

      it('starts moving again on request', async () => {
        await wait(PASS_DURATION * SETTLE_PASSES)
        expect(button('Wait for me')).toHaveAttribute('data-settled', 'true')

        fireEvent.click(button('Move it again'))

        expect(button('Wait for me')).toHaveAttribute('data-settled', 'false')
        expect(button('Wait for me')).toHaveStyle({
          animationName: 'actionability-slide',
        })
      })
    })

    describe('layout shift', () => {
      it('confirms the order before the banner arrives', () => {
        expect(screen.queryByTestId('promo-banner')).not.toBeInTheDocument()

        fireEvent.click(button('Confirm order'))

        expect(lastAction()).toHaveTextContent('Confirmed the order')
      })

      it('injects the banner above the Confirm order button after a delay', async () => {
        await wait(LAYOUT_SHIFT_DELAY - 1)
        expect(screen.queryByTestId('promo-banner')).not.toBeInTheDocument()

        await wait(1)
        const banner = screen.getByTestId('promo-banner')
        expect(banner.parentElement?.firstElementChild).toBe(banner)
        expect(
          banner.compareDocumentPosition(button('Confirm order')) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

        fireEvent.click(within(banner).getByRole('button'))
        expect(lastAction()).toHaveTextContent(
          'Upgraded to premium: the banner moved in under the click',
        )
      })

      it('loads the banner again on request', async () => {
        await wait(LAYOUT_SHIFT_DELAY)

        fireEvent.click(button('Load the banner again'))

        expect(screen.queryByTestId('promo-banner')).not.toBeInTheDocument()
        await wait(LAYOUT_SHIFT_DELAY)
        expect(screen.getByTestId('promo-banner')).toBeInTheDocument()
      })
    })

    describe('scrollable container', () => {
      it('puts the button at the end of a box that scrolls on its own', () => {
        const box = screen.getByRole('generic', {
          name: 'Terms and conditions',
        })

        expect(box).toHaveClass('h-48', 'overflow-y-auto')
        expect(box.querySelectorAll('p')).toHaveLength(TERMS_CLAUSES)
        expect(box.lastElementChild).toBe(button('I agree'))
      })

      it('records the agreement', () => {
        fireEvent.click(button('I agree'))

        expect(lastAction()).toHaveTextContent(
          'Agreed to the terms after scrolling the box',
        )
      })
    })

    describe('present but not clickable', () => {
      it('gives the zero-size button no width or height', () => {
        expect(button('Zero-size button')).toHaveStyle({
          width: '0px',
          height: '0px',
        })
      })

      it.each([
        {
          name: 'Ignores the pointer',
          result: 'Clicked the pointer-events: none button',
        },
        { name: 'Zero-size button', result: 'Clicked the zero-size button' },
      ])(
        'only reacts to "$name" through a script click',
        ({ name, result }) => {
          fireEvent.click(button(name))

          expect(lastAction()).toHaveTextContent(result)
        },
      )
    })
  })

  // Real timers here, because user-event is the point: it refuses to click
  // through pointer-events: none just as a real browser pointer would
  it('cannot click the pointer-events: none button with a real pointer', async () => {
    const user = userEvent.setup()
    TestRenderer(<Actionability />)

    await expect(user.click(button('Ignores the pointer'))).rejects.toThrow(
      /pointer-events: none/,
    )
    expect(lastAction()).toHaveTextContent('Nothing yet')
  })

  it('shows the basket count in French', async () => {
    await act(async () => {
      await i18n.changeLanguage('fr')
    })
    try {
      TestRenderer(<Actionability />)

      expect(screen.getByTestId('basket-count')).toHaveTextContent(
        /^0 article$/,
      )
    } finally {
      await act(async () => {
        await i18n.changeLanguage('en')
      })
    }
  })
})

describe('Actionability when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  it('shows the last action, and the product in it, in the new language', async () => {
    TestRenderer(<Actionability />)
    fireEvent.click(button('Add Pears'))

    await switchLanguage('fr')

    expect(lastAction()).toHaveTextContent('Poires ajouté au panier')
  })
})
