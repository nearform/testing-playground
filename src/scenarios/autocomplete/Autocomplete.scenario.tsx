import { CardTitle, Input, Notice, Spinner } from '@nearform/quantum'
import type { KeyboardEvent, ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// How many characters the city search needs before it asks the server
export const MIN_CITY_CHARACTERS = 2
// How long typing has to pause before the city search asks the server
export const SEARCH_DEBOUNCE = 300
// How long the pretend server takes to answer: short searches are slower, so
// an older answer can arrive after a newer one and has to be ignored
export const SLOW_RESPONSE = 1200
export const FAST_RESPONSE = 400
// The most cities the server sends back for one search
export const MAX_CITY_RESULTS = 5

// Picked to catch naive matching: several countries contain "Guinea" (only
// some start with it), "Niger" is the start of "Nigeria", and some names have
// accents that typing without them should still find
const countries = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  "Côte d'Ivoire",
  'Equatorial Guinea',
  'France',
  'Germany',
  'Guinea',
  'Guinea-Bissau',
  'Iceland',
  'India',
  'Ireland',
  'Netherlands',
  'New Zealand',
  'Niger',
  'Nigeria',
  'Papua New Guinea',
  'Portugal',
  'São Tomé and Príncipe',
  'Spain',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
]

const cities = [
  'Kraków',
  'Lisbon',
  'London',
  'Londonderry',
  'Los Angeles',
  'Lyon',
  'Madrid',
  'Málaga',
  'Manchester',
  'Manila',
  'Marseille',
  'Melbourne',
  'Milan',
  'Montréal',
  'Mumbai',
  'Munich',
  'Paris',
  'Parma',
  'Perth',
  'Porto',
  'Portland',
  'Prague',
  'Reykjavík',
  'São Paulo',
  'Zürich',
]

// Lower case with accents removed, one character at a time so that a match's
// position in the folded text is its position in the original text too
const fold = (text: string): string =>
  Array.from(text)
    .map((char) => {
      const folded = char
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
      return folded.length === 1 ? folded : char
    })
    .join('')

// Every option containing the query, those starting with it first; the
// options are already in alphabetical order and filter/sort keep it
const findMatches = (options: string[], query: string): string[] => {
  const needle = fold(query.trim())
  if (needle === '') return []
  const matching = options.filter((option) => fold(option).includes(needle))
  const startsWith = (option: string): boolean =>
    fold(option).startsWith(needle)
  return [
    ...matching.filter(startsWith),
    ...matching.filter((option) => !startsWith(option)),
  ]
}

// Stands in for a request to a server, answering after a delay
const searchCities = async (query: string): Promise<string[]> =>
  new Promise((resolve) => {
    setTimeout(
      () => {
        resolve(findMatches(cities, query).slice(0, MAX_CITY_RESULTS))
      },
      query.length <= MIN_CITY_CHARACTERS ? SLOW_RESPONSE : FAST_RESPONSE,
    )
  })

// The option's text with the part matching the query wrapped in <mark>
const highlight = (option: string, query: string): ReactNode => {
  const needle = fold(query.trim())
  const start = fold(option).indexOf(needle)
  if (needle === '' || start === -1) return option
  const end = start + needle.length
  return (
    <>
      {option.slice(0, start)}
      <mark className='bg-transparent font-bold text-inherit'>
        {option.slice(start, end)}
      </mark>
      {option.slice(end)}
    </>
  )
}

interface ComboboxProps {
  id: string
  label: string
  placeholder: string
  query: string
  suggestions: string[]
  // Shown in the popup in place of suggestions, e.g. "No matches"
  message?: string
  // Puts a spinner beside the message, while waiting for suggestions
  loading?: boolean
  onQueryChange: (query: string) => void
  onSelect: (option: string) => void
}

