import { Button, Snackbar, Alert, Grid, AlertTitle } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

type NotificationType = { message: string; severity: string } | null

type NotificationSeverity = 'success' | 'info' | 'warning' | 'error'

const notificationTypes = [
  { key: 'success', label: 'scenarios.notification.type.success' },
  { key: 'info', label: 'scenarios.notification.type.info' },
  { key: 'warning', label: 'scenarios.notification.type.warning' },
  { key: 'error', label: 'scenarios.notification.type.error' },
]

const Notification = (): JSX.Element => {
  const { t } = useTranslation()
  const [notification, setNotification] = useState<NotificationType>(null)
  const [alert, setAlert] = useState<NotificationType>(null)
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false)

  const generateNotification = (severity: NotificationSeverity): void => {
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
    }, 6000)
  }

  const handleClose = (): void => {
    setNotification(null)
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.notification.title')}
        description={t('scenarios.notification.description')}
        information={t('scenarios.notification.information')}
      >
        <Grid container spacing={2}>
          {notificationTypes.map(({ key, label }) => (
            <Grid item xs={3} key={key}>
              <Button
                variant='contained'
                color={key as NotificationSeverity}
                fullWidth
                onClick={() => {
                  generateNotification(key as NotificationSeverity)
                }}
                data-testid={`button-${key}`}
                disabled={isAlertVisible}
              >
                {t(label)}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Snackbar
          open={!(notification == null)}
          autoHideDuration={6000}
          onClose={handleClose}
          data-testid={`notification-${notification?.severity}`}
          ClickAwayListenerProps={{ onClickAway: () => null }}
        >
          <Alert
            onClose={handleClose}
            severity={notification?.severity as NotificationSeverity}
            sx={{ width: '100%' }}
          >
            {notification?.message}
          </Alert>
        </Snackbar>

        {alert != null && (
          <Alert
            severity={alert.severity as NotificationSeverity}
            sx={{ mt: 4 }}
            data-testid={`message-${alert.severity}`}
          >
            <AlertTitle>{alert.severity.toLocaleUpperCase()}</AlertTitle>
            {alert.message}
          </Alert>
        )}
      </PageSetup>
    </Layout>
  )
}

export default Notification
