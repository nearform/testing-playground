import { Radio, RadioGroup } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// The values are fixed ids (the colours' English names), not their
// translated names, so a choice stays picked when the language changes; only
// the labels are translated
const PRIMARY_COLOURS = ['red', 'blue', 'yellow', 'white'] as const
const secondRadioOptions: Record<string, string[]> = {
  red: ['purple', 'orange'],
  blue: ['purple', 'green'],
  yellow: ['orange', 'green'],
}

const RadioButton = (): React.JSX.Element => {
  const { t } = useTranslation()
  const [firstRadioValue, setFirstRadioValue] = useState('')

  const handleFirstRadioChange = (value: string): void => {
    setFirstRadioValue(value)
  }

  const renderSecondRadioButtons = (): React.ReactNode => {
    if (firstRadioValue in secondRadioOptions) {
      return (
        <RadioGroup
          // A new group for each primary colour, so a secondary colour picked
          // for an earlier one is not still selected
          key={firstRadioValue}
          legend={`${t(`scenarios.${SLUG}.second-set`)}:`}
          defaultValue=''
          data-testid='radio-button-group-2'
        >
          {secondRadioOptions[firstRadioValue].map((value, index) => (
            <Radio
              key={value}
              value={value}
              label={t(`scenarios.${SLUG}.second.${value}`)}
              data-testid={`radio-button-group-2-${index + 1}`}
            />
          ))}
        </RadioGroup>
      )
    }
    return null
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex flex-wrap gap-12'>
          <RadioGroup
            legend={`${t(`scenarios.${SLUG}.first-set`)}:`}
            value={firstRadioValue}
            onValueChange={handleFirstRadioChange}
            data-testid='radio-button-group-1'
          >
            {PRIMARY_COLOURS.map((value, index) => (
              <Radio
                key={value}
                value={value}
                label={t(`scenarios.${SLUG}.first.${value}`)}
                data-testid={`radio-button-group-1-${index + 1}`}
                // Disable the last radio button
                disabled={index === 3}
              />
            ))}
          </RadioGroup>
          {renderSecondRadioButtons()}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default RadioButton
