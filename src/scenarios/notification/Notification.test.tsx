import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  describe('with fake timers', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('displays the toast and the alert until the duration has passed', () => {
      vi.useFakeTimers()
      TestRenderer(<Notification />)

      fireEvent.click(screen.getByTestId('button-error'))
      expect(screen.getByTestId('notification-error')).toBeInTheDocument()
      expect(screen.getByTestId('message-error')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(NOTIFICATION_DURATION - 1)
      })
      expect(screen.getByTestId('notification-error')).toBeInTheDocument()
      expect(screen.getByTestId('message-error')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(screen.queryByTestId('notification-error')).not.toBeInTheDocument()
      expect(screen.queryByTestId('message-error')).not.toBeInTheDocument()
    })
  })
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