// An input with a list of suggestions, following the ARIA combobox pattern
const Combobox = ({
  id,
  label,
  placeholder,
  query,
  suggestions,
  message,
  loading = false,
  onQueryChange,
  onSelect,
}: ComboboxProps): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listId = `${id}-listbox`
  const optionId = (index: number): string => `${id}-option-${index}`

  // Different suggestions mean the highlighted one may be gone. Keyed on the
  // contents, as the array itself is a new one on every render
  const suggestionsKey = suggestions.join('\n')
  useEffect(() => {
    setActiveIndex(-1)
  }, [suggestionsKey])

  const hasSuggestions = suggestions.length > 0
  const expanded = open && hasSuggestions
  const showMessage = open && !hasSuggestions && message !== undefined

  const select = (option: string): void => {
    onSelect(option)
    setOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const last = suggestions.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setOpen(true)
        if (!hasSuggestions) return
        // Opening the list starts at the top; wraps round from the bottom
        setActiveIndex((index) => (!open || index >= last ? 0 : index + 1))
        return
      case 'ArrowUp':
        event.preventDefault()
        setOpen(true)
        if (!hasSuggestions) return
        setActiveIndex((index) => (!open || index <= 0 ? last : index - 1))
        return
      case 'Enter':
        if (expanded && activeIndex >= 0) {
          event.preventDefault()
          select(suggestions[activeIndex])
        }
        return
      case 'Escape':
        // The first Escape closes the list, the next clears the input
        if (expanded || showMessage) {
          setOpen(false)
        } else {
          onQueryChange('')
        }
        setActiveIndex(-1)
        return
    }
  }

  return (
    <div className='relative'>
      <Input
        id={id}
        type='text'
        variant='primary'
        labelText={label}
        placeholder={placeholder}
        clearable={false}
        autoComplete='off'
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={
          expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        value={query}
        onChange={(event) => {
          onQueryChange(event.currentTarget.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onKeyDown={handleKeyDown}
        // Tabbing or clicking away closes the list without choosing anything
        onBlur={() => {
          setOpen(false)
        }}
        data-testid={`${id}-input`}
      />
      <ul
        id={listId}
        role='listbox'
        aria-label={label}
        hidden={!expanded}
        className='absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background shadow-md dark:border-border-dark dark:bg-background-dark'
        data-testid={`${id}-listbox`}
      >
        {expanded &&
          suggestions.map((option, index) => (
            <li
              key={option}
              id={optionId(index)}
              role='option'
              aria-selected={index === activeIndex}
              // Hovering moves the highlight too, so no separate hover style
              className={`cursor-pointer px-3 py-2 ${
                index === activeIndex ? 'bg-grey-200 dark:bg-grey-700' : ''
              }`}
              // Keeps focus in the input, so it does not blur and close the
              // list before the click lands
              onMouseDown={(event) => {
                event.preventDefault()
              }}
              onMouseEnter={() => {
                setActiveIndex(index)
              }}
              onClick={() => {
                select(option)
              }}
            >
              {highlight(option, query)}
            </li>
          ))}
      </ul>
      {showMessage && (
        <p
          role='status'
          className='absolute z-10 mt-1 flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-foreground-muted shadow-md dark:border-border-dark dark:bg-background-dark dark:text-foreground-muted-dark'
          data-testid={`${id}-message`}
        >
          {loading && <Spinner size='sm' />}
          {message}
        </p>
      )}
    </div>
  )
}

const Autocomplete = (): JSX.Element => {
  const { t } = useTranslation()

  const [countryQuery, setCountryQuery] = useState('')
  const [country, setCountry] = useState<string | null>(null)

  const [cityQuery, setCityQuery] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [cityResults, setCityResults] = useState<string[]>([])
  const [cityLoading, setCityLoading] = useState(false)

  const countrySuggestions = findMatches(countries, countryQuery)
  const cityTerm = cityQuery.trim()

  useEffect(() => {
    // Nothing to look up once a city has been chosen, or for too short a term
    if (city !== null || cityTerm.length < MIN_CITY_CHARACTERS) {
      setCityResults([])
      setCityLoading(false)
      return
    }

    // Set when the term changes again, so a late answer for an old term is
    // thrown away instead of replacing the answer for the current one
    let stale = false
    setCityResults([])
    setCityLoading(true)
    const timer = setTimeout(() => {
      void searchCities(cityTerm).then((results) => {
        if (stale) return
        setCityResults(results)
        setCityLoading(false)
      })
    }, SEARCH_DEBOUNCE)

    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [cityTerm, city])

  const cityMessage = (): string | undefined => {
    if (cityTerm === '') return undefined
    if (cityTerm.length < MIN_CITY_CHARACTERS)
      return t(`scenarios.${SLUG}.city.too-short`, {
        count: MIN_CITY_CHARACTERS,
      })
    if (cityLoading) return t(`scenarios.${SLUG}.city.loading`)
    return t(`scenarios.${SLUG}.no-matches`)
  }

  const selection = (value: string | null): string =>
    value ?? t(`scenarios.${SLUG}.nothing-selected`)

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`, {
          min: MIN_CITY_CHARACTERS,
          debounce: SEARCH_DEBOUNCE,
          max: MAX_CITY_RESULTS,
        })}
      >
        <div className='grid gap-10 md:grid-cols-2'>
          <section className='flex flex-col gap-4'>
            <CardTitle>{t(`scenarios.${SLUG}.country.title`)}</CardTitle>
            <Combobox
              id='country'
              label={t(`scenarios.${SLUG}.country.label`)}
              placeholder={t(`scenarios.${SLUG}.country.placeholder`)}
              query={countryQuery}
              suggestions={countrySuggestions}
              message={
                countryQuery.trim() === ''
                  ? undefined
                  : t(`scenarios.${SLUG}.no-matches`)
              }
              onQueryChange={(query) => {
                setCountryQuery(query)
                setCountry(null)
              }}
              onSelect={(option) => {
                setCountryQuery(option)
                setCountry(option)
              }}
            />
            <p aria-live='polite' data-testid='country-selected'>
              {t(`scenarios.${SLUG}.selected`, {
                value: selection(country),
              })}
            </p>
          </section>

          <section className='flex flex-col gap-4'>
            <CardTitle>{t(`scenarios.${SLUG}.city.title`)}</CardTitle>
            <Combobox
              id='city'
              label={t(`scenarios.${SLUG}.city.label`)}
              placeholder={t(`scenarios.${SLUG}.city.placeholder`)}
              query={cityQuery}
              // Once chosen, the city is its own only suggestion (as the
              // country box lists the chosen country), so reopening the list
              // shows it instead of an empty "No matches"
              suggestions={city === null ? cityResults : [city]}
              message={cityMessage()}
              loading={cityLoading && cityTerm.length >= MIN_CITY_CHARACTERS}
              onQueryChange={(query) => {
                setCityQuery(query)
                setCity(null)
              }}
              onSelect={(option) => {
                setCityQuery(option)
                setCity(option)
              }}
            />
            <p aria-live='polite' data-testid='city-selected'>
              {t(`scenarios.${SLUG}.selected`, {
                value: selection(city),
              })}
            </p>
            <Notice variant='warning' data-testid='city-slow-notice'>
              {t(`scenarios.${SLUG}.city.slow-notice`, {
                wait: SEARCH_DEBOUNCE + SLOW_RESPONSE,
              })}
            </Notice>
          </section>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default Autocomplete
