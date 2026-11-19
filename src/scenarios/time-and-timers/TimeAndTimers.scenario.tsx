import { Button, CardTitle, Input } from '@nearform/quantum'
import React, {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import ScenarioSection from '../../components/ScenarioSection'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { useDateTimeFormat, useLocale } from '../../utils/locale'
import {
  CLOSING_HOUR,
  OPENING_HOUR,
  dayPeriod,
  elapsedSince,
  formatDuration,
  shopStatus,
} from './time'
import { SLUG } from './meta'

const key = (path: string): string => `scenarios.${SLUG}.${path}`

// How often the page re-reads the clock
export const TICK = 1000
// How long the offer lasts after the page loads
export const OFFER_DURATION = 5 * 60 * 1000
// How long without any activity before the session warning appears, and how
// long the warning stays before the session is signed out. The warning covers
// the whole page, so it comes well after the offer expires: a test can jump
// past the offer's end and still click around the page.
export const IDLE_WARNING = 10 * 60 * 1000
export const LOGOUT_GRACE = 60 * 1000
// How long the search waits after the last key press before it runs
export const DEBOUNCE_DELAY = 500
// How long after a save before another click on Save does anything
export const THROTTLE_INTERVAL = 2000

export const CITIES = [
  'Belfast',
  'Bordeaux',
  'Brasília',
  'Bristol',
  'Lisbon',
  'Liverpool',
  'London',
  'Lyon',
  'Manchester',
  'Marseille',
  'Paris',
  'Porto',
  'Rio de Janeiro',
  'São Paulo',
] as const

// Events that count as the user being active
const ACTIVITY_EVENTS = [
  'pointerdown',
  'mousemove',
  'keydown',
  'wheel',
  'scroll',
] as const

// The current time, re-read every TICK. Everything on the page works out its
// state from this and a start time, rather than counting ticks, so jumping
// the clock forward lands on the right state straight away. One clock serves
// the whole page, so every section ticks together on a single timer.
const NowContext = createContext<number | null>(null)

const ClockProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, TICK)
    return () => {
      clearInterval(timer)
    }
  }, [])
  // Only the sections that read the clock re-render on each tick: the
  // children are the same elements every time
  return <NowContext.Provider value={now}>{children}</NowContext.Provider>
}

const useNow = (): number => {
  const now = useContext(NowContext)
  if (now === null) throw new Error('useNow must be used inside ClockProvider')
  return now
}

// Hours on the shop sign, e.g. 09:00
const HOURS_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
}
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}
const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}
const ABSOLUTE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'medium',
}

const boxClasses =
  'flex flex-col gap-3 rounded-lg border border-border p-4 dark:border-border-dark'

const ClockSection = (): JSX.Element => {
  const { t } = useTranslation()
  const hoursFormat = useDateTimeFormat(HOURS_FORMAT)
  const dateFormat = useDateTimeFormat(DATE_FORMAT)
  const timeFormat = useDateTimeFormat(TIME_FORMAT)
  const date = new Date(useNow())
  const status = shopStatus(date)
  const hours = (hour: number): string =>
    hoursFormat.format(new Date(2000, 0, 1, hour))

  return (
    <ScenarioSection aria-labelledby='clock-title'>
      <CardTitle id='clock-title'>{t(key('clock.title'))}</CardTitle>
      <p className='text-sm'>{t(key('clock.instructions'))}</p>
      <div className={boxClasses}>
        <p className='text-xl font-semibold' data-testid='greeting'>
          {t(key(`clock.greeting.${dayPeriod(date)}`))}
        </p>
        <p>
          {t(key('clock.today'))}{' '}
          <time
            dateTime={date.toISOString()}
            data-testid='current-date'
            className='font-semibold'
          >
            {dateFormat.format(date)}
          </time>
          ,{' '}
          <span data-testid='current-time' className='font-semibold'>
            {timeFormat.format(date)}
          </span>
        </p>
        <p
          className={`rounded-md p-3 font-semibold ${
            status === 'open'
              ? 'bg-brandGreen-100 text-black'
              : 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100'
          }`}
          data-testid='shop-status'
          data-status={status}
        >
          {t(key(`clock.shop.${status}`), {
            opens: hours(OPENING_HOUR),
            closes: hours(CLOSING_HOUR),
          })}
        </p>
      </div>
    </ScenarioSection>
  )
}

