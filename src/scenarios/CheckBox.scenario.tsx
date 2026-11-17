import {
  BsBookmark,
  BsBookmarkFill,
  BsHeart,
  BsHeartFill,
  Checkbox,
  ControlLabel,
  IconButton,
} from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

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
            <p className='text-sm'>{t('scenarios.check-box.scenario-form')}:</p>
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
              <p
                id='required-checkbox-message'
                className='text-xs font-medium text-feedback-error dark:text-feedback-error-dark'
                data-testid='required-message'
              >
                {t('scenarios.check-box.required-message')}
              </p>
            )}
          </div>
          <div className='flex flex-col gap-3'>
            <p className='text-sm'>
              {t('scenarios.check-box.scenario-icons')}:
            </p>
            <div className='flex gap-2'>
              <IconCheckbox
                testId='favorite'
                label='Favorite'
                icon={<BsHeart />}
                checkedIcon={<BsHeartFill />}
              />
              <IconCheckbox
                testId='bookmark'
                label='Bookmark'
                icon={<BsBookmark />}
                checkedIcon={<BsBookmarkFill />}
              />
            </div>
          </div>
        </div>

        <hr className='my-8 border-grey-300 dark:border-grey-700' />
        <p className='mb-3 text-sm'>
          {t('scenarios.check-box.scenario-tree')}:
        </p>
        <div className='flex flex-col gap-3'>
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
      </PageSetup>
    </Layout>
  )
}

export default CheckBox
