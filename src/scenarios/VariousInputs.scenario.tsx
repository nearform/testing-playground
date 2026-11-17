import { BsX, Button, Input, Textarea } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'

interface InputFieldProps {
  label: string
  type: 'text' | 'password' | 'number' | 'date' | 'textarea'
  value: string
  onChange: (value: string) => void
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
}) => {
  const { t } = useTranslation()
  const hasValue = value.length > 0
  const clear = (): void => {
    onChange('')
  }

  const renderField = (isOutput: boolean): JSX.Element =>
    type === 'textarea' ? (
      <Textarea
        variant='primary'
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value)
        }}
        rows={3}
        className='w-full'
        data-testid={isOutput ? undefined : 'textarea-input'}
      />
    ) : (
      <Input
        variant='primary'
        type={isOutput ? 'text' : type}
        value={value}
        readOnly={isOutput}
        onChange={(e) => {
          onChange(e.currentTarget.value)
        }}
        onClear={clear}
        clearable='auto'
        clearLabel={`${t('scenarios.various-inputs.clear-all')}: ${label}`}
        formClassName='w-full'
        // Without a clear button Quantum shows this as decoration, so only
        // pass it while there is something to clear
        rightSideChild={
          !isOutput && hasValue ? (
            <BsX aria-hidden='true' data-testid='clear-icon' />
          ) : undefined
        }
        data-testid={isOutput ? undefined : `${type}-input`}
      />
    )

  return (
    <div className='my-4 flex flex-col'>
      <h2 className='mb-2 text-lg font-semibold'>{label}</h2>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='ml-4 flex items-center gap-4'>
          <span>{t('scenarios.various-inputs.input')}:</span>
          <div className='flex-1'>{renderField(false)}</div>
        </div>
        <div className='ml-4 flex items-center gap-4'>
          <span>{t('scenarios.various-inputs.output')}:</span>
          <div className='flex-1'>{renderField(true)}</div>
        </div>
      </div>
    </div>
  )
}

const VariousInputs: React.FC = (): JSX.Element => {
  const { t } = useTranslation()
  const [inputValues, setInputValues] = useState({
    text: '',
    password: '',
    number: '',
    date: '',
    textarea: '',
  })

  const handleChange = (type: string) => (value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handleClearAll = (): void => {
    setInputValues({
      text: '',
      password: '',
      number: '',
      date: '',
      textarea: '',
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
      >
        <Button variant='secondary' onClick={handleClearAll}>
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
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(VariousInputs, { difficulty: 'easy' })
