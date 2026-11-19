import { fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import Notification, { NOTIFICATION_DURATION } from './Notification.scenario'

describe('Notification component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('generates and displays notifications on button click', async () => {
    TestRenderer(<Notification />)
    fireEvent.click(screen.getByTestId('button-success'))
    await waitFor(() => {
      expect(screen.getByTestId('message-success')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('button-info'))
    await waitFor(() => {
      expect(screen.getByTestId('notification-success')).toBeInTheDocument()
    })
  })

  it(
    'displays and hides the alert after a delay',
    async () => {
      TestRenderer(<Notification />)
      fireEvent.click(screen.getByTestId('button-error'))
      await waitFor(() => {
        expect(screen.getByTestId('notification-error')).toBeInTheDocument()
      })
      await waitFor(
        () => {
          expect(screen.queryByTestId('notification-error')).toBeNull()
        },
        // It shows for NOTIFICATION_DURATION of real time; the margin keeps a
        // busy test run from failing when it closes a moment late
        { timeout: NOTIFICATION_DURATION + 2000 },
      )
    },
    NOTIFICATION_DURATION + 4000,
  )
})

describe('Notification when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  it.each([
    {
      language: 'fr',
      title: 'SUCCÈS',
      text: "Il s'agit d'un message de notification réussi",
    },
    {
      language: 'ptBr',
      title: 'SUCESSO',
      text: 'Esta é uma mensagem de notificação bem-sucedida',
    },
  ])(
    'shows the popup and the alert in $language',
    async ({ language, title, text }) => {
      TestRenderer(<Notification />)
      fireEvent.click(screen.getByTestId('button-success'))
      expect(screen.getByTestId('message-success')).toHaveTextContent('SUCCESS')

      await switchLanguage(language)

      const alert = screen.getByTestId('message-success')
      expect(alert).toHaveTextContent(title)
      expect(alert).toHaveTextContent(text)
      expect(screen.getByTestId('notification-success')).toHaveTextContent(text)
    },
  )
})
