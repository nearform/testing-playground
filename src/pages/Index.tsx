import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import ScenarioBox from '../components/ScenarioBox'
import { scenarios } from '../scenarios/list'
import { type DifficultyFilter, matchesDifficulty } from '../utils/difficulty'
import {
  Input,
  Link,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nearform/quantum'

const REPOSITORY_URL = 'https://github.com/nearform/testing-playground'

// The muted text of the scenario pages, stopped at about 75 characters a line
const proseClass =
  'max-w-[75ch] text-sm text-foreground-muted dark:text-foreground-muted-dark'

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

  return (
    <Layout>
      {/* What the site is for, so a first visit makes sense without anyone
          to ask. Left aligned with the cards, and kept to a readable width. */}
      <section
        aria-labelledby='site-intro-title'
        className='flex flex-col gap-3 px-4 pt-6 md:px-8'
        data-testid='site-intro'
      >
        <h2
          id='site-intro-title'
          className='max-w-[40ch] text-xl font-semibold text-balance'
        >
          {t('home.title')}
        </h2>
        <p className={proseClass}>{t('home.intro')}</p>
        <ol
          aria-label={t('home.steps-label')}
          className={`${proseClass} flex list-decimal flex-col gap-1 pl-5`}
        >
          <li>{t('home.steps.choose')}</li>
          <li>{t('home.steps.read')}</li>
          <li>{t('home.steps.test')}</li>
        </ol>
        <p className={proseClass}>
          {t('home.source')}{' '}
          <Link variant='inline' href={REPOSITORY_URL}>
            {t('home.source-link')}
          </Link>
        </p>
      </section>
      <div className='flex flex-wrap justify-center gap-2 p-4'>
        <div className='w-60'>
          <Input
            placeholder={t('common.search')}
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
        <div className='w-60'>
          <Select
            onValueChange={(value) => {
              setSelectedDifficulty(
                value === '' ? null : (value as DifficultyFilter),
              )
            }}
            data-testid='select-difficulty'
          >
            <SelectTrigger size='lg'>
              <SelectValue placeholder={t('common.select-difficulty')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all' data-testid='select-difficulty-all'>
                {t('common.all')}
              </SelectItem>
              <SelectItem value='easy' data-testid='select-difficulty-easy'>
                {t('common.easy')}
              </SelectItem>
              <SelectItem value='medium' data-testid='select-difficulty-medium'>
                {t('common.medium')}
              </SelectItem>
              <SelectItem value='hard' data-testid='select-difficulty-hard'>
                {t('common.hard')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 md:px-8 lg:grid-cols-4 xl:grid-cols-6'>
        {filteredScenarioData.map((data) => (
          // Keyed by link so filtering never hands one card's element to
          // another scenario
          <ScenarioBox key={data.link} {...data} />
        ))}
      </div>
    </Layout>
  )
}
