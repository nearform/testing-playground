import { Button } from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../components/Alert'
import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'js-alerts'

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
      window.alert(t(`scenarios.${SLUG}.dialog.alert`))
      return {
        message: t(`scenarios.${SLUG}.result.alert`),
        severity: 'success',
      }
    },
    confirm: () =>
      window.confirm(t(`scenarios.${SLUG}.dialog.confirm`))
        ? {
            message: t(`scenarios.${SLUG}.result.confirm-ok`),
            severity: 'success',
          }
        : {
            message: t(`scenarios.${SLUG}.result.confirm-cancel`),
            severity: 'warning',
          },
    prompt: () => {
      const answer = window.prompt(
        t(`scenarios.${SLUG}.dialog.prompt`),
        t(`scenarios.${SLUG}.dialog.prompt-default`),
      )
      if (answer === null) {
        return {
          message: t(`scenarios.${SLUG}.result.prompt-cancel`),
          severity: 'warning',
        }
      }
      if (answer.trim() === '') {
        return {
          message: t(`scenarios.${SLUG}.result.prompt-empty`),
          severity: 'info',
        }
      }
      return {
        message: t(`scenarios.${SLUG}.result.prompt-ok`, { answer }),
        severity: 'success',
      }
    },
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
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
              {t(`scenarios.${SLUG}.button.${type}`)}
            </Button>
          ))}
        </div>

        <div aria-live='polite' className='mt-8'>
          {result != null && (
            <Alert
              severity={result.severity}
              title={t(`scenarios.${SLUG}.result.title`)}
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

export default defineScenario(JsAlerts, {
  slug: SLUG,
  difficulty: 'medium',
})
