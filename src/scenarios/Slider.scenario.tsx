import { Input, Slider } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { HIDE_CLEAR_BUTTON } from '../utils/inputClassNames'

const MIN = 1
const MAX = 100

const SliderValue = ({
  testId,
  children,
}: {
  testId: string
  children: React.ReactNode
}): JSX.Element => (
  <span
    className='min-w-[3ch] text-right text-sm font-semibold tabular-nums'
    data-testid={testId}
  >
    {children}
  </span>
)

const BasicSlider: React.FC = () => {
  const { t } = useTranslation()
  const [basicValue, setBasicValue] = useState<number>(MIN)

  return (
    <div className='flex items-end gap-4'>
      <Slider
        label={t('scenarios.slider-page.basic-slider')}
        value={[basicValue]}
        onValueChange={([value]) => {
          setBasicValue(value)
        }}
        min={MIN}
        max={MAX}
        data-testid='basic-slider'
      />
      <SliderValue testId='basic-slider-value'>{basicValue}</SliderValue>
    </div>
  )
}

const RangeSlider: React.FC = () => {
  const { t } = useTranslation()
  const [rangeValue, setRangeValue] = useState<number[]>([MIN, 25])

  return (
    <div className='flex items-end gap-4'>
      <Slider
        label={t('scenarios.slider-page.range-slider')}
        value={rangeValue}
        onValueChange={setRangeValue}
        min={MIN}
        max={MAX}
        minStepsBetweenThumbs={0}
        data-testid='range-slider'
      />
      <span className='flex shrink-0 gap-1 text-sm'>
        <SliderValue testId='range-slider-min'>{rangeValue[0]}</SliderValue>
        <span aria-hidden='true'>–</span>
        <SliderValue testId='range-slider-max'>{rangeValue[1]}</SliderValue>
      </span>
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
          // The value is always set, so there is never anything to clear
          onClear={() => {
            setInputValue(MIN)
          }}
          formClassName={HIDE_CLEAR_BUTTON}
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
          <hr className='my-8 border-grey-300' />
          <RangeSlider />
          <hr className='my-8 border-grey-300' />
          <SliderWithInput />
        </div>
      </PageSetup>
    </Layout>
  )
}

export default SliderPage
