import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom'

import TestRenderer from './TestRenderer'
import FileUpload from '../scenarios/FileUpload.scenario'

describe('FileUpload component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it(
    'displays success message after successful upload',
    async () => {
      TestRenderer(<FileUpload />)
      const fileInput = screen.getByTestId('select-file')
      // Select a file
      await userEvent.upload(
        fileInput,
        new File(['hello'], 'hello.png', { type: 'image/png' })
      )
      // Click the upload button
      const uploadButton = screen.getByTestId('upload-button')
      await userEvent.click(uploadButton)
      // Wait for the upload simulation to complete
      await waitFor(
        () => {
          expect(
            screen.getByText(/File "hello.png" uploaded successfully!/)
          ).toBeInTheDocument()
        },
        { timeout: 10000 }
      )
    },
    { timeout: 12000 }
  )
})