const CountdownSection = (): JSX.Element => {
  const { t } = useTranslation()
  const now = useNow()
  const [endsAt, setEndsAt] = useState(() => Date.now() + OFFER_DURATION)
  const [claimed, setClaimed] = useState(false)
  // `now` can be up to a TICK old just after a restart
  const remaining = Math.min(OFFER_DURATION, endsAt - now)
  const expired = remaining <= 0

  let status = t(key('countdown.ends-in'), { time: formatDuration(remaining) })
  if (claimed) status = t(key('countdown.claimed'))
  else if (expired) status = t(key('countdown.expired'))

  return (
    <ScenarioSection aria-labelledby='countdown-title'>
      <CardTitle id='countdown-title'>{t(key('countdown.title'))}</CardTitle>
      <p className='text-sm'>{t(key('countdown.instructions'))}</p>
      <div className={boxClasses}>
        <p className='font-semibold'>{t(key('countdown.offer'))}</p>
        <p
          role='timer'
          aria-live='off'
          className='text-2xl font-semibold tabular-nums'
          data-testid='offer-countdown'
          data-state={claimed ? 'claimed' : expired ? 'expired' : 'running'}
        >
          {status}
        </p>
        <div className='flex flex-wrap gap-3'>
          <Button
            disabled={expired || claimed}
            onClick={() => {
              setClaimed(true)
            }}
          >
            {t(key('countdown.claim'))}
          </Button>
          <Button
            variant='secondary'
            onClick={() => {
              setEndsAt(Date.now() + OFFER_DURATION)
              setClaimed(false)
            }}
          >
            {t(key('countdown.restart'))}
          </Button>
        </div>
      </div>
    </ScenarioSection>
  )
}

