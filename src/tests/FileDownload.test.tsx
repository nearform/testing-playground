import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from './TestRenderer'
import FileDownload from '../scenarios/FileDownload.scenario'

describe('FileDownload component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it(
    'triggers file download on button click',
    async () => {
      TestRenderer(<FileDownload />)

      const createObjectURLMock = vi.fn(() => 'blob:url')
      const revokeObjectURLMock = vi.fn()
      global.URL.createObjectURL = createObjectURLMock
      global.URL.revokeObjectURL = revokeObjectURLMock

      const linkClickMock = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          const anchor = originalCreateElement(tagName)
          Object.defineProperty(anchor, 'click', {
            value: linkClickMock
          })
          return anchor
        }
        return originalCreateElement(tagName)
      })

      const downloadButton = screen.getByText('Download File')
      await userEvent.click(downloadButton)

      await waitFor(() => {
        expect(createObjectURLMock).toHaveBeenCalled()
        expect(linkClickMock).toHaveBeenCalled()
      })

      vi.restoreAllMocks()
    },
    { timeout: 10000 }
  )
})
