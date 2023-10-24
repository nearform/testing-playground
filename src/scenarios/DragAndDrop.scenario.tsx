import { Paper, Grid, Typography, type Theme } from '@mui/material'
import { type SxProps } from '@mui/system'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const DragAndDrop = (): JSX.Element => {
  const { t } = useTranslation()
  const [dropCount, setDropCount] = useState(0)
  const [grid, setGrid] = useState<string[]>([])

  const handleDragStart = (e: React.DragEvent): void => {
    e.dataTransfer.setData('text/plain', 'smallBox')
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    if (e.dataTransfer.getData('text/plain') === 'smallBox') {
      setDropCount((prevCount) => prevCount + 1)
      setGrid((prevGrid) => [
        ...prevGrid,
        `${t('scenarios.drag-and-drop.box')} ${prevGrid.length + 1}`
      ])
    }
  }

  const commonPaperStyles: SxProps<Theme> = {
    cursor: 'pointer',
    textAlign: 'center',
    lineHeight: '50px'
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.drag-and-drop.title')}
        description={t('scenarios.drag-and-drop.description')}
        information={t('scenarios.drag-and-drop.information')}
      />

      <Grid container justifyContent='center' alignItems='center'>
        {/* Small draggable box on the left */}
        <Paper
          draggable
          onDragStart={handleDragStart}
          sx={{
            ...commonPaperStyles,
            width: '50px',
            height: '50px',
            backgroundColor: 'red',
            margin: '10px'
          }}
          data-testid='draggable-box'
        >
          <Typography variant='body2'>
            {t('scenarios.drag-and-drop.drag-me')}!
          </Typography>
        </Paper>

        {/* Larger drop target grid on the right */}
        <Grid
          container
          item
          xs={6}
          justifyContent='center'
          alignItems='center'
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed #333',
            padding: '10px',
            minHeight: '200px'
          }}
        >
          {/* Render "Drop Here" if the grid is empty */}
          <Paper
            sx={{
              ...commonPaperStyles,
              width: '100%',
              height: '100%',
              backgroundColor: grid.length === 0 ? 'lightgray' : undefined,
              border: grid.length === 0 ? '1px dashed #333' : undefined,
              cursor: grid.length === 0 ? 'pointer' : undefined,
              textAlign: grid.length === 0 ? 'center' : undefined,
              lineHeight: grid.length === 0 ? '200px' : undefined
            }}
            data-testid='drop-target'
          >
            {grid.length === 0 && t('scenarios.drag-and-drop.drop-here')}
          </Paper>

          {/* Render placeholder boxes in the grid */}
          {grid.map((boxId) => (
            <Paper
              key={boxId}
              sx={{
                ...commonPaperStyles,
                width: '50px',
                height: '50px',
                backgroundColor: 'yellow',
                border: '1px solid #333',
                margin: '10px'
              }}
            >
              <Typography variant='body2'>{boxId}</Typography>
            </Paper>
          ))}
        </Grid>
      </Grid>

      <Typography
        align='center'
        sx={{ marginTop: '10px' }}
        data-testid='total-drops'
      >
        {t('scenarios.drag-and-drop.total-drops')}: {dropCount}
      </Typography>
    </Layout>
  )
}

export default DragAndDrop
