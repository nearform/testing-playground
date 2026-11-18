import {
  BsBookmark,
  BsBookmarkFill,
  BsHeart,
  BsHeartFill,
  CardTitle,
  Checkbox,
  ControlLabel,
  FieldError,
  IconButton,
} from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'

type CheckedState = boolean | 'indeterminate'

interface IconCheckboxProps {
  testId: string
  label: string
  icon: JSX.Element
  checkedIcon: JSX.Element
}

// A checkbox drawn as an icon: an IconButton that keeps checkbox semantics
const IconCheckbox = ({
  testId,
  label,
  icon,
  checkedIcon,
}: IconCheckboxProps): JSX.Element => {
  const [checked, setChecked] = useState(false)

  return (
    <IconButton
      role='checkbox'
      aria-checked={checked}
      label={label}
      variant='tertiary'
      shape='circle'
      icon={checked ? checkedIcon : icon}
      onClick={() => {
        setChecked((value) => !value)
      }}
      data-testid={testId}
    />
  )
}

const CheckBox = (): JSX.Element => {
  const { t } = useTranslation()
  const [checked, setChecked] = useState([false, false, false])

  const handleRequired = (value: CheckedState): void => {
    setChecked([checked[0], checked[1], value === true])
  }

  const handleParent = (value: CheckedState): void => {
    setChecked([value === true, value === true, checked[2]])
  }

  const handleChild1 = (value: CheckedState): void => {
    setChecked([value === true, checked[1], checked[2]])
  }

  const handleChild2 = (value: CheckedState): void => {
    setChecked([checked[0], value === true, checked[2]])
  }

  const parentChecked: CheckedState =
    checked[0] && checked[1]
      ? true
      : checked[0] !== checked[1]
        ? 'indeterminate'
        : false

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.check-box.title')}
        description={t('scenarios.check-box.description')}
      >
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='flex flex-col gap-3'>
            <CardTitle>{t('scenarios.check-box.scenario-form')}</CardTitle>
            <ControlLabel label={t('scenarios.check-box.checked')}>
              <Checkbox defaultChecked data-testid='checked' />
            </ControlLabel>
            <ControlLabel label={t('scenarios.check-box.disabled')}>
              <Checkbox disabled data-testid='disabled' />
            </ControlLabel>
            <ControlLabel label={`${t('scenarios.check-box.required')} *`}>
              <Checkbox
                required
                checked={checked[2]}
                onCheckedChange={handleRequired}
                aria-invalid={!checked[2]}
                aria-describedby={
                  checked[2] ? undefined : 'required-checkbox-message'
                }
                data-testid='required'
              />
            </ControlLabel>
            {!checked[2] && (
              <FieldError
                id='required-checkbox-message'
                data-testid='required-message'
              >
                {t('scenarios.check-box.required-message')}
              </FieldError>
            )}
          </div>
          <div className='flex flex-col gap-3'>
            <CardTitle>{t('scenarios.check-box.scenario-icons')}</CardTitle>
            <div className='flex gap-2'>
              <IconCheckbox
                testId='favorite'
                label={t('scenarios.check-box.favorite')}
                icon={<BsHeart />}
                checkedIcon={<BsHeartFill />}
              />
              <IconCheckbox
                testId='bookmark'
                label={t('scenarios.check-box.bookmark')}
                icon={<BsBookmark />}
                checkedIcon={<BsBookmarkFill />}
              />
            </div>
          </div>
          <div className='flex flex-col gap-3'>
            <CardTitle>{t('scenarios.check-box.scenario-tree')}</CardTitle>
            <ControlLabel label={t('scenarios.check-box.parent')}>
              <Checkbox
                checked={parentChecked}
                onCheckedChange={handleParent}
                data-testid='parent'
              />
            </ControlLabel>
            <div className='ml-6 flex flex-col gap-3'>
              <ControlLabel label={t('scenarios.check-box.child')}>
                <Checkbox
                  checked={checked[0]}
                  onCheckedChange={handleChild1}
                  data-testid='child'
                />
              </ControlLabel>
              <ControlLabel label={t('scenarios.check-box.child')}>
                <Checkbox
                  checked={checked[1]}
                  onCheckedChange={handleChild2}
                  data-testid='child'
                />
              </ControlLabel>
            </div>
          </div>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(CheckBox, {
  slug: 'check-box',
  difficulty: 'easy',
})
