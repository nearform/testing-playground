import {
  Box,
  Grid,
  Typography,
  TextField,
  TextareaAutosize,
  Button
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

interface InputFieldProps {
  label: string
  type: 'text' | 'password' | 'number' | 'date' | 'textarea'
  value: string
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  readOnly?: boolean
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  readOnly = false
}) => {
  const { t } = useTranslation()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 2 }}>
      <Typography variant='h6' sx={{ mr: 2 }}>
        {label}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant='body1' sx={{ mr: 2 }}>
              {t('scenarios.various-inputs.input')}:
            </Typography>
            {type === 'textarea'
              ? (
              <TextareaAutosize
                value={value}
                onChange={
                  onChange as React.ChangeEventHandler<HTMLTextAreaElement>
                }
                minRows={3}
                style={{ width: '100%' }}
                data-testid='textarea-input'
              />
                )
              : (
              <TextField
                type={type}
                value={value}
                onChange={
                  onChange as React.ChangeEventHandler<HTMLInputElement>
                }
                sx={{ width: '100%' }}
                inputProps={{ 'data-testid': `${type}-input` }}
              />
                )}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant='body1' sx={{ mr: 2 }}>
              {t('scenarios.various-inputs.output')}:
            </Typography>
            <TextField
              value={value}
              InputProps={{ readOnly }}
              fullWidth
              variant='outlined'
              sx={{ width: '100%' }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

const VariousInputs: React.FC = (): JSX.Element => {
  const { t } = useTranslation()
  const [inputValues, setInputValues] = useState({
    text: '',
    password: '',
    number: '',
    date: '',
    textarea: ''
  })

  const handleChange =
    (type: string) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputValues({
          ...inputValues,
          [type]: event.target.value
        })
      }

  const handleClearAll = (): void => {
    setInputValues({
      text: '',
      password: '',
      number: '',
      date: '',
      textarea: ''
    })
  }

  const inputTypes: Array<
  'text' | 'password' | 'number' | 'date' | 'textarea'
  > = ['text', 'password', 'number', 'date', 'textarea']

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.various-inputs.title')}
        description={t('scenarios.various-inputs.description')}
      />
      <Button
        variant='contained'
        color='secondary'
        onClick={handleClearAll}
        sx={{ mt: 2 }}
      >
        {t('scenarios.various-inputs.clear-all')}
      </Button>

      {inputTypes.map((type) => (
        <InputField
          key={type}
          type={type}
          label={t(`scenarios.various-inputs.${type}`)}
          value={inputValues[type]}
          onChange={handleChange(type)}
        />
      ))}
    </Layout>
  )
}

export default VariousInputs
