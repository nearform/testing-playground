import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from './TestRenderer'
import TooltipPage from '../scenarios/Tooltip.scenario'

describe('CheckBox component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders tootip when overing disabled button', async () => {
    TestRenderer(<TooltipPage />)
    await userEvent.hover(screen.getByTestId('delete-button'))
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible()
    })
  })

  it('renders tootip when overing active button', async () => {
    TestRenderer(<TooltipPage />)
    await userEvent.hover(screen.getByTestId('more-info-button'))
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible()
    })
  })

  it('renders tootip when overing truncated text', async () => {
    TestRenderer(<TooltipPage />)
    await userEvent.hover(screen.getByTestId('text'))
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible()
    })
  })
})
