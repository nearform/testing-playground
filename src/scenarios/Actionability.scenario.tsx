import { Button, CardTitle } from '@nearform/quantum'
import type { CSSProperties } from 'react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

const key = (path: string): string => `scenarios.actionability.${path}`

// How long the transparent loading overlay covers its button
export const OVERLAY_DELAY = 3000
// How long before the banner is injected above the Confirm order button
export const LAYOUT_SHIFT_DELAY = 2000
// One back-and-forth pass of a moving button, and how many passes the
// settling button makes before it stops
export const PASS_DURATION = 1200
export const SETTLE_PASSES = 3

export const PRODUCTS = [
  'apples',
  'bananas',
  'carrots',
  'dates',
  'eggs',
  'flour',
  'grapes',
  'honey',
  'lemons',
  'milk',
  'oats',
  'pears',
] as const

export const TERMS_CLAUSES = 20

// Becomes true once `delay` ms have passed, and can be started again. Also
// returns which run this is, to remount anything that should start over.
const useDelayedFlag = (delay: number): [boolean, () => void, number] => {
  const [done, setDone] = useState(false)
  const [run, setRun] = useState(0)

  useEffect(() => {
    setDone(false)
    const timer = setTimeout(() => {
      setDone(true)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [delay, run])

  return [done, () => setRun((current) => current + 1), run]
}

// The keyframes live in index.css. Animating `left` rather than a transform
// keeps the button's layout box moving too, so every way of reading its
// position sees it move.
const slide = (iterations: number | 'infinite'): CSSProperties => ({
  animationName: 'actionability-slide',
  animationDuration: `${PASS_DURATION}ms`,
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: iterations,
})

const sectionClasses = 'flex flex-col gap-4'
const boxClasses =
  'rounded-lg border-2 border-border p-4 dark:border-border-dark'

const Actionability = (): JSX.Element => {
  const { t } = useTranslation()
  const [lastAction, setLastAction] = useState<string | null>(null)
  const record = (path: string, values?: Record<string, unknown>): void => {
    setLastAction(t(key(`result.${path}`), values))
  }

  // Overlays
  const [overlayCleared, restartOverlay] = useDelayedFlag(OVERLAY_DELAY)

  // Sticky header
  const [basket, setBasket] = useState(0)

  // Moving elements
  // The animation runs for exactly as long as this timer, which is easier
  // to rely on than animationend
  const [settled, restartMoving, moveRun] = useDelayedFlag(
    PASS_DURATION * SETTLE_PASSES,
  )

  // Layout shift
  const [bannerShown, restartBanner] = useDelayedFlag(LAYOUT_SHIFT_DELAY)

  return (
    <Layout>
      <PageSetup
        title={t(key('title'))}
        description={t(key('description'))}
        information={translateInformation(t, key('information'))}
      >
        <div className='flex flex-col gap-10'>
          <section
            className='flex flex-col gap-2 rounded-lg border-2 border-brandGreen p-4'
            aria-labelledby='last-action-title'
          >
            <CardTitle id='last-action-title'>
              {t(key('result.title'))}
            </CardTitle>
            <p aria-live='polite' data-testid='last-action'>
              {lastAction ?? t(key('result.none'))}
            </p>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('overlay.title'))}</CardTitle>
            <p className='text-sm'>{t(key('overlay.instructions'))}</p>
            <div className='grid gap-6 md:grid-cols-2'>
              <div className={`${boxClasses} flex flex-col gap-3`}>
                <h3 className='font-semibold'>
                  {t(key('overlay.permanent-title'))}
                </h3>
                <div className='relative w-fit'>
                  <Button
                    onClick={() => {
                      record('accepted')
                    }}
                  >
                    {t(key('overlay.accept'))}
                  </Button>
                  {/* Invisible, but sits on top of the button and takes
                      every click aimed at it */}
                  <div
                    className='absolute inset-0 z-10'
                    data-testid='permanent-overlay'
                    onClick={() => {
                      record('intercepted')
                    }}
                  />
                </div>
              </div>

              <div className={`${boxClasses} flex flex-col gap-3`}>
                <h3 className='font-semibold'>
                  {t(key('overlay.timed-title'))}
                </h3>
                <p className='text-sm' data-testid='overlay-status'>
                  {overlayCleared
                    ? t(key('overlay.cleared'))
                    : t(key('overlay.waiting'))}
                </p>
                <div className='relative w-fit'>
                  <Button
                    onClick={() => {
                      record('continued')
                    }}
                  >
                    {t(key('overlay.continue'))}
                  </Button>
                  {!overlayCleared && (
                    <div
                      className='absolute inset-0 z-10 cursor-wait'
                      data-testid='loading-overlay'
                      onClick={() => {
                        record('intercepted')
                      }}
                    />
                  )}
                </div>
                <Button
                  size='sm'
                  variant='secondary'
                  className='w-fit'
                  onClick={restartOverlay}
                >
                  {t(key('overlay.restart'))}
                </Button>
              </div>
            </div>
          </section>

          {/* The sticky header sticks to the top of the window while this
              section scrolls past, covering whatever is scrolled under it */}
          <section className={sectionClasses}>
            <div
              className='sticky top-0 z-20 flex h-16 items-center justify-between gap-4 rounded-lg bg-brandGreen px-4 font-semibold text-black'
              data-testid='sticky-header'
              onClick={() => {
                record('sticky-header')
              }}
            >
              <span>{t(key('sticky.title'))}</span>
              <span data-testid='basket-count'>
                {t(key('sticky.basket'), { count: basket })}
              </span>
            </div>
            <p className='text-sm'>{t(key('sticky.instructions'))}</p>
            <ul className='flex flex-col'>
              {PRODUCTS.map((product) => {
                const name = t(key(`sticky.products.${product}`))
                return (
                  <li
                    key={product}
                    className='flex h-14 items-center justify-between border-b border-border dark:border-border-dark'
                  >
                    <span>{name}</span>
                    <Button
                      size='sm'
                      variant='secondary'
                      onClick={() => {
                        setBasket((count) => count + 1)
                        record('added', { product: name })
                      }}
                    >
                      {t(key('sticky.add'), { product: name })}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('moving.title'))}</CardTitle>
            <p className='text-sm'>{t(key('moving.instructions'))}</p>
            <div
              className={`${boxClasses} relative h-16 overflow-hidden`}
              data-testid='endless-track'
            >
              <Button
                className='absolute top-2 left-2 w-36'
                style={slide('infinite')}
                onClick={() => {
                  record('caught')
                }}
              >
                {t(key('moving.endless'))}
              </Button>
            </div>
            <p className='text-sm' data-testid='settle-status'>
              {settled ? t(key('moving.settled')) : t(key('moving.moving'))}
            </p>
            <div className={`${boxClasses} relative h-16 overflow-hidden`}>
              <Button
                key={moveRun}
                className='absolute top-2 left-2 w-36'
                style={settled ? undefined : slide(SETTLE_PASSES)}
                data-settled={settled}
                onClick={() => {
                  record(settled ? 'clicked-settled' : 'clicked-moving')
                }}
              >
                {t(key('moving.settling'))}
              </Button>
            </div>
            <Button
              size='sm'
              variant='secondary'
              className='w-fit'
              onClick={restartMoving}
            >
              {t(key('moving.restart'))}
            </Button>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('shift.title'))}</CardTitle>
            <p className='text-sm'>{t(key('shift.instructions'))}</p>
            <div className={`${boxClasses} flex flex-col gap-3`}>
              {/* Injected at the top, so its button lands exactly where
                  Confirm order was a moment ago */}
              {bannerShown && (
                <div
                  className='flex flex-wrap items-center gap-3'
                  data-testid='promo-banner'
                >
                  <Button
                    onClick={() => {
                      record('upgraded')
                    }}
                  >
                    {t(key('shift.upgrade'))}
                  </Button>
                  <span className='text-sm'>{t(key('shift.offer'))}</span>
                </div>
              )}
              <Button
                className='w-fit'
                onClick={() => {
                  record('confirmed')
                }}
              >
                {t(key('shift.confirm'))}
              </Button>
            </div>
            <Button
              size='sm'
              variant='secondary'
              className='w-fit'
              onClick={restartBanner}
            >
              {t(key('shift.restart'))}
            </Button>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('scroll.title'))}</CardTitle>
            <p className='text-sm'>{t(key('scroll.instructions'))}</p>
            {/* The page does not scroll to reach the button: this box does */}
            <div
              className={`${boxClasses} flex h-48 flex-col gap-3 overflow-y-auto`}
              data-testid='terms-container'
              tabIndex={0}
              aria-label={t(key('scroll.label'))}
            >
              {Array.from({ length: TERMS_CLAUSES }, (_, index) => (
                <p key={index} className='text-sm'>
                  {t(key('scroll.clause'), { number: index + 1 })}
                </p>
              ))}
              <Button
                className='w-fit shrink-0'
                onClick={() => {
                  record('agreed')
                }}
              >
                {t(key('scroll.agree'))}
              </Button>
            </div>
          </section>

          <section className={sectionClasses}>
            <CardTitle>{t(key('unclickable.title'))}</CardTitle>
            <p className='text-sm'>{t(key('unclickable.instructions'))}</p>
            <div className='flex flex-wrap items-center gap-4'>
              {/* Looks normal, but the pointer passes straight through it */}
              <Button
                style={{ pointerEvents: 'none' }}
                onClick={() => {
                  record('pointer-events')
                }}
              >
                {t(key('unclickable.pointer-events'))}
              </Button>
              {/* In the DOM with text, but no width or height at all */}
              <button
                type='button'
                style={{
                  width: 0,
                  height: 0,
                  padding: 0,
                  border: 0,
                  overflow: 'hidden',
                }}
                onClick={() => {
                  record('zero-size')
                }}
              >
                {t(key('unclickable.zero-size'))}
              </button>
            </div>
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(Actionability, { difficulty: 'hard' })