const SessionSection = (): JSX.Element => {
  const { t } = useTranslation()
  const now = useNow()
  // The exact time of the last activity. Only the activity handler and the
  // tick read it; the page shows the idle time they work out from it, kept in
  // state, so rendering never reads the ref.
  const [startedAt] = useState(() => Date.now())
  const lastActivity = useRef(startedAt)
  const [idle, setIdle] = useState(0)
  const stayButton = useRef<HTMLButtonElement>(null)

  // On each tick of the page's clock
  useEffect(() => {
    setIdle(Math.max(0, now - lastActivity.current))
  }, [now])

  useEffect(() => {
    // Activity only counts while no warning is due: once the warning is up,
    // only Stay signed in keeps the session, and once signed out only Sign
    // in again starts a new one. This reads the clock itself, so it is right
    // even if the page has not re-rendered since the clock jumped.
    const onActivity = (): void => {
      const at = Date.now()
      if (at - lastActivity.current >= IDLE_WARNING) return
      lastActivity.current = at
      // React skips the render when the idle time is already 0, so moving the
      // pointer re-renders at most once a TICK rather than on every event
      setIdle(0)
    }
    ACTIVITY_EVENTS.forEach((name) => {
      window.addEventListener(name, onActivity, { passive: true })
    })
    return () => {
      ACTIVITY_EVENTS.forEach((name) => {
        window.removeEventListener(name, onActivity)
      })
    }
  }, [])

  const signedOut = idle >= IDLE_WARNING + LOGOUT_GRACE
  const warning = !signedOut && idle >= IDLE_WARNING

  useEffect(() => {
    if (warning) stayButton.current?.focus()
  }, [warning])

  const restart = (): void => {
    lastActivity.current = Date.now()
    setIdle(0)
  }

  return (
    <ScenarioSection aria-labelledby='session-title'>
      <CardTitle id='session-title'>{t(key('session.title'))}</CardTitle>
      <p className='text-sm'>
        {t(key('session.instructions'), {
          warning: formatDuration(IDLE_WARNING),
          grace: formatDuration(LOGOUT_GRACE),
        })}
      </p>
      <div className={boxClasses}>
        <p
          className='font-semibold'
          data-testid='session-status'
          data-state={signedOut ? 'signed-out' : 'signed-in'}
        >
          {signedOut
            ? t(key('session.signed-out'))
            : t(key('session.signed-in'))}
        </p>
        {signedOut ? (
          <Button className='w-fit' onClick={restart}>
            {t(key('session.sign-in'))}
          </Button>
        ) : (
          <p className='tabular-nums' data-testid='idle-time'>
            {t(key('session.idle'), { time: formatDuration(idle) })}
          </p>
        )}
      </div>
      {warning && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
          <div
            role='alertdialog'
            aria-modal='true'
            aria-labelledby='session-warning-title'
            aria-describedby='session-warning-body'
            data-testid='session-warning'
            className='bg-background-surface text-foreground dark:bg-background-surface-dark dark:text-foreground-dark flex w-full max-w-md flex-col gap-4 rounded-lg p-6 shadow-xl'
          >
            <h2 id='session-warning-title' className='text-lg font-semibold'>
              {t(key('session.warning-title'))}
            </h2>
            <p id='session-warning-body' data-testid='session-warning-body'>
              {t(key('session.warning-body'), {
                time: formatDuration(IDLE_WARNING + LOGOUT_GRACE - idle),
              })}
            </p>
            <div className='flex justify-end'>
              <Button ref={stayButton} onClick={restart}>
                {t(key('session.stay'))}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ScenarioSection>
  )
}

interface Update {
  id: number
  at: number
}

const RelativeSection = (): JSX.Element => {
  const { t } = useTranslation()
  const locale = useLocale()
  const now = useNow()
  // The page opening counts as the first update
  const [updates, setUpdates] = useState<Update[]>(() => [
    { id: 0, at: Date.now() },
  ])

  const relativeFormat = useMemo(
    () => new Intl.RelativeTimeFormat(locale, { numeric: 'always' }),
    [locale],
  )
  const absolute = useDateTimeFormat(ABSOLUTE_FORMAT)

  const relative = (at: number): string => {
    const elapsed = elapsedSince(Math.max(0, now - at))
    if (elapsed === null) return t(key('relative.just-now'))
    return relativeFormat.format(-elapsed.value, elapsed.unit)
  }

  return (
    <ScenarioSection aria-labelledby='relative-title'>
      <CardTitle id='relative-title'>{t(key('relative.title'))}</CardTitle>
      <p className='text-sm'>{t(key('relative.instructions'))}</p>
      <div className={boxClasses}>
        <Button
          className='w-fit'
          onClick={() => {
            const at = Date.now()
            setUpdates((current) => [{ id: current.length, at }, ...current])
          }}
        >
          {t(key('relative.post'))}
        </Button>
        <ul className='flex flex-col' aria-label={t(key('relative.list'))}>
          {updates.map((update) => (
            <li
              key={update.id}
              className='flex flex-wrap justify-between gap-2 border-b border-border py-2 dark:border-border-dark'
              data-testid='update'
            >
              <span>
                {update.id === 0
                  ? t(key('relative.opened'))
                  : t(key('relative.posted'), { number: update.id })}
              </span>
              <time
                dateTime={new Date(update.at).toISOString()}
                title={absolute.format(update.at)}
                data-testid='relative-time'
              >
                {relative(update.at)}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </ScenarioSection>
  )
}

const DebounceSection = (): JSX.Element => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  // The query the results were last worked out for
  const [searched, setSearched] = useState('')
  const [searches, setSearches] = useState(0)
  const pending = query !== searched

  useEffect(() => {
    if (query === searched) return
    const timer = setTimeout(() => {
      setSearched(query)
      setSearches((count) => count + 1)
    }, DEBOUNCE_DELAY)
    return () => {
      clearTimeout(timer)
    }
  }, [query, searched])

  const term = searched.trim().toLowerCase()
  const results =
    term === ''
      ? []
      : CITIES.filter((city) => city.toLowerCase().includes(term))

  let message: string | null = null
  if (pending) message = t(key('debounce.searching'))
  else if (term === '') message = t(key('debounce.empty'))
  else if (results.length === 0)
    message = t(key('debounce.no-results'), { query: searched.trim() })

  return (
    <div className={boxClasses}>
      <h3 className='font-semibold'>{t(key('debounce.title'))}</h3>
      <p className='text-sm'>
        {t(key('debounce.instructions'), { delay: DEBOUNCE_DELAY })}
      </p>
      <label htmlFor='city-search' className='text-sm font-semibold'>
        {t(key('debounce.label'))}
      </label>
      <Input
        id='city-search'
        type='search'
        variant='primary'
        value={query}
        onChange={(event) => {
          setQuery((event.target as HTMLInputElement).value)
        }}
      />
      <p className='text-sm' data-testid='search-count'>
        {t(key('debounce.count'), { count: searches })}
      </p>
      <p role='status' className='text-sm' data-testid='search-status'>
        {message}
      </p>
      {!pending && results.length > 0 && (
        <ul aria-label={t(key('debounce.results'))} className='list-disc pl-6'>
          {results.map((city) => (
            <li key={city}>{city}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

const ThrottleSection = (): JSX.Element => {
  const { t } = useTranslation()
  const [saves, setSaves] = useState(0)
  const [ignored, setIgnored] = useState(0)
  // A ref, so clicks in quick succession all see the latest save, and state,
  // so the label re-renders when it changes
  const lastSave = useRef<number | null>(null)
  const [lastSaveAt, setLastSaveAt] = useState<number | null>(null)
  // Re-renders the label as soon as the cooldown ends, rather than on the
  // next tick
  const [, setCooldownEnded] = useState(0)
  const cooldown = useRef<ReturnType<typeof setTimeout>>()
  useNow()
  // Worked out from the clock, like the check in save, so the two agree
  // even when the clock jumps without firing timers. Reading the clock while
  // drawing is deliberate: useNow re-renders this every tick
  const coolingDown =
    lastSaveAt !== null &&
    // oxlint-disable-next-line react/purity
    Date.now() - lastSaveAt < THROTTLE_INTERVAL

  useEffect(
    () => () => {
      clearTimeout(cooldown.current)
    },
    [],
  )

  const save = (): void => {
    const at = Date.now()
    if (
      lastSave.current !== null &&
      at - lastSave.current < THROTTLE_INTERVAL
    ) {
      setIgnored((count) => count + 1)
      return
    }
    lastSave.current = at
    setLastSaveAt(at)
    setSaves((count) => count + 1)
    clearTimeout(cooldown.current)
    cooldown.current = setTimeout(() => {
      setCooldownEnded((count) => count + 1)
    }, THROTTLE_INTERVAL)
  }

  return (
    <div className={boxClasses}>
      <h3 className='font-semibold'>{t(key('throttle.title'))}</h3>
      <p className='text-sm'>
        {t(key('throttle.instructions'), { interval: THROTTLE_INTERVAL })}
      </p>
      <Button className='w-fit' onClick={save}>
        {t(key('throttle.save'))}
      </Button>
      <p
        className='text-sm'
        data-testid='throttle-status'
        data-state={coolingDown ? 'cooling-down' : 'ready'}
      >
        {coolingDown
          ? t(key('throttle.cooling-down'))
          : t(key('throttle.ready'))}
      </p>
      <p className='text-sm' data-testid='save-count'>
        {t(key('throttle.saves'), { count: saves })}
      </p>
      <p className='text-sm' data-testid='ignored-count'>
        {t(key('throttle.ignored'), { count: ignored })}
      </p>
    </div>
  )
}

const TimeAndTimers = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <ClockProvider>
      <Layout>
        <PageSetup
          title={t(key('title'))}
          description={t(key('description'))}
          information={translateInformation(t, key('information'))}
          sections
        >
          <ClockSection />
          <CountdownSection />
          <SessionSection />
          <RelativeSection />
          <ScenarioSection>
            <CardTitle>{t(key('rate.title'))}</CardTitle>
            <div className='grid gap-6 md:grid-cols-2'>
              <DebounceSection />
              <ThrottleSection />
            </div>
          </ScenarioSection>
        </PageSetup>
      </Layout>
    </ClockProvider>
  )
}

export default TimeAndTimers
