import { Radio, RadioGroup } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

const RadioButton = (): JSX.Element => {
  const { t } = useTranslation()
  const [firstRadioValue, setFirstRadioValue] = useState('')

  const handleFirstRadioChange = (value: string): void => {
    setFirstRadioValue(value)
  }

  const secondRadioOptions = {
    [t('scenarios.radio-button.first.first')]: [
      t('scenarios.radio-button.second.first'),
      t('scenarios.radio-button.second.second'),
    ],
    [t('scenarios.radio-button.first.second')]: [
      t('scenarios.radio-button.second.first'),
      t('scenarios.radio-button.second.third'),
    ],
    [t('scenarios.radio-button.first.third')]: [
      t('scenarios.radio-button.second.second'),
      t('scenarios.radio-button.second.third'),
    ],
  }

  const renderSecondRadioButtons = (): React.ReactNode => {
    if (firstRadioValue in secondRadioOptions) {
      return (
        <RadioGroup
          legend={`${t('scenarios.radio-button.second-set')}:`}
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
        title={t('scenarios.radio-button.title')}
        description={t('scenarios.radio-button.description')}
        information={translateInformation(
          t,
          'scenarios.radio-button.information',
        )}
      >
        <div className='flex flex-wrap gap-12'>
          <RadioGroup
            legend={`${t('scenarios.radio-button.first-set')}:`}
            value={firstRadioValue}
            onValueChange={handleFirstRadioChange}
            data-testid='radio-button-group-1'
          >
            {['first', 'second', 'third', 'fourth'].map((value, index) => (
              <Radio
                key={value}
                value={t(`scenarios.radio-button.first.${value}`)}
                label={t(`scenarios.radio-button.first.${value}`)}
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

export default defineScenario(RadioButton, { difficulty: 'easy' })
