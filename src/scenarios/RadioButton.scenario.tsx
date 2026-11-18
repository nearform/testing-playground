import { Radio, RadioGroup } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'radio-button'

const RadioButton = (): JSX.Element => {
  const { t } = useTranslation()
  const [firstRadioValue, setFirstRadioValue] = useState('')

  const handleFirstRadioChange = (value: string): void => {
    setFirstRadioValue(value)
  }

  const secondRadioOptions = {
    [t(`scenarios.${SLUG}.first.first`)]: [
      t(`scenarios.${SLUG}.second.first`),
      t(`scenarios.${SLUG}.second.second`),
    ],
    [t(`scenarios.${SLUG}.first.second`)]: [
      t(`scenarios.${SLUG}.second.first`),
      t(`scenarios.${SLUG}.second.third`),
    ],
    [t(`scenarios.${SLUG}.first.third`)]: [
      t(`scenarios.${SLUG}.second.second`),
      t(`scenarios.${SLUG}.second.third`),
    ],
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
          {secondRadioOptions[firstRadioValue].map((label, index) => (
            <Radio
              key={index}
              value={label.toLowerCase()}
              label={label}
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
            {['first', 'second', 'third', 'fourth'].map((value, index) => (
              <Radio
                key={value}
                value={t(`scenarios.${SLUG}.first.${value}`)}
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

export default defineScenario(RadioButton, {
  slug: SLUG,
  difficulty: 'easy',
})
