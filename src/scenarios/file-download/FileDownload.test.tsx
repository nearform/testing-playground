import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from '../../tests/TestRenderer'
import FileDownload, { REVOKE_DELAY_MS } from './FileDownload.scenario'

describe('FileDownload component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('triggers file download on button click', async () => {
    TestRenderer(<FileDownload />)

    const createObjectURLMock = vi.fn(() => 'blob:url')
    const revokeObjectURLMock = vi.fn()
    globalThis.URL.createObjectURL = createObjectURLMock
    globalThis.URL.revokeObjectURL = revokeObjectURLMock

    const linkClickMock = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        const anchor = originalCreateElement(tagName)
        Object.defineProperty(anchor, 'click', {
          value: linkClickMock,
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
  }, 10000)
})

describe('FileDownload blob URL', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const download = (): ReturnType<typeof vi.fn> => {
    vi.useFakeTimers()
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:url')
    const revokeObjectURL = vi.fn()
    globalThis.URL.revokeObjectURL = revokeObjectURL
    // jsdom cannot navigate, so stop it trying when the link is clicked
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    TestRenderer(<FileDownload />)

    fireEvent.click(screen.getByText('Download File'))
    return revokeObjectURL
  }

  it('is kept while the browser starts the download', () => {
    const revokeObjectURL = download()

    vi.advanceTimersByTime(REVOKE_DELAY_MS - 1)

    expect(revokeObjectURL).not.toHaveBeenCalled()
  })

  it('is freed once the download has started', () => {
    const revokeObjectURL = download()

    vi.advanceTimersByTime(REVOKE_DELAY_MS)

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:url')
  })
})
