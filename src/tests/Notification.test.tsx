import { fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './customRender'
import Notification from '../scenarios/Notification.scenario'

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
      { timeout: 6000 } // Notification displays for 6 seconds
    )
  }, 10000)
})
