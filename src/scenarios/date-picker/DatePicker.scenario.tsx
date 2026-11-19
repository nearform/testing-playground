import { Button, CardTitle, Input } from '@nearform/quantum'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import type { DateRange } from '../../utils/dates'
import {
  addDays,
  addMonths,
  calendarWeeks,
  clampDate,
  compareDays,
  dateLocale,
  formatDisplayDate,
  isInRange,
  isSameDay,
  isWeekend,
  nextRange,
  parseDisplayDate,
  startOfDay,
  startOfMonth,
  toIsoDate,
} from '../../utils/dates'
import { SLUG } from './meta'

// How many years after this one appointments and trips can be booked into
export const BOOKING_YEARS = 2
// The earliest year a date of birth can be in
export const MIN_BIRTH_YEAR = 1900

// Shown in place of an ISO value while nothing is chosen
export const NO_VALUE = '—'

const sectionClasses = 'flex flex-col gap-4'
const triggerClasses = [
  'flex min-w-56 items-center justify-between gap-4 rounded-md border-2 px-3 py-2 text-left',
  'border-border dark:border-border-dark',
].join(' ')

const capitalise = (text: string, locale: string): string =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)

// The month and weekday names and the full-date format of a language, worked
// out once per language rather than on every render of the calendar
const calendarNames = (
  intl: string,
  weekStart: number,
): {
  monthNames: string[]
  weekdays: Array<{ short: string; long: string }>
  fullDate: Intl.DateTimeFormat
} => {
  const month = new Intl.DateTimeFormat(intl, { month: 'long' })
  const shortDay = new Intl.DateTimeFormat(intl, { weekday: 'short' })
  const longDay = new Intl.DateTimeFormat(intl, { weekday: 'long' })
  return {
    monthNames: Array.from({ length: 12 }, (_, index) =>
      capitalise(month.format(new Date(2000, index, 1)), intl),
    ),
    // 1 January 2023 was a Sunday
    weekdays: Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2023, 0, 1 + ((weekStart + index) % 7))
      return { short: shortDay.format(date), long: longDay.format(date) }
    }),
    fullDate: new Intl.DateTimeFormat(intl, { dateStyle: 'full' }),
  }
}

const CalendarIcon = (): JSX.Element => (
  <svg
    aria-hidden='true'
    viewBox='0 0 16 16'
    width='16'
    height='16'
    fill='currentColor'
  >
    <path d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z' />
  </svg>
)

// Just under the anchor, in page coordinates rather than fixed to the
// viewport, so a popup that opens below the fold can be scrolled to like the
// rest of the page
const positionBelow = (
  anchor: RefObject<HTMLElement | null>,
): { top: number; left: number } => {
  const rect = anchor.current?.getBoundingClientRect()
  if (rect === undefined) return { top: 0, left: 0 }
  return {
    top: rect.bottom + window.scrollY + 4,
    left: rect.left + window.scrollX,
  }
}

interface CalendarPopupProps {
  id: string
  label: string
  // The element the popup is placed under; pressing it does not count as
  // pressing outside the popup
  anchor: RefObject<HTMLElement | null>
  // The day that has focus when the popup opens
  initialFocus: Date
  // Marked as today in the grid; the page's own, so it agrees with min and max
  today: Date
  // The first and last days the calendar can show
  min: Date
  max: Date
  isDisabled: (date: Date) => boolean
  isSelected: (date: Date) => boolean
  isInRange?: (date: Date) => boolean
  onSelect: (date: Date) => void
  // returnFocus is false when the popup closed because something else was
  // pressed, which keeps the focus it was given
  onClose: (returnFocus: boolean) => void
  footer?: ReactNode
}

