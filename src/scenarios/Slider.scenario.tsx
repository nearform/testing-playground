import { Box, Divider, Slider, Typography, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const BasicSlider: React.FC = () => {
  const { t } = useTranslation()
  const [basicValue, setBasicValue] = useState<number>(0)

  const handleBasicChange = (_: Event, newValue: number | number[]): void => {
    setBasicValue(newValue as number)
  }

  return (
    <Box>
      <Typography gutterBottom>
        {t('scenarios.slider-page.basic-slider')}
      </Typography>
      <Slider
        value={basicValue}
        onChange={(_, newValue) => {
          handleBasicChange(_, newValue as number)
        }}
        valueLabelDisplay='auto'
        min={1}
        max={100}
        data-testid='basic-slider'
      />
    </Box>
  )
}

const RangeSlider: React.FC = () => {
  const { t } = useTranslation()

  const [rangeValue, setRangeValue] = useState<number[]>([0, 25])
  const handleRangeChange = (_: Event, newValue: number | number[]): void => {
    setRangeValue(newValue as number[])
  }

  return (
    <Box>
      <Typography gutterBottom>
        {t('scenarios.slider-page.range-slider')}
      </Typography>
      <Slider
        value={rangeValue}
        onChange={(_, newValue) => {
          handleRangeChange(_, newValue as number[])
        }}
        valueLabelDisplay='auto'
        min={1}
        max={100}
        disableSwap={true}
        data-testid='range-slider'
      />
    </Box>
  )
}

const SliderWithInput: React.FC = () => {
  const { t } = useTranslation()

  const [inputValue, setInputValue] = useState<number>(0)

  const handleSliderChange = (_: Event, newValue: number | number[]): void => {
    setInputValue(newValue as number)
  }

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const newValue = Number(event.target.value)
    setInputValue((prevValue) => {
      const clampedValue = Math.min(100, Math.max(1, newValue))
      return isNaN(clampedValue) ? prevValue : clampedValue
    })
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Typography gutterBottom>
          {t('scenarios.slider-page.slider-with-input')}
        </Typography>
        <TextField
          label={t('scenarios.slider-page.value')}
          variant='outlined'
          type='number'
          value={inputValue}
          onChange={handleInputChange}
          inputProps={{ min: 1, max: 100 }}
          sx={{ width: '80px', ml: 'auto' }}
          data-testid='input-slider-text'
        />
      </Box>
      <Slider
        value={inputValue}
        onChange={handleSliderChange}
        valueLabelDisplay='auto'
        min={1}
        max={100}
        sx={{ mr: 4 }}
        data-testid='input-slider'
      />
    </>
  )
}

const SliderPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.slider-page.title')}
        description={t('scenarios.slider-page.description')}
      />
      <Box>
        <BasicSlider />
        <Divider sx={{ mt: 4, mb: 4 }} />
        <RangeSlider />
        <Divider sx={{ mt: 4, mb: 4 }} />
        <SliderWithInput />
      </Box>
    </Layout>
  )
}

export default SliderPage
