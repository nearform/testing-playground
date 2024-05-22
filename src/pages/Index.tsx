import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import ScenarioBox from '../components/ScenarioBox'
import * as Scenario from '../scenarios/Index'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nearform/quantum'

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

    const matchesDifficulty =
      selectedDifficulty === null ||
      selectedDifficulty === '0' ||
      selectedDifficulty === data.rating

    return matchesSearchTerm && matchesDifficulty
  })

  return (
    <Layout>
      <div className='flex justify-center'>
        <div className='w-60 mb-4'>
          <Input
            placeholder={t('common.search')}
            variant='primary'
            onChange={(event) => {
              const { value } = event.target as HTMLInputElement
              setSearchTerm(value)
            }}
            type='search'
            onClear={() => {
              setSearchTerm('')
            }}
          />
        </div>
        <div className='w-60 ml-2'>
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
              </SelectItem>
              <SelectItem value='1' data-testid='select-difficulty-easy'>
                {t('common.easy')}
                <div className='mt-1.5 ml-2 w-2 h-2 bg-green-300 rounded-full float-right'></div>
              </SelectItem>
              <SelectItem value='2' data-testid='select-difficulty-medium'>
                {t('common.medium')}
                <div className='mt-1.5 ml-2 w-2 h-2 bg-yellow-300 rounded-full float-right'></div>
              </SelectItem>
              <SelectItem value='3' data-testid='select-difficulty-hard'>
                {t('common.hard')}
                <div className='mt-1.5 ml-2 w-2 h-2 bg-red-300 rounded-full float-right'></div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-2'>
        {filteredScenarioData.map((data, index) => (
          <ScenarioBox key={index} {...data} />
        ))}
      </div>
    </Layout>
  )
}