// A month grid in a popup rendered at the end of <body>, away from the field
// it belongs to. Only mounted while open
const CalendarPopup = ({
  id,
  label,
  anchor,
  initialFocus,
  today,
  min,
  max,
  isDisabled,
  isSelected,
  isInRange: inRange,
  onSelect,
  onClose,
  footer,
}: CalendarPopupProps): JSX.Element => {
  const { t, i18n } = useTranslation()
  const locale = dateLocale(i18n.language)

  // The focused day also decides which month is shown
  const [focused, setFocused] = useState(() =>
    clampDate(initialFocus, min, max),
  )
  // Set when focus should follow the focused day: on opening and keyboard
  // moves, not when the month is changed with the buttons or lists
  const focusDay = useRef(true)
  const popupRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLTableElement>(null)
  // Worked out before the first render, not after it: the day is focused as
  // soon as the popup mounts, and focusing it at the top-left of the page
  // would scroll a user who opened it further down back up to the top
  const [position, setPosition] = useState(() => positionBelow(anchor))

  // Kept current so the document listener below never calls a stale one
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!focusDay.current) return
    focusDay.current = false
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${toIsoDate(focused)}"]`)
      ?.focus()
  }, [focused])

  // Placed in page coordinates rather than fixed to the viewport, so a popup
  // that opens below the fold can be scrolled to like the rest of the page
  useLayoutEffect(() => {
    const update = (): void => {
      setPosition(positionBelow(anchor))
    }
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
    }
  }, [anchor])

  useEffect(() => {
    const closeIfOutside = (event: MouseEvent): void => {
      const target = event.target as Node
      if (
        popupRef.current?.contains(target) === true ||
        anchor.current?.contains(target) === true
      ) {
        return
      }
      onCloseRef.current(false)
    }
    document.addEventListener('mousedown', closeIfOutside)
    return () => {
      document.removeEventListener('mousedown', closeIfOutside)
    }
  }, [anchor])

  const { monthNames, weekdays, fullDate } = useMemo(
    () => calendarNames(locale.intl, locale.weekStart),
    [locale.intl, locale.weekStart],
  )

  const shown = startOfMonth(focused)
  const canGoBack = compareDays(shown, startOfMonth(min)) > 0
  const canGoForward = compareDays(shown, startOfMonth(max)) < 0
  const years = Array.from(
    { length: max.getFullYear() - min.getFullYear() + 1 },
    (_, index) => min.getFullYear() + index,
  )
  const monthOutOfBounds = (month: number): boolean => {
    const first = new Date(focused.getFullYear(), month, 1)
    return (
      compareDays(first, startOfMonth(min)) < 0 ||
      compareDays(first, startOfMonth(max)) > 0
    )
  }

  const unavailable = (date: Date): boolean =>
    compareDays(date, min) < 0 || compareDays(date, max) > 0 || isDisabled(date)

  const moveFocus = (date: Date): void => {
    focusDay.current = true
    setFocused(clampDate(date, min, max))
  }

  // Shows another month, keeping the same day of the month where it can
  const showMonth = (year: number, month: number): void => {
    const months =
      (year - focused.getFullYear()) * 12 + (month - focused.getMonth())
    setFocused(clampDate(addMonths(focused, months), min, max))
  }

  const handleGridKeyDown = (event: KeyboardEvent<HTMLTableElement>): void => {
    // Days into the week the focused day is
    const intoWeek = (focused.getDay() - locale.weekStart + 7) % 7
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
      Home: () => addDays(focused, -intoWeek),
      End: () => addDays(focused, 6 - intoWeek),
    }
    const move = moves[event.key]
    if (move === undefined) return
    event.preventDefault()
    moveFocus(move())
  }

  const navButtonClasses =
    'rounded-md px-2 py-1 text-lg leading-none hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-background-alt-dark'
  const selectClasses =
    'rounded-md border border-border bg-background px-2 py-1 dark:border-border-dark dark:bg-background-dark'

  return createPortal(
    <div
      ref={popupRef}
      id={`${id}-calendar`}
      role='dialog'
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        onClose(true)
      }}
      style={{ top: position.top, left: position.left }}
      className='absolute z-50 flex flex-col gap-3 rounded-lg border-2 border-border bg-background p-3 shadow-lg dark:border-border-dark dark:bg-background-dark'
      data-testid={`${id}-calendar`}
    >
      <div className='flex items-center justify-between gap-2'>
        <button
          type='button'
          aria-label={t(`scenarios.${SLUG}.calendar.previous-month`)}
          disabled={!canGoBack}
          onClick={() =>
            showMonth(focused.getFullYear(), focused.getMonth() - 1)
          }
          className={navButtonClasses}
          data-testid={`${id}-previous-month`}
        >
          ‹
        </button>
        <select
          aria-label={t(`scenarios.${SLUG}.calendar.month`)}
          value={focused.getMonth()}
          onChange={(event) =>
            showMonth(focused.getFullYear(), Number(event.target.value))
          }
          className={selectClasses}
          data-testid={`${id}-month`}
        >
          {monthNames.map((name, month) => (
            <option key={name} value={month} disabled={monthOutOfBounds(month)}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label={t(`scenarios.${SLUG}.calendar.year`)}
          value={focused.getFullYear()}
          onChange={(event) =>
            showMonth(Number(event.target.value), focused.getMonth())
          }
          className={selectClasses}
          data-testid={`${id}-year`}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button
          type='button'
          aria-label={t(`scenarios.${SLUG}.calendar.next-month`)}
          disabled={!canGoForward}
          onClick={() =>
            showMonth(focused.getFullYear(), focused.getMonth() + 1)
          }
          className={navButtonClasses}
          data-testid={`${id}-next-month`}
        >
          ›
        </button>
      </div>
      <table
        ref={gridRef}
        role='grid'
        aria-label={`${monthNames[shown.getMonth()]} ${shown.getFullYear()}`}
        onKeyDown={handleGridKeyDown}
        className='border-separate border-spacing-1 text-center'
        data-testid={`${id}-grid`}
      >
        <thead>
          <tr>
            {weekdays.map((weekday) => (
              <th
                key={weekday.long}
                scope='col'
                abbr={weekday.long}
                className='text-xs font-semibold text-foreground-muted dark:text-foreground-muted-dark'
              >
                {weekday.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks(shown, locale.weekStart).map((week) => (
            <tr key={week.find((day) => day !== null)?.getDate()}>
              {week.map((day, index) => {
                if (day === null) return <td key={`blank-${index}`} />
                const disabled = unavailable(day)
                const selected = isSelected(day)
                const between = !selected && inRange?.(day) === true
                const isToday = isSameDay(day, today)
                return (
                  <td
                    key={day.getDate()}
                    role='gridcell'
                    aria-selected={selected}
                  >
                    <button
                      type='button'
                      tabIndex={isSameDay(day, focused) ? 0 : -1}
                      aria-label={fullDate.format(day)}
                      aria-disabled={disabled || undefined}
                      aria-current={isToday ? 'date' : undefined}
                      onClick={() => {
                        if (!disabled) onSelect(day)
                      }}
                      className={[
                        'h-9 w-9 rounded-full text-sm focus:outline-2 focus:outline-offset-1 focus:outline-foreground dark:focus:outline-foreground-dark',
                        isToday && 'font-bold underline',
                        selected &&
                          'bg-foreground text-foreground-inverse dark:bg-foreground-dark dark:text-foreground-inverse-dark',
                        between &&
                          'bg-background-alt dark:bg-background-alt-dark',
                        disabled &&
                          'cursor-not-allowed text-foreground-subtle line-through dark:text-foreground-subtle-dark',
                        !selected &&
                          !disabled &&
                          'hover:bg-background-alt dark:hover:bg-background-alt-dark',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      data-date={toIsoDate(day)}
                    >
                      {day.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {footer}
    </div>,
    document.body,
  )
}

interface IsoValueProps {
  label: string
  value: Date | null
  testId: string
}

// The chosen date in ISO format, the same in every language
const IsoValue = ({ label, value, testId }: IsoValueProps): JSX.Element => (
  <p className='text-sm'>
    {label}{' '}
    <output className='font-mono' data-testid={testId}>
      {value === null ? NO_VALUE : toIsoDate(value)}
    </output>
  </p>
)

// The first day from `from` onwards that is not a weekend
const nextWeekday = (from: Date): Date => {
  let date = from
  while (isWeekend(date)) date = addDays(date, 1)
  return date
}

const AppointmentPicker = ({ today }: { today: Date }): JSX.Element => {
  const { t, i18n } = useTranslation()
  const { order } = dateLocale(i18n.language)
  const [value, setValue] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = (returnFocus: boolean): void => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  return (
    <section className={sectionClasses}>
      <CardTitle>{t(`scenarios.${SLUG}.appointment.title`)}</CardTitle>
      <p className='text-sm'>
        {t(`scenarios.${SLUG}.appointment.instructions`)}
      </p>
      <span id='appointment-label' className='font-semibold'>
        {t(`scenarios.${SLUG}.appointment.label`)}
      </span>
      <button
        ref={triggerRef}
        type='button'
        aria-labelledby='appointment-label appointment-text'
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? 'appointment-calendar' : undefined}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`w-fit ${triggerClasses}`}
        data-testid='appointment-trigger'
      >
        <span id='appointment-text'>
          {value === null
            ? t(`scenarios.${SLUG}.appointment.placeholder`)
            : formatDisplayDate(value, order)}
        </span>
        <CalendarIcon />
      </button>
      {open && (
        <CalendarPopup
          id='appointment'
          label={t(`scenarios.${SLUG}.appointment.calendar`)}
          anchor={triggerRef}
          initialFocus={value ?? nextWeekday(today)}
          today={today}
          min={today}
          max={new Date(today.getFullYear() + BOOKING_YEARS, 11, 31)}
          isDisabled={isWeekend}
          isSelected={(date) => value !== null && isSameDay(date, value)}
          onSelect={(date) => {
            setValue(date)
            close(true)
          }}
          onClose={close}
        />
      )}
      <IsoValue
        label={t(`scenarios.${SLUG}.iso-value`)}
        value={value}
        testId='appointment-value'
      />
      <Button
        variant='secondary'
        className='w-fit'
        disabled={value === null}
        onClick={() => setValue(null)}
        data-testid='appointment-clear'
      >
        {t(`scenarios.${SLUG}.clear`)}
      </Button>
    </section>
  )
}

const TripPicker = ({ today }: { today: Date }): JSX.Element => {
  const { t, i18n } = useTranslation()
  const { order } = dateLocale(i18n.language)
  const [range, setRange] = useState<DateRange>({ start: null, end: null })
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = (returnFocus: boolean): void => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const triggerText = (): string => {
    if (range.start === null) return t(`scenarios.${SLUG}.trip.placeholder`)
    const start = formatDisplayDate(range.start, order)
    const end = range.end === null ? '…' : formatDisplayDate(range.end, order)
    return `${start} – ${end}`
  }

  return (
    <section className={sectionClasses}>
      <CardTitle>{t(`scenarios.${SLUG}.trip.title`)}</CardTitle>
      <p className='text-sm'>{t(`scenarios.${SLUG}.trip.instructions`)}</p>
      <span id='trip-label' className='font-semibold'>
        {t(`scenarios.${SLUG}.trip.label`)}
      </span>
      <button
        ref={triggerRef}
        type='button'
        aria-labelledby='trip-label trip-text'
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? 'trip-calendar' : undefined}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`w-fit ${triggerClasses}`}
        data-testid='trip-trigger'
      >
        <span id='trip-text'>{triggerText()}</span>
        <CalendarIcon />
      </button>
      {open && (
        <CalendarPopup
          id='trip'
          label={t(`scenarios.${SLUG}.trip.calendar`)}
          anchor={triggerRef}
          initialFocus={range.start ?? today}
          today={today}
          min={today}
          max={new Date(today.getFullYear() + BOOKING_YEARS, 11, 31)}
          isDisabled={() => false}
          isSelected={(date) =>
            (range.start !== null && isSameDay(date, range.start)) ||
            (range.end !== null && isSameDay(date, range.end))
          }
          isInRange={(date) => isInRange(date, range)}
          onSelect={(date) => {
            const next = nextRange(range, date)
            setRange(next)
            // Stays open after the first day so the last can be picked
            if (next.end !== null) close(true)
          }}
          onClose={close}
          footer={
            <p
              role='status'
              className='text-sm'
              data-testid='trip-calendar-status'
            >
              {range.start === null || range.end !== null
                ? t(`scenarios.${SLUG}.trip.pick-start`)
                : t(`scenarios.${SLUG}.trip.pick-end`)}
            </p>
          }
        />
      )}
      <IsoValue
        label={t(`scenarios.${SLUG}.trip.start`)}
        value={range.start}
        testId='trip-start-value'
      />
      <IsoValue
        label={t(`scenarios.${SLUG}.trip.end`)}
        value={range.end}
        testId='trip-end-value'
      />
      <Button
        variant='secondary'
        className='w-fit'
        disabled={range.start === null}
        onClick={() => setRange({ start: null, end: null })}
        data-testid='trip-clear'
      >
        {t(`scenarios.${SLUG}.clear`)}
      </Button>
    </section>
  )
}

type BirthDateError = 'invalid' | 'future' | 'too-early'

const BirthDatePicker = ({ today }: { today: Date }): JSX.Element => {
  const { t, i18n } = useTranslation()
  const { order } = dateLocale(i18n.language)
  const [value, setValue] = useState<Date | null>(null)
  // What is being typed. Otherwise the field shows the chosen date, in the
  // current language's format, so it follows a language switch
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<BirthDateError | null>(null)
  const [open, setOpen] = useState(false)
  const fieldRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const format = t(`scenarios.${SLUG}.birth-date.format`)
  const min = new Date(MIN_BIRTH_YEAR, 0, 1)

  const text = draft ?? (value === null ? '' : formatDisplayDate(value, order))

  const choose = (date: Date): void => {
    setValue(date)
    setDraft(null)
    setError(null)
  }

  // Checks the typed text, on Enter or when the field loses focus
  const commit = (): void => {
    if (text.trim() === '') {
      setValue(null)
      setDraft(null)
      setError(null)
      return
    }
    const parsed = parseDisplayDate(text, order)
    const problem: BirthDateError | null =
      parsed === null
        ? 'invalid'
        : compareDays(parsed, today) > 0
          ? 'future'
          : compareDays(parsed, min) < 0
            ? 'too-early'
            : null
    if (parsed === null || problem !== null) {
      setValue(null)
      setError(problem)
      return
    }
    choose(parsed)
  }

  const close = (returnFocus: boolean): void => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  return (
    <section className={sectionClasses}>
      <CardTitle>{t(`scenarios.${SLUG}.birth-date.title`)}</CardTitle>
      <p className='text-sm'>
        {t(`scenarios.${SLUG}.birth-date.instructions`, { format })}
      </p>
      <div ref={fieldRef} className='flex w-fit items-end gap-2'>
        <Input
          id='birth-date'
          type='text'
          variant='primary'
          labelText={t(`scenarios.${SLUG}.birth-date.label`)}
          placeholder={format}
          clearable={false}
          autoComplete='off'
          inputMode='numeric'
          aria-invalid={error !== null}
          aria-describedby={error === null ? undefined : 'birth-date-error'}
          value={text}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
          }}
          onBlur={commit}
          data-testid='birth-date-input'
        />
        <button
          ref={buttonRef}
          type='button'
          aria-label={t(`scenarios.${SLUG}.birth-date.open-calendar`)}
          aria-haspopup='dialog'
          aria-expanded={open}
          aria-controls={open ? 'birth-date-calendar' : undefined}
          onClick={() => setOpen((isOpen) => !isOpen)}
          className='rounded-md border-2 border-border p-2.5 dark:border-border-dark'
          data-testid='birth-date-trigger'
        >
          <CalendarIcon />
        </button>
      </div>
      {error !== null && (
        <p
          id='birth-date-error'
          role='alert'
          className='text-sm text-feedback-error dark:text-feedback-error-dark'
          data-testid='birth-date-error'
        >
          {t(`scenarios.${SLUG}.birth-date.errors.${error}`, {
            format,
            year: MIN_BIRTH_YEAR,
          })}
        </p>
      )}
      {open && (
        <CalendarPopup
          id='birth-date'
          label={t(`scenarios.${SLUG}.birth-date.calendar`)}
          anchor={fieldRef}
          initialFocus={value ?? today}
          today={today}
          min={min}
          max={today}
          isDisabled={() => false}
          isSelected={(date) => value !== null && isSameDay(date, value)}
          onSelect={(date) => {
            choose(date)
            close(true)
          }}
          onClose={close}
        />
      )}
      <IsoValue
        label={t(`scenarios.${SLUG}.iso-value`)}
        value={value}
        testId='birth-date-value'
      />
    </section>
  )
}

const DatePicker = (): JSX.Element => {
  const { t } = useTranslation()
  // Read from the browser's clock once, when the page opens
  const [today] = useState(() => startOfDay(new Date()))

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`, {
          lastYear: today.getFullYear() + BOOKING_YEARS,
          minYear: MIN_BIRTH_YEAR,
        })}
      >
        <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3'>
          <AppointmentPicker today={today} />
          <TripPicker today={today} />
          <BirthDatePicker today={today} />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default DatePicker
