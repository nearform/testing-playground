import { Input, Slider } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const MIN = 1
const MAX = 100

// Quantum's value readout can't take a test id, so the container gives tests
// a stable element to search inside for it
const BasicSlider: React.FC = () => {
  const { t } = useTranslation()
  const [basicValue, setBasicValue] = useState<number>(MIN)

  return (
    <div data-testid='basic-slider-container'>
      <Slider
        label={t('scenarios.slider-page.basic-slider')}
        value={[basicValue]}
        onValueChange={([value]) => {
          setBasicValue(value)
        }}
        min={MIN}
        max={MAX}
        showValue
        data-testid='basic-slider'
      />
    </div>
  )
}

const RangeSlider: React.FC = () => {
  const { t } = useTranslation()
  const [rangeValue, setRangeValue] = useState<number[]>([MIN, 25])

  return (
    <div data-testid='range-slider-container'>
      <Slider
        label={t('scenarios.slider-page.range-slider')}
        value={rangeValue}
        onValueChange={setRangeValue}
        min={MIN}
        max={MAX}
        minStepsBetweenThumbs={0}
        showValue
        data-testid='range-slider'
      />
    </div>
  )
}

const SliderWithInput: React.FC = () => {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState<number>(MIN)

  const handleInputChange: React.FormEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const newValue = Number(event.currentTarget.value)
    setInputValue((prevValue) => {
      const clampedValue = Math.min(MAX, Math.max(MIN, newValue))
      return isNaN(clampedValue) ? prevValue : clampedValue
    })
  }

  return (
    <div className='flex items-end gap-4'>
      <Slider
        label={t('scenarios.slider-page.slider-with-input')}
        value={[inputValue]}
        onValueChange={([value]) => {
          setInputValue(value)
        }}
        min={MIN}
        max={MAX}
        data-testid='input-slider'
      />
      <div className='w-32 shrink-0'>
        <Input
          labelText={t('scenarios.slider-page.value')}
          variant='primary'
          size='sm'
          type='number'
          value={inputValue}
          onChange={handleInputChange}
          min={MIN}
          max={MAX}
          data-testid='input-slider-text'
        />
      </div>
    </div>
  )
}

const SliderPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.slider-page.title')}
        description={t('scenarios.slider-page.description')}
      >
        <div className='flex flex-col'>
          <BasicSlider />
          <hr className='my-8 border-grey-300 dark:border-grey-700' />
          <RangeSlider />
          <hr className='my-8 border-grey-300 dark:border-grey-700' />
          <SliderWithInput />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default SliderPage
