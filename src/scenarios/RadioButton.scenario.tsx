import {
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const RadioButton = (): JSX.Element => {
  const { t } = useTranslation()
  const [firstRadioValue, setFirstRadioValue] = useState('')

  const handleFirstRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFirstRadioValue(event.target.value)
  }

  const secondRadioOptions = {
    [t('scenarios.radio-button.first.first')]: [
      t('scenarios.radio-button.second.first'),
      t('scenarios.radio-button.second.second')
    ],
    [t('scenarios.radio-button.first.second')]: [
      t('scenarios.radio-button.second.first'),
      t('scenarios.radio-button.second.third')
    ],
    [t('scenarios.radio-button.first.third')]: [
      t('scenarios.radio-button.second.second'),
      t('scenarios.radio-button.second.third')
    ]
  }

  const renderSecondRadioButtons = (): React.ReactNode => {
    if (firstRadioValue in secondRadioOptions) {
      return (
        <Grid item>
          <Typography variant='body2'>
            {t('scenarios.radio-button.second-set')}:
          </Typography>
          <RadioGroup
            aria-labelledby='radio-button-group-2-label'
            defaultValue=''
            data-testid='radio-button-group-2'
          >
            {secondRadioOptions[firstRadioValue].map((label, index) => (
              <FormControlLabel
                key={index}
                value={label.toLowerCase()}
                control={
                  <Radio data-testid={`radio-button-group-2-${index + 1}`} />
                }
                label={label}
              />
            ))}
          </RadioGroup>
        </Grid>
      )
    }
    return null
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.radio-button.title')}
        description={t('scenarios.radio-button.description')}
        information={t('scenarios.radio-button.information')}
      />
      <Grid container spacing={2}>
        <Grid item>
          <Typography variant='body2'>
            {t('scenarios.radio-button.first-set')}:
          </Typography>
          <RadioGroup
            aria-labelledby='radio-button-group-1-label'
            defaultValue=''
            value={firstRadioValue}
            onChange={handleFirstRadioChange}
            data-testid='radio-button-group-1'
          >
            {['first', 'second', 'third', 'fourth'].map((value, index) => (
              <FormControlLabel
                key={value}
                value={t(`scenarios.radio-button.first.${value.toLowerCase()}`)}
                control={
                  <Radio data-testid={`radio-button-group-1-${index + 1}`} />
                }
                label={t(`scenarios.radio-button.first.${value.toLowerCase()}`)}
                // Disable the last radio button
                disabled={index === 3}
              />
            ))}
          </RadioGroup>
        </Grid>
        {renderSecondRadioButtons()}
      </Grid>
    </Layout>
  )
}

export default RadioButton
