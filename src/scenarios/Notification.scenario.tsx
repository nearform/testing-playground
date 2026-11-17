import {
  Button,
  type ButtonProps,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from '@nearform/quantum'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { type AlertSeverity } from '../components/Alert'
import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const NOTIFICATION_DURATION = 6000

type NotificationType = { message: string; severity: AlertSeverity } | null

const notificationTypes: Array<{
  key: AlertSeverity
  label: string
  variant: ButtonProps['variant']
  className?: string
}> = [
  {
    key: 'success',
    label: 'scenarios.notification.type.success',
    variant: 'success',
  },
  {
    key: 'info',
    label: 'scenarios.notification.type.info',
    variant: 'primary',
  },
  {
    key: 'warning',
    label: 'scenarios.notification.type.warning',
    // Quantum has no warning button, so tint the secondary one
    variant: 'secondary',
    className:
      'border-feedback-warning bg-yellow-100 hover:bg-yellow-200 dark:border-feedback-warning-dark',
  },
  {
    key: 'error',
    label: 'scenarios.notification.type.error',
    variant: 'danger',
  },
]

const Notification = (): JSX.Element => {
  const { t } = useTranslation()
  const [notification, setNotification] = useState<NotificationType>(null)
  const [alert, setAlert] = useState<NotificationType>(null)
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false)

  const generateNotification = (severity: AlertSeverity): void => {
    const messages = {
      success: t('scenarios.notification.messages.success'),
      info: t('scenarios.notification.messages.info'),
      warning: t('scenarios.notification.messages.warning'),
      error: t('scenarios.notification.messages.error'),
    }

    setNotification({ message: messages[severity], severity })

    setAlert({ message: messages[severity], severity })
    setIsAlertVisible(true)

    setTimeout(() => {
      setIsAlertVisible(false)
      setAlert(null)
    }, NOTIFICATION_DURATION)
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.notification.title')}
        description={t('scenarios.notification.description')}
        information={t('scenarios.notification.information')}
      >
        <ToastProvider duration={NOTIFICATION_DURATION}>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {notificationTypes.map(({ key, label, variant, className }) => (
              <Button
                key={key}
                variant={variant}
                className={['w-full', className].filter(Boolean).join(' ')}
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
              variant={notification.severity}
              onOpenChange={(open) => {
                if (!open) setNotification(null)
              }}
              data-testid={`notification-${notification.severity}`}
            >
              <ToastDescription className='col-start-2 row-start-1 text-inherit'>
                {notification.message}
              </ToastDescription>
              <ToastClose />
            </Toast>
          )}
          <ToastViewport />
        </ToastProvider>

        {alert != null && (
          <Alert
            severity={alert.severity}
            title={alert.severity.toLocaleUpperCase()}
            className='mt-8'
            data-testid={`message-${alert.severity}`}
          >
            {alert.message}
          </Alert>
        )}
      </PageSetup>
    </Layout>
  )
}

export default Notification
