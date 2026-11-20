import { act, fireEvent, screen } from '@testing-library/react'
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

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // The upload takes a random 1 to 10 seconds. The test takes the longest,
  // on fake timers, so it neither waits nor races the clock. Math.random
  // never returns 1, so just under it gives exactly 10 seconds.
  it('displays success message after successful upload', () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.9999)
    TestRenderer(<FileUpload />)
    fireEvent.change(screen.getByTestId('select-file'), {
      target: {
        files: [new File(['hello'], 'hello.png', { type: 'image/png' })],
      },
    })
    fireEvent.click(screen.getByTestId('upload-button'))

    act(() => {
      vi.advanceTimersByTime(9999)
    })
    expect(screen.queryByTestId('upload-message')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByTestId('upload-message')).toHaveTextContent(
      'File "hello.png" uploaded successfully!',
    )
  })
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
