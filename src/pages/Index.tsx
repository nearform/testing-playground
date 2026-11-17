import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import ScenarioBox from '../components/ScenarioBox'
import * as Scenario from '../scenarios/Index'
import {
  DIFFICULTY_STYLES,
  type Difficulty,
  matchesDifficulty,
} from '../utils/difficulty'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nearform/quantum'

const DifficultyDot = ({
  difficulty,
}: {
  difficulty: Difficulty
}): JSX.Element => (
  <div
    className={`mt-1.5 ml-2 w-2 h-2 rounded-full float-right ${DIFFICULTY_STYLES[difficulty].dot}`}
  ></div>
)

const transformLink = (link: string): string => {
  return link.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export default function Index(): JSX.Element {
  const { t } = useTranslation()

  // Get all scenario components from the Scenario module
  const scenarioComponents = Object.values(Scenario)

  // Generate scenarioData dynamically
  const scenarioData = scenarioComponents.map((ScenarioComponent) => {
    const scenarioName = ScenarioComponent.name ?? 'UnknownScenario'
    const link = transformLink(scenarioName)
    return {
      title: t(`scenarios.${link}.title`),
      description: t(`scenarios.${link}.description`),
      link,
      rating: t(`scenarios.${link}.rating`),
    }
  })

  // State for search term and selected difficulty
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  )

  // Filtered scenarioData based on search term and selected difficulty
  const filteredScenarioData = scenarioData.filter((data) => {
    const matchesSearchTerm =
      data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.description.toLowerCase().includes(searchTerm.toLowerCase())

    return (
      matchesSearchTerm && matchesDifficulty(selectedDifficulty, data.rating)
    )
  })

  return (
    <Layout>
      <div className='flex flex-wrap justify-center gap-2 bg-background border-t-2 border-grey-200 px-4 py-4 dark:bg-background-surface-dark dark:border-grey-800'>
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
              setSelectedDifficulty(value === '' ? null : value)
            }}
            data-testid='select-difficulty'
          >
            <SelectTrigger size='lg'>
              <SelectValue placeholder={t('common.select-difficulty')} />
            </SelectTrigger>
            <SelectContent side='top' className='overflow-visible'>
              <SelectItem value='0' data-testid='select-difficulty-all'>
                {t('common.all')}
                <DifficultyDot difficulty='hard' />
                <DifficultyDot difficulty='medium' />
                <DifficultyDot difficulty='easy' />
              </SelectItem>
              <SelectItem value='1' data-testid='select-difficulty-easy'>
                {t('common.easy')}
                <DifficultyDot difficulty='easy' />
              </SelectItem>
              <SelectItem value='2' data-testid='select-difficulty-medium'>
                {t('common.medium')}
                <DifficultyDot difficulty='medium' />
              </SelectItem>
              <SelectItem value='3' data-testid='select-difficulty-hard'>
                {t('common.hard')}
                <DifficultyDot difficulty='hard' />
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='grid grid-cols-1 gap-4 px-4 pt-6 sm:grid-cols-2 md:grid-cols-3 md:px-8 lg:grid-cols-4 xl:grid-cols-6'>
        {filteredScenarioData.map((data, index) => (
          <ScenarioBox key={index} {...data} />
        ))}
      </div>
    </Layout>
  )
}
