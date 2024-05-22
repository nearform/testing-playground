import ClearIcon from '@mui/icons-material/Clear'
import {
  Box,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import ScenarioBox from '../components/ScenarioBox'
import * as Scenario from '../scenarios/Index'

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
      rating: parseInt(t(`scenarios.${link}.rating`)),
    }
  })

  // State for search term and selected difficulty
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(
    null,
  )

  // Filtered scenarioData based on search term and selected difficulty
  const filteredScenarioData = scenarioData.filter((data) => {
    const matchesSearchTerm =
      data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDifficulty =
      selectedDifficulty === null || selectedDifficulty === data.rating

    return matchesSearchTerm && matchesDifficulty
  })

  return (
    <Layout>
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <TextField
              label={t('common.search')}
              variant='outlined'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
              }}
              sx={{ minWidth: '220px' }}
              data-testid='search-input'
              InputProps={{
                endAdornment: searchTerm.length > 0 && (
                  <IconButton
                    size='small'
                    onClick={() => {
                      setSearchTerm('')
                    }}
                  >
                    <ClearIcon fontSize='inherit' />
                  </IconButton>
                ),
              }}
            />
            <FormControl>
              <InputLabel id='select-difficulty-label' sx={{ ml: 1 }}>
                {t('common.select-difficulty')}
              </InputLabel>
              <Select
                labelId='select-difficulty-label'
                label='select-difficulty'
                value={selectedDifficulty ?? 0}
                onChange={(e) => {
                  setSelectedDifficulty(
                    e.target.value === 0 ? null : Number(e.target.value),
                  )
                }}
                sx={{ minWidth: '240px', ml: 1 }}
                data-testid='select-difficulty'
              >
                <MenuItem value={0} data-testid='select-difficulty-all'>
                  {t('common.all')}
                </MenuItem>
                <MenuItem value={1} data-testid='select-difficulty-easy'>
                  {t('common.easy')}
                </MenuItem>
                <MenuItem value={2} data-testid='select-difficulty-medium'>
                  {t('common.medium')}
                </MenuItem>
                <MenuItem value={3} data-testid='select-difficulty-hard'>
                  {t('common.hard')}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box
          display='grid'
          gridTemplateColumns='repeat(auto-fill, minmax(200px, 1fr))'
          gap={2}
        >
          {filteredScenarioData.map((data, index) => (
            <ScenarioBox key={index} {...data} />
          ))}
        </Box>
      </Box>
    </Layout>
  )
}
