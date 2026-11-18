import { fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import Notification from './Notification.scenario'

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

  it('displays and hides the alert after a delay', async () => {
    TestRenderer(<Notification />)
    fireEvent.click(screen.getByTestId('button-error'))
    await waitFor(() => {
      expect(screen.getByTestId('notification-error')).toBeInTheDocument()
    })
    await waitFor(
      () => {
        expect(screen.queryByTestId('notification-error')).toBeNull()
      },
      { timeout: 6000 }, // Notification displays for 6 seconds
    )
  }, 10000)
})

describe('Notification when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  it('shows the popup and the alert in the new language', async () => {
    TestRenderer(<Notification />)
    fireEvent.click(screen.getByTestId('button-success'))
    expect(screen.getByTestId('message-success')).toHaveTextContent('SUCCESS')

    await switchLanguage('fr')

    const alert = screen.getByTestId('message-success')
    expect(alert).toHaveTextContent('SUCCÈS')
    expect(alert).toHaveTextContent(
      "Il s'agit d'un message de notification réussi",
    )
    expect(screen.getByTestId('notification-success')).toHaveTextContent(
      "Il s'agit d'un message de notification réussi",
    )
  })
})
