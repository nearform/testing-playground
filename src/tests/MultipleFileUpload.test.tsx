import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import en from '../i18n/locales/en.json'
import fr from '../i18n/locales/fr.json'
import ptBr from '../i18n/locales/pt-br.json'
import MultipleFileUpload from '../scenarios/MultipleFileUpload.scenario'
import { MAX_FILE_SIZE, UPLOAD_TICK_MS } from '../utils/fileUpload'

// Every key path under an object, e.g. "drop-zone.title"
const keyPaths = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? Object.entries(value).flatMap(([name, child]) =>
        keyPaths(child, prefix === '' ? name : `${prefix}.${name}`),
      )
    : [prefix]

const image = (name: string, size = 10, type = 'image/png'): File =>
  new File([new Uint8Array(size)], name, { type })

// A 10 byte file moves on 25% a tick, so is done after four
const FINISH_SMALL_UPLOAD_MS = 4 * UPLOAD_TICK_MS

const setup = () => {
  const user = userEvent.setup({
    // The drop zone checks types itself, as a test that sets files would
    // get past the accept attribute
    applyAccept: false,
  })
  TestRenderer(<MultipleFileUpload />)
  return user
}

const advance = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

const uploadItem = (name: string): HTMLElement => {
  const item = screen
    .getAllByTestId('upload-item')
    .find((element) => element.dataset.fileName === name)
  if (item === undefined) throw new Error(`No upload item for ${name}`)
  return item
}

const uploadNames = (): string[] =>
  screen
    .queryAllByTestId('upload-item')
    .map((element) => element.dataset.fileName ?? '')

// jsdom has no object URLs, so each test stubs them and puts them back
const { createObjectURL, revokeObjectURL } = URL

