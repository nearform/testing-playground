import { Button, CardTitle, Input, Label, Spinner } from '@nearform/quantum'
import type { ReactNode } from 'react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

// Every step waits a different random time in this range, so a test that
// sleeps for a fixed time is sometimes too short and always too slow
export const MIN_DELAY = 1000
export const MAX_DELAY = 5000

export const randomDelay = (): number =>
  MIN_DELAY + Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1))

// Runs callbacks after a delay, and cancels any still waiting when the page
// is left, so a late timer never updates an unmounted component
const useDelay = (): ((callback: () => void, ms: number) => void) => {
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => {
        window.clearTimeout(timer)
      })
    }
  }, [])

  return useCallback((callback: () => void, ms: number) => {
    timers.current.push(window.setTimeout(callback, ms))
  }, [])
}

const LoadingSpinner = ({ id }: { id: string }): JSX.Element => {
  const { t } = useTranslation()
  const label = t('scenarios.dynamic-loading.loading')
  // A status takes its name only from aria-label, not from Quantum's hidden
  // label text, so set both to keep it findable by role and name
  return (
    <Spinner label={label} aria-label={label} data-testid={`${id}-spinner`} />
  )
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}): JSX.Element => (
  <section className='flex flex-col items-start gap-4'>
    <CardTitle>{title}</CardTitle>
    {children}
  </section>
)

// An element that does not exist until the spinner finishes
const RenderedAfterLoading = (): JSX.Element => {
  const { t } = useTranslation()
  const delay = useDelay()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const start = (): void => {
    setState('loading')
    delay(() => {
      setState('done')
    }, randomDelay())
  }

  return (
    <Section title={t('scenarios.dynamic-loading.rendered.title')}>
      <Button
        onClick={start}
        disabled={state === 'loading'}
        data-testid='rendered-start'
      >
        {t('scenarios.dynamic-loading.start')}
      </Button>
      {state === 'loading' && <LoadingSpinner id='rendered' />}
      {state === 'done' && (
        <p data-testid='rendered-element'>
          {t('scenarios.dynamic-loading.rendered.result')}
        </p>
      )}
    </Section>
  )
}

// An element that is in the page from the start, but hidden until the
// spinner finishes
const HiddenUntilLoaded = (): JSX.Element => {
  const { t } = useTranslation()
  const delay = useDelay()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  const start = (): void => {
    setState('loading')
    delay(() => {
      setState('done')
    }, randomDelay())
  }

  return (
    <Section title={t('scenarios.dynamic-loading.hidden.title')}>
      <Button
        onClick={start}
        disabled={state === 'loading'}
        data-testid='hidden-start'
      >
        {t('scenarios.dynamic-loading.start')}
      </Button>
      {state === 'loading' && <LoadingSpinner id='hidden' />}
      {/* An inline style rather than a class, so it is hidden whatever CSS
          has loaded */}
      <p
        data-testid='hidden-element'
        style={state === 'done' ? undefined : { display: 'none' }}
      >
        {t('scenarios.dynamic-loading.hidden.result')}
      </p>
    </Section>
  )
}

// An input that starts disabled and is enabled (or disabled again) after a
// delay, with the button locked while it changes
const EnabledAfterDelay = (): JSX.Element => {
  const { t } = useTranslation()
  const delay = useDelay()
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  // The key rather than the text, so the message follows a language switch
  const [messageKey, setMessageKey] = useState<string | null>(null)

  const toggle = (): void => {
    const next = !enabled
    setBusy(true)
    setMessageKey(
      next
        ? 'scenarios.dynamic-loading.enable.enabling'
        : 'scenarios.dynamic-loading.enable.disabling',
    )
    delay(() => {
      setEnabled(next)
      setBusy(false)
      setMessageKey(
        next
          ? 'scenarios.dynamic-loading.enable.enabled'
          : 'scenarios.dynamic-loading.enable.disabled',
      )
    }, randomDelay())
  }

  return (
    <Section title={t('scenarios.dynamic-loading.enable.title')}>
      <div className='flex w-full max-w-sm flex-col gap-2'>
        <Label htmlFor='enable-input'>
          {t('scenarios.dynamic-loading.enable.label')}
        </Label>
        <Input
          id='enable-input'
          type='text'
          variant='primary'
          data-testid='enable-input'
          disabled={!enabled}
        />
      </div>
      <Button onClick={toggle} disabled={busy} data-testid='enable-toggle'>
        {t(
          enabled
            ? 'scenarios.dynamic-loading.enable.disable'
            : 'scenarios.dynamic-loading.enable.enable',
        )}
      </Button>
      {busy && <LoadingSpinner id='enable' />}
      {messageKey !== null && (
        <p aria-live='polite' data-testid='enable-message'>
          {t(messageKey)}
        </p>
      )}
    </Section>
  )
}

