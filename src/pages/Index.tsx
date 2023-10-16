import { Box, Typography, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import ScenarioBox from '../components/ScenarioBox'
import * as Scenario from '../scenarios/Index'

// Helper function to truncate the description to a certain number of characters
function truncateDescription (description: string, limit: number = 80): string {
  if (description.length <= limit) {
    return description
  } else {
    return description.slice(0, limit) + '...'
  }
}

export default function Index (): JSX.Element {
  const { t } = useTranslation()

  // Get all scenario components from the Scenario module
  const scenarioComponents = Object.values(Scenario)

  // Generate scenarioData dynamically
  const scenarioData = scenarioComponents.map((ScenarioComponent, index) => {
    const scenarioName = ScenarioComponent.name ?? 'UnknownScenario'
    const link = scenarioName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    return {
      title: t(`scenarios.${link}.title`),
      description: t(`scenarios.${link}.description`),
      link
    }
  })

  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filtered scenarioData based on search term in title or description
  const filteredScenarioData = scenarioData.filter(
    (data) =>
      data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2
          }}
        >
          <Typography variant='h4' component='h1'>
            {t('common.title')}
          </Typography>
          {/* Search input */}
          <TextField
            label={t('common.search')}
            variant='outlined'
            onChange={(e) => {
              setSearchTerm(e.target.value)
            }}
            sx={{ minWidth: '30%' }}
            data-testid={`${t('common.search')}-input`}
          />
        </Box>

        <Box
          display='grid'
          gridTemplateColumns='repeat(auto-fill, minmax(200px, 1fr))'
          gap={2}
        >
          {filteredScenarioData.map((data, index) => (
            <ScenarioBox
              key={index}
              {...data}
              description={truncateDescription(data.description)}
            />
          ))}
        </Box>
      </Box>
    </Layout>
  )
}
