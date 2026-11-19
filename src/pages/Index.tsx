import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import ScenarioBox from '../components/ScenarioBox'
import { scenarios } from '../scenarios/list'
import { type DifficultyFilter, matchesDifficulty } from '../utils/difficulty'
import {
  Button,
  Input,
  Label,
  Link,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nearform/quantum'

const REPOSITORY_URL = 'https://github.com/nearform/testing-playground'

// The muted text of the scenario pages, stopped at about 75 characters a line.
// Each use adds its own size.
const proseClass =
  'max-w-[75ch] text-foreground-muted dark:text-foreground-muted-dark'

export default function Index(): JSX.Element {
  const { t, i18n } = useTranslation()

  // Each scenario's card, worked out again only when the language changes,
  // not on every keystroke in the search box
  const scenarioData = useMemo(
    () =>
      scenarios.map(({ slug, difficulty }) => ({
        title: t(`scenarios.${slug}.title`),
        description: t(`scenarios.${slug}.description`),
        link: slug,
        difficulty,
      })),
    // The language is listed as well as t, in case t keeps its identity
    // across a change of language
    [t, i18n.language],
  )

  // State for search term and selected difficulty
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter | null>(null)

  // Filtered scenarioData based on search term and selected difficulty
  const filteredScenarioData = scenarioData.filter((data) => {
    const matchesSearchTerm =
      data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.description.toLowerCase().includes(searchTerm.toLowerCase())

    return (
      matchesSearchTerm &&
      matchesDifficulty(selectedDifficulty, data.difficulty)
    )
  })

  const clearFilters = (): void => {
    setSearchTerm('')
    setSelectedDifficulty(null)
  }

  return (
    <Layout>
      {/* One left edge for the intro, the filters and the cards, in line
          with the logo in the header */}
      <div className='flex flex-col gap-6 px-4 pt-8 pb-12 md:px-8 md:pt-12'>
        {/* What the site is for, so a first visit makes sense without anyone
            to ask. Kept to a readable width. */}
        <section
          aria-labelledby='site-intro-title'
          className='flex flex-col gap-4'
          data-testid='site-intro'
        >
          {/* The one large piece of type on the site: everything else stays
              at Quantum's body sizes */}
          <h2
            id='site-intro-title'
            className='max-w-[24ch] text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl'
          >
            {t('home.title')}
          </h2>
          <p className={`${proseClass} text-base`}>{t('home.intro')}</p>
          <ol
            aria-label={t('home.steps-label')}
            className={`${proseClass} flex list-decimal flex-col gap-1 pl-5 text-sm`}
          >
            <li>{t('home.steps.choose')}</li>
            <li>{t('home.steps.read')}</li>
            <li>{t('home.steps.test')}</li>
          </ol>
          <p className={`${proseClass} text-sm`}>
            {t('home.source')}{' '}
            <Link variant='inline' href={REPOSITORY_URL}>
              {t('home.source-link')}
            </Link>
          </p>
        </section>

        <div className='flex flex-col gap-4'>
          {/* Visible labels rather than placeholders, so both filters keep
              their names once a value is chosen and screen readers announce
              them */}
          <div className='flex flex-wrap items-end gap-x-4 gap-y-3'>
            <div className='flex w-full flex-col gap-2 sm:w-72'>
              <Label htmlFor='scenario-search'>{t('home.search-label')}</Label>
              <Input
                id='scenario-search'
                // Quantum draws its own clear button, so the browser's one
                // for search fields would make two
                className='[&::-webkit-search-cancel-button]:appearance-none'
                placeholder={t('home.search-placeholder')}
                variant='primary'
                onChange={(event) => {
                  const { value } = event.target as HTMLInputElement
                  setSearchTerm(value)
                }}
                type='search'
                value={searchTerm}
                onClear={() => {
                  setSearchTerm('')
                }}
                clearable='auto'
              />
            </div>
            <div className='flex w-full flex-col gap-2 sm:w-56'>
              <Label htmlFor='scenario-difficulty'>
                {t('common.difficulty')}
              </Label>
              {/* Controlled, so clearing the filters shows All again */}
              <Select
                value={selectedDifficulty ?? 'all'}
                onValueChange={(value) => {
                  setSelectedDifficulty(
                    value === '' ? null : (value as DifficultyFilter),
                  )
                }}
                data-testid='select-difficulty'
              >
                <SelectTrigger id='scenario-difficulty' size='lg'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all' data-testid='select-difficulty-all'>
                    {t('common.all')}
                  </SelectItem>
                  <SelectItem value='easy' data-testid='select-difficulty-easy'>
                    {t('common.easy')}
                  </SelectItem>
                  <SelectItem
                    value='medium'
                    data-testid='select-difficulty-medium'
                  >
                    {t('common.medium')}
                  </SelectItem>
                  <SelectItem value='hard' data-testid='select-difficulty-hard'>
                    {t('common.hard')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Announced as the filters change, so someone who cannot see the
                grid knows what the search did */}
            <p
              role='status'
              className='pb-3 text-sm text-foreground-muted sm:ml-auto dark:text-foreground-muted-dark'
              data-testid='scenario-count'
            >
              {t('home.results', {
                count: filteredScenarioData.length,
                total: scenarioData.length,
              })}
            </p>
          </div>

          {filteredScenarioData.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
              {filteredScenarioData.map((data) => (
                // Keyed by link so filtering never hands one card's element
                // to another scenario
                <ScenarioBox key={data.link} {...data} />
              ))}
            </div>
          ) : (
            // An empty grid is a dead end: say why and offer the way out
            <div
              className='flex flex-col items-start gap-4 rounded-lg border-2 border-dashed border-border px-6 py-10 dark:border-border-dark'
              data-testid='no-scenarios'
            >
              <p className='text-base font-semibold'>
                {t('home.no-results-title')}
              </p>
              <p className={`${proseClass} text-sm`}>
                {t('home.no-results-body')}
              </p>
              <Button variant='secondary' onClick={clearFilters}>
                {t('home.clear-filters')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
