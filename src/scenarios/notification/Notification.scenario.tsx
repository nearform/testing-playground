import {
  Button,
  type ButtonProps,
  Toast,
  ToastClose,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../../components/Alert'
import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { useLocale } from '../../utils/locale'
import { SLUG } from './meta'

const NOTIFICATION_DURATION = 6000

// Only the type is kept: its message and title are translated as they are
// drawn, so they follow a language switch
type NotificationType = AlertSeverity | null

const notificationTypes: Array<{
  key: AlertSeverity
  label: string
  variant: ButtonProps['variant']
}> = [
  {
    key: 'success',
    label: `scenarios.${SLUG}.type.success`,
    variant: 'success',
  },
  {
    key: 'info',
    label: `scenarios.${SLUG}.type.info`,
    variant: 'primary',
  },
  {
    key: 'warning',
    label: `scenarios.${SLUG}.type.warning`,
    variant: 'warning',
  },
  {
    key: 'error',
    label: `scenarios.${SLUG}.type.error`,
    variant: 'danger',
  },
]

const Notification = (): React.JSX.Element => {
  const { t } = useTranslation()
  // An Intl locale, as not every language code is one (ptBr)
  const locale = useLocale()
  const [notification, setNotification] = useState<NotificationType>(null)
  const [alert, setAlert] = useState<NotificationType>(null)
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false)

  const generateNotification = (severity: AlertSeverity): void => {
    setNotification(severity)
    setAlert(severity)
    setIsAlertVisible(true)

    setTimeout(() => {
      setIsAlertVisible(false)
      setAlert(null)
    }, NOTIFICATION_DURATION)
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <ToastProvider duration={NOTIFICATION_DURATION}>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {notificationTypes.map(({ key, label, variant }) => (
              <Button
                key={key}
                variant={variant}
                className='w-full'
                onClick={() => {
                  generateNotification(key)
                }}
                data-testid={`button-${key}`}
                disabled={isAlertVisible}
              >
                {t(label)}
              </Button>
            ))}
          </div>

          {notification != null && (
            <Toast
              open
              variant={notification}
              onOpenChange={(open) => {
                if (!open) setNotification(null)
              }}
              data-testid={`notification-${notification}`}
            >
              <ToastTitle>
                {t(`scenarios.${SLUG}.messages.${notification}`)}
              </ToastTitle>
              <ToastClose />
            </Toast>
          )}
          <ToastViewport />
        </ToastProvider>

        {alert != null && (
          <Alert
            severity={alert}
            title={t(`scenarios.${SLUG}.type.${alert}`).toLocaleUpperCase(
              locale,
            )}
            className='mt-8'
            data-testid={`message-${alert}`}
          >
            {t(`scenarios.${SLUG}.messages.${alert}`)}
          </Alert>
        )}
      </PageSetup>
    </Layout>
  )
}

export default Notification
