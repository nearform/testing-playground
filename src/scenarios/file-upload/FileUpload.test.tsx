import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import FileUpload from './FileUpload.scenario'

describe('FileUpload component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('displays success message after successful upload', async () => {
    TestRenderer(<FileUpload />)
    const fileInput = screen.getByTestId('select-file')
    // Select a file
    await userEvent.upload(
      fileInput,
      new File(['hello'], 'hello.png', { type: 'image/png' }),
    )
    // Click the upload button
    const uploadButton = screen.getByTestId('upload-button')
    await userEvent.click(uploadButton)
    // Wait for the upload simulation to complete
    await waitFor(
      () => {
        expect(
          screen.getByText(/File "hello.png" uploaded successfully!/),
        ).toBeInTheDocument()
      },
      { timeout: 10000 },
    )
  }, 12000)
})

describe('FileUpload while an upload is in progress', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const selectFile = (name: string): void => {
    fireEvent.change(screen.getByTestId('select-file'), {
      target: { files: [new File(['hello'], name)] },
    })
  }

  // The longest upload, so it is still going when the test acts
  const startLongestUpload = (name: string): void => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(1)
    selectFile(name)
    fireEvent.click(screen.getByTestId('upload-button'))
  }

  it('does not report the earlier file once another is picked', () => {
    TestRenderer(<FileUpload />)
    startLongestUpload('a.txt')

    selectFile('b.txt')
    act(() => {
      vi.runAllTimers()
    })

    expect(screen.getByTestId('selected-file-name')).toHaveTextContent('b.txt')
    expect(screen.queryByTestId('upload-message')).toBeNull()
  })

  it('lets the newly picked file be uploaded', () => {
    TestRenderer(<FileUpload />)
    startLongestUpload('a.txt')

    selectFile('b.txt')

    expect(screen.getByTestId('upload-button')).toBeEnabled()
  })

  it('stops the upload when the page is left', () => {
    const { unmount } = TestRenderer(<FileUpload />)
    startLongestUpload('a.txt')

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('FileUpload when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows the upload result in the new language', async () => {
    vi.useFakeTimers()
    // The shortest upload: one second
    vi.spyOn(Math, 'random').mockReturnValue(0)
    TestRenderer(<FileUpload />)
    fireEvent.change(screen.getByTestId('select-file'), {
      target: { files: [new File(['hello'], 'hello.txt')] },
    })
    fireEvent.click(screen.getByTestId('upload-button'))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    await switchLanguage('fr')

    expect(screen.getByTestId('upload-message')).toHaveTextContent(
      'Fichier "hello.txt" téléchargé avec succès !',
    )
  })
})