// A checkbox that is removed and later added back as a brand new element, so
// a reference to the old one goes stale
const RemovedAndAdded = (): JSX.Element => {
  const { t } = useTranslation()
  const delay = useDelay()
  const [present, setPresent] = useState(true)
  const [busy, setBusy] = useState(false)
  // The key rather than the text, so the message follows a language switch
  const [messageKey, setMessageKey] = useState<string | null>(null)
  // Changes every time the checkbox comes back, so React builds a new node
  // instead of reusing the old one
  const [generation, setGeneration] = useState(0)

  const toggle = (): void => {
    const next = !present
    setBusy(true)
    setMessageKey(null)
    delay(() => {
      if (next) setGeneration((value) => value + 1)
      setPresent(next)
      setBusy(false)
      setMessageKey(
        next
          ? 'scenarios.dynamic-loading.remove.added'
          : 'scenarios.dynamic-loading.remove.removed',
      )
    }, randomDelay())
  }

  return (
    <Section title={t('scenarios.dynamic-loading.remove.title')}>
      {present && (
        <label
          key={generation}
          className='flex items-center gap-2'
          data-testid='removable-element'
        >
          <input type='checkbox' data-testid='removable-checkbox' />
          {t('scenarios.dynamic-loading.remove.checkbox')}
        </label>
      )}
      <Button onClick={toggle} disabled={busy} data-testid='remove-toggle'>
        {t(
          present
            ? 'scenarios.dynamic-loading.remove.remove'
            : 'scenarios.dynamic-loading.remove.add',
        )}
      </Button>
      {busy && <LoadingSpinner id='remove' />}
      {messageKey !== null && (
        <p aria-live='polite' data-testid='remove-message'>
          {t(messageKey)}
        </p>
      )}
    </Section>
  )
}

type TextState = 'idle' | 'loading' | 'processing' | 'done'

const textKeys: Record<TextState, string> = {
  idle: 'scenarios.dynamic-loading.text.idle',
  loading: 'scenarios.dynamic-loading.text.loading',
  processing: 'scenarios.dynamic-loading.text.processing',
  done: 'scenarios.dynamic-loading.text.done',
}

// Text that says "Loading..." and then something else that is still not the
// answer, so waiting only for "Loading..." to go away is not enough
const ChangingText = (): JSX.Element => {
  const { t } = useTranslation()
  const delay = useDelay()
  const [state, setState] = useState<TextState>('idle')

  const load = (): void => {
    setState('loading')
    const total = randomDelay()
    delay(
      () => {
        setState('processing')
      },
      Math.floor(total / 2),
    )
    delay(() => {
      setState('done')
    }, total)
  }

  const busy = state === 'loading' || state === 'processing'

  return (
    <Section title={t('scenarios.dynamic-loading.text.title')}>
      <Button onClick={load} disabled={busy} data-testid='text-start'>
        {t('scenarios.dynamic-loading.text.load')}
      </Button>
      <p aria-live='polite' aria-busy={busy} data-testid='text-status'>
        {t(textKeys[state])}
      </p>
    </Section>
  )
}

const DynamicLoading = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.dynamic-loading.title')}
        description={t('scenarios.dynamic-loading.description')}
        information={translateInformation(
          t,
          'scenarios.dynamic-loading.information',
          {
            min: MIN_DELAY / 1000,
            max: MAX_DELAY / 1000,
          },
        )}
      >
        <div className='grid gap-10 md:grid-cols-2'>
          <RenderedAfterLoading />
          <HiddenUntilLoaded />
          <EnabledAfterDelay />
          <RemovedAndAdded />
          <ChangingText />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(DynamicLoading, {
  slug: 'dynamic-loading',
  difficulty: 'medium',
})
