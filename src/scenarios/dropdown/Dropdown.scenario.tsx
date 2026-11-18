import {
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'dropdown'

interface Option {
  value: string
  disabled?: boolean
}

const fruits: Option[] = [
  { value: 'apple' },
  { value: 'banana' },
  { value: 'cherry' },
  { value: 'durian', disabled: true },
]

const colours: Option[] = [
  { value: 'red' },
  { value: 'green' },
  { value: 'blue' },
  { value: 'yellow' },
  { value: 'purple' },
]

const countries: Option[] = [
  { value: 'brazil' },
  { value: 'france' },
  { value: 'ireland' },
  { value: 'portugal', disabled: true },
  { value: 'united-kingdom' },
]

// Quantum only styles its own (custom) select, so the native ones borrow the
// same look to keep the three dropdowns visually consistent
const nativeSelectClasses = [
  'w-full rounded-lg border-2 border-border bg-grey-100 px-3 py-2 text-sm text-foreground',
  'hover:border-border-hover focus:outline-hidden focus-visible:shadow-brandGreen',
  'dark:border-border-dark dark:bg-background-alt-dark dark:text-foreground-muted-dark',
  'dark:hover:border-border-hover-dark dark:focus-visible:shadow-brandGreen10',
].join(' ')

const Dropdown = (): JSX.Element => {
  const { t } = useTranslation()
  const [fruit, setFruit] = useState('')
  const [selectedColours, setSelectedColours] = useState<string[]>([])
  const [country, setCountry] = useState('')

  const fruitLabel = (value: string): string =>
    t(`scenarios.${SLUG}.fruits.${value}`)
  const colourLabel = (value: string): string =>
    t(`scenarios.${SLUG}.colours.${value}`)
  const countryLabel = (value: string): string =>
    t(`scenarios.${SLUG}.countries.${value}`)

  const none = t(`scenarios.${SLUG}.result.none`)
  const results = [
    {
      id: 'native-select',
      label: t(`scenarios.${SLUG}.native.label`),
      value: fruit === '' ? none : fruitLabel(fruit),
    },
    {
      id: 'native-multi-select',
      label: t(`scenarios.${SLUG}.multi.label`),
      value:
        selectedColours.length === 0
          ? none
          : selectedColours.map(colourLabel).join(', '),
    },
    {
      id: 'custom-select',
      label: t(`scenarios.${SLUG}.custom.label`),
      value: country === '' ? none : countryLabel(country),
    },
  ]

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <section className='flex flex-col gap-2'>
            <CardTitle>{t(`scenarios.${SLUG}.native.title`)}</CardTitle>
            <Label htmlFor='native-select'>
              {t(`scenarios.${SLUG}.native.label`)}
            </Label>
            <select
              id='native-select'
              value={fruit}
              onChange={(e) => {
                setFruit(e.currentTarget.value)
              }}
              className={nativeSelectClasses}
              data-testid='native-select'
            >
              {/* A placeholder that cannot be picked again once a fruit is
                  chosen */}
              <option value='' disabled>
                {t(`scenarios.${SLUG}.native.placeholder`)}
              </option>
              {fruits.map(({ value, disabled }) => (
                <option key={value} value={value} disabled={disabled}>
                  {fruitLabel(value)}
                </option>
              ))}
            </select>
          </section>

          <section className='flex flex-col gap-2'>
            <CardTitle>{t(`scenarios.${SLUG}.multi.title`)}</CardTitle>
            <Label htmlFor='native-multi-select'>
              {t(`scenarios.${SLUG}.multi.label`)}
            </Label>
            <select
              id='native-multi-select'
              multiple
              size={colours.length}
              value={selectedColours}
              onChange={(e) => {
                setSelectedColours(
                  Array.from(e.currentTarget.selectedOptions, (o) => o.value),
                )
              }}
              className={nativeSelectClasses}
              data-testid='native-multi-select'
            >
              {colours.map(({ value }) => (
                <option key={value} value={value}>
                  {colourLabel(value)}
                </option>
              ))}
            </select>
          </section>

          <section className='flex flex-col gap-2'>
            <CardTitle>{t(`scenarios.${SLUG}.custom.title`)}</CardTitle>
            <Label htmlFor='custom-select'>
              {t(`scenarios.${SLUG}.custom.label`)}
            </Label>
            {/* Not a <select>: the options are rendered in a portal at the end
                of <body>, and only while the list is open */}
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id='custom-select' data-testid='custom-select'>
                <SelectValue
                  placeholder={t(`scenarios.${SLUG}.custom.placeholder`)}
                />
              </SelectTrigger>
              <SelectContent data-testid='custom-select-options'>
                {countries.map(({ value, disabled }) => (
                  <SelectItem
                    key={value}
                    value={value}
                    disabled={disabled}
                    data-testid={`custom-select-option-${value}`}
                  >
                    {countryLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
        </div>

        <section className='mt-8 flex flex-col gap-2' aria-live='polite'>
          <CardTitle>{t(`scenarios.${SLUG}.result.title`)}</CardTitle>
          <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'>
            {results.map(({ id, label, value }) => (
              <React.Fragment key={id}>
                <dt className='font-semibold'>{label}</dt>
                <dd data-testid={`${id}-result`}>{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(Dropdown, {
  slug: SLUG,
  difficulty: 'easy',
})