describe('MultipleFileUpload', () => {
  beforeEach(() => {
    // Uploads move on with setInterval. userEvent's own delays use setTimeout,
    // which is left real so its awaits still resolve.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    URL.createObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('has the same text keys in every language', () => {
    const keys = keyPaths(en.scenarios['multiple-file-upload'])
    expect(keyPaths(fr.scenarios['multiple-file-upload'])).toEqual(keys)
    expect(keyPaths(ptBr.scenarios['multiple-file-upload'])).toEqual(keys)
  })

  describe('multiple files input', () => {
    it('lists every chosen file', async () => {
      const user = setup()

      await user.upload(screen.getByTestId('multiple-files-input'), [
        image('a.png'),
        new File(['hello'], 'notes.txt', { type: 'text/plain' }),
      ])

      expect(screen.getByTestId('multiple-files-count')).toHaveTextContent(
        '2 files selected',
      )
      expect(
        screen
          .getAllByTestId('multiple-files-item')
          .map((item) => item.textContent),
      ).toEqual(['a.png (10 B, image/png)', 'notes.txt (5 B, text/plain)'])
    })

    it('replaces the list when files are chosen again', async () => {
      const user = setup()
      const input = screen.getByTestId('multiple-files-input')
      await user.upload(input, [image('a.png'), image('b.png')])

      await user.upload(input, [image('c.png')])

      expect(
        screen
          .getAllByTestId('multiple-files-item')
          .map((item) => item.dataset.fileName),
      ).toEqual(['c.png'])
    })
  })

  describe('drop zone', () => {
    it('hides its native input from view and from the tab order', () => {
      setup()
      const input = screen.getByTestId('drop-zone-input')
      expect(input).toHaveClass('sr-only')
      expect(input).toHaveAttribute('tabindex', '-1')
      expect(input).toHaveAttribute('multiple')
    })

    it('adds images chosen through the hidden input', async () => {
      const user = setup()

      await user.upload(screen.getByTestId('drop-zone-input'), [
        image('a.png'),
        image('b.jpg', 10, 'image/jpeg'),
      ])

      expect(uploadNames()).toEqual(['a.png', 'b.jpg'])
    })

    it('adds images dropped on the zone', () => {
      setup()

      fireEvent.drop(screen.getByTestId('drop-zone'), {
        dataTransfer: { files: [image('dropped.png')] },
      })

      expect(uploadNames()).toEqual(['dropped.png'])
    })

    it('makes one preview per image under StrictMode', () => {
      // StrictMode, as the app runs in, calls state updaters twice
      TestRenderer(
        <React.StrictMode>
          <MultipleFileUpload />
        </React.StrictMode>,
      )

      fireEvent.drop(screen.getByTestId('drop-zone'), {
        dataTransfer: { files: [image('a.png'), image('b.png')] },
      })

      expect(uploadNames()).toEqual(['a.png', 'b.png'])
      expect(URL.createObjectURL).toHaveBeenCalledTimes(2)
    })

    it('highlights the zone while files are dragged over it', () => {
      setup()
      const zone = screen.getByTestId('drop-zone')

      fireEvent.dragEnter(zone, { dataTransfer: { files: [] } })

      expect(zone).toHaveAttribute('data-dragging', 'true')
      expect(zone).toHaveTextContent('Release to add the files')
    })

    it('stops highlighting the zone when the drag leaves it', () => {
      setup()
      const zone = screen.getByTestId('drop-zone')
      fireEvent.dragEnter(zone, { dataTransfer: { files: [] } })

      fireEvent.dragLeave(zone)

      expect(zone).toHaveAttribute('data-dragging', 'false')
    })

    it.each([
      {
        file: new File(['%PDF'], 'report.pdf', { type: 'application/pdf' }),
        error: 'type',
        text: 'report.pdf is not a PNG, JPEG, GIF or WebP image.',
      },
      {
        file: image('huge.png', MAX_FILE_SIZE + 1),
        error: 'size',
        text: 'huge.png is 1,048,577 B, over the 1,048,576 B limit.',
      },
    ])('rejects a file with a $error error', async ({ file, error, text }) => {
      const user = setup()

      await user.upload(screen.getByTestId('drop-zone-input'), file)

      const message = screen.getByTestId('upload-error')
      expect(message).toHaveAttribute('data-error', error)
      expect(message).toHaveTextContent(text)
    })

    it('adds the good files from a selection that also has bad ones', async () => {
      const user = setup()

      await user.upload(screen.getByTestId('drop-zone-input'), [
        image('good.png'),
        new File(['x'], 'bad.txt', { type: 'text/plain' }),
      ])

      expect(uploadNames()).toEqual(['good.png'])
      expect(screen.getByTestId('upload-errors')).toHaveTextContent(
        '1 file was not added:',
      )
    })

    it('rejects a file that has already been added', async () => {
      const user = setup()
      const input = screen.getByTestId('drop-zone-input')
      await user.upload(input, image('a.png'))

      await user.upload(input, image('a.png'))

      expect(uploadNames()).toEqual(['a.png'])
      expect(screen.getByTestId('upload-error')).toHaveTextContent(
        'a.png has already been added.',
      )
    })

    it('shows a preview of each image', async () => {
      const user = setup()

      await user.upload(screen.getByTestId('drop-zone-input'), image('a.png'))

      expect(
        screen.getByRole('img', { name: 'Preview of a.png' }),
      ).toHaveAttribute('src', 'blob:a.png')
    })

    it('shows each upload in progress', async () => {
      const user = setup()
      await user.upload(screen.getByTestId('drop-zone-input'), image('a.png'))

      advance(UPLOAD_TICK_MS)

      const item = uploadItem('a.png')
      expect(
        within(item).getByRole('progressbar', {
          name: 'Upload progress for a.png',
        }),
      ).toHaveAttribute('aria-valuenow', '25')
      expect(item).toHaveAttribute('data-status', 'uploading')
    })

    it('marks an upload as done once its progress reaches 100%', async () => {
      const user = setup()
      await user.upload(screen.getByTestId('drop-zone-input'), image('a.png'))

      advance(FINISH_SMALL_UPLOAD_MS)

      const item = uploadItem('a.png')
      expect(item).toHaveAttribute('data-status', 'uploaded')
      expect(within(item).getByTestId('upload-status')).toHaveTextContent(
        'Uploaded',
      )
    })

    it('removes a file and releases its preview', async () => {
      const user = setup()
      await user.upload(screen.getByTestId('drop-zone-input'), [
        image('a.png'),
        image('b.png'),
      ])

      await user.click(screen.getByRole('button', { name: 'Remove a.png' }))

      expect(uploadNames()).toEqual(['b.png'])
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png')
    })

    it('disables Submit while a file is uploading', async () => {
      const user = setup()

      await user.upload(screen.getByTestId('drop-zone-input'), image('a.png'))

      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('asks for an image when submitting an empty list', async () => {
      const user = setup()

      await user.click(screen.getByTestId('submit-button'))

      expect(screen.getByTestId('submit-message')).toHaveTextContent(
        'Add at least one image before submitting.',
      )
    })

    it('submits every uploaded image and empties the list', async () => {
      const user = setup()
      await user.upload(screen.getByTestId('drop-zone-input'), [
        image('a.png'),
        image('b.png'),
      ])
      advance(FINISH_SMALL_UPLOAD_MS)

      await user.click(screen.getByTestId('submit-button'))

      expect(screen.getByTestId('submit-message')).toHaveTextContent(
        '2 images submitted: a.png, b.png',
      )
      expect(uploadNames()).toEqual([])
    })
  })
})
