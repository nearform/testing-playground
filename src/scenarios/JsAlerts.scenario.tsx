import { Button } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../components/Alert'
import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

type DialogType = 'alert' | 'confirm' | 'prompt'

interface Result {
  message: string
  severity: AlertSeverity
}

const dialogTypes: DialogType[] = ['alert', 'confirm', 'prompt']

const JsAlerts = (): JSX.Element => {
  const { t } = useTranslation()
  const [result, setResult] = useState<Result | null>(null)

  // Each handler opens one of the browser's native dialogs. They are drawn by
  // the browser, not the page, so they never appear in the DOM; the outcome is
  // written to the page once the dialog is closed.
  const openDialog: Record<DialogType, () => Result> = {
    alert: () => {
      window.alert(t('scenarios.js-alerts.dialog.alert'))
      return {
        message: t('scenarios.js-alerts.result.alert'),
        severity: 'success',
      }
    },
    confirm: () =>
      window.confirm(t('scenarios.js-alerts.dialog.confirm'))
        ? {
            message: t('scenarios.js-alerts.result.confirm-ok'),
            severity: 'success',
          }
        : {
            message: t('scenarios.js-alerts.result.confirm-cancel'),
            severity: 'warning',
          },
    prompt: () => {
      const answer = window.prompt(
        t('scenarios.js-alerts.dialog.prompt'),
        t('scenarios.js-alerts.dialog.prompt-default'),
      )
      if (answer === null) {
        return {
          message: t('scenarios.js-alerts.result.prompt-cancel'),
          severity: 'warning',
        }
      }
      if (answer.trim() === '') {
        return {
          message: t('scenarios.js-alerts.result.prompt-empty'),
          severity: 'info',
        }
      }
      return {
        message: t('scenarios.js-alerts.result.prompt-ok', { answer }),
        severity: 'success',
      }
    },
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.js-alerts.title')}
        description={t('scenarios.js-alerts.description')}
        information={translateInformation(t, 'scenarios.js-alerts.information')}
      >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {dialogTypes.map((type) => (
            <Button
              key={type}
              variant='primary'
              className='w-full'
              onClick={() => {
                setResult(openDialog[type]())
              }}
              data-testid={`button-${type}`}
            >
              {t(`scenarios.js-alerts.button.${type}`)}
            </Button>
          ))}
        </div>

        <div aria-live='polite' className='mt-8'>
          {result != null && (
            <Alert
              severity={result.severity}
              title={t('scenarios.js-alerts.result.title')}
              data-testid='result'
            >
              {result.message}
            </Alert>
          )}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(JsAlerts, { difficulty: 'medium' })
