import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import TestRenderer from './TestRenderer'
import Iframes from '../scenarios/Iframes.scenario'

type Queries = ReturnType<typeof within>

// Testing Library queries stop at a frame's boundary, so scope them to the
// frame's own document once it has loaded and been filled in
const loadedBody = async (frame: Element): Promise<HTMLElement> =>
  waitFor(() => {
    const body = (frame as HTMLIFrameElement).contentDocument?.body
    if (body === undefined || body.childElementCount === 0) {
      throw new Error('Frame has not loaded yet')
    }
    return body
  })

const insideFrame = async (frame: Element): Promise<Queries> =>
  within(await loadedBody(frame))

const renderScenario = (): ReturnType<typeof userEvent.setup> => {
  const user = userEvent.setup()
  TestRenderer(<Iframes />)
  return user
}

describe('Iframes scenario', () => {
  describe('form in a frame', () => {
    it('keeps the form out of reach of queries on the page', async () => {
      TestRenderer(<Iframes />)
      const frame = await insideFrame(screen.getByTestId('form-frame'))

      expect(frame.getByTestId('frame-name-input')).toBeInTheDocument()
      expect(screen.queryByTestId('frame-name-input')).toBeNull()
    })

    it('gives the frame a name and title tools can find it by', () => {
      TestRenderer(<Iframes />)

      const frame = screen.getByTitle('Form frame')
      expect(frame).toHaveAttribute('name', 'form-frame')
      expect(frame).toHaveAttribute('id', 'form-frame')
    })

    it('sends the name typed in the frame to the page', async () => {
      const user = renderScenario()
      const frame = await insideFrame(screen.getByTestId('form-frame'))

      expect(screen.getByTestId('frame-message')).toHaveTextContent(
        'No message from the frame yet',
      )
      // user-event types into the page's active element, which is the frame
      // itself rather than the input inside it, so React never sees the change
      fireEvent.change(frame.getByLabelText('Your name'), {
        target: { value: '  Ada  ' },
      })
      await user.click(frame.getByTestId('frame-send-button'))

      expect(screen.getByTestId('frame-message')).toHaveTextContent(
        'The frame says: Hello, Ada!',
      )
      expect(frame.getByTestId('frame-form-error')).toBeEmptyDOMElement()
    })

    it('shows an error inside the frame when sending an empty name', async () => {
      const user = renderScenario()
      const frame = await insideFrame(screen.getByTestId('form-frame'))

      await user.click(frame.getByTestId('frame-send-button'))

      expect(frame.getByTestId('frame-form-error')).toHaveTextContent(
        'Please enter a name',
      )
      expect(screen.getByTestId('frame-message')).toHaveTextContent(
        'No message from the frame yet',
      )
    })
  })

  describe('nested frames', () => {
    it('only reaches the inner frame from inside the outer frame', async () => {
      TestRenderer(<Iframes />)
      const outer = await insideFrame(screen.getByTestId('outer-frame'))

      expect(screen.queryByTestId('inner-frame')).toBeNull()
      expect(outer.getByTestId('outer-frame-text')).toHaveTextContent(
        'Outer frame',
      )
      expect(outer.queryByTestId('inner-frame-count')).toBeNull()
      const inner = await insideFrame(outer.getByTestId('inner-frame'))
      expect(inner.getByTestId('inner-frame-text')).toHaveTextContent(
        'Inner frame',
      )
    })

    it('counts clicks on the button in the inner frame', async () => {
      const user = renderScenario()
      const outer = await insideFrame(screen.getByTestId('outer-frame'))
      const inner = await insideFrame(outer.getByTestId('inner-frame'))

      expect(inner.getByTestId('inner-frame-count')).toHaveTextContent('0')
      await user.click(inner.getByTestId('inner-frame-button'))
      await user.click(inner.getByTestId('inner-frame-button'))

      expect(inner.getByTestId('inner-frame-count')).toHaveTextContent('2')
    })
  })

  describe('rich text editor', () => {
    const editorFrame = (): HTMLIFrameElement =>
      screen.getByTestId('editor-frame') as HTMLIFrameElement

    it('makes the frame body an editable text box with starting text', async () => {
      TestRenderer(<Iframes />)
      const body = await loadedBody(editorFrame())

      // The editor is the frame's body itself, so look it up from its document
      expect(
        within(body.parentElement as HTMLElement).getByRole('textbox', {
          name: 'Editor content',
        }),
      ).toBe(body)
      expect(body).toHaveAttribute('contenteditable', 'true')
      expect(body).toHaveTextContent(
        'Select some of this text and make it bold.',
      )
      expect(screen.getByTestId('editor-word-count')).toHaveTextContent(
        '9 words',
      )
      expect(screen.getByTestId('editor-html')).toHaveTextContent(
        '<p>Select some of this text and make it bold.</p>',
      )
    })

    it('reads the frame content back onto the page as it is edited', async () => {
      TestRenderer(<Iframes />)
      const body = await loadedBody(editorFrame())

      // The browser edits a contenteditable body itself, then fires input
      body.innerHTML = '<p>Hello <strong>world</strong></p>'
      fireEvent.input(body)

      expect(screen.getByTestId('editor-word-count')).toHaveTextContent(
        '2 words',
      )
      expect(screen.getByTestId('editor-html')).toHaveTextContent(
        '<p>Hello <strong>world</strong></p>',
      )
    })

    it.each(['bold', 'italic', 'underline'])(
      'formats the selection in the frame with %s from the toolbar outside it',
      async (command) => {
        const user = renderScenario()
        await loadedBody(editorFrame())
        // jsdom has no execCommand, so stand in for the browser's formatting
        const frameDocument = editorFrame().contentDocument as Document
        const execCommand = vi.fn(() => true)
        frameDocument.execCommand = execCommand

        await user.click(screen.getByTestId(`editor-${command}`))

        expect(execCommand).toHaveBeenCalledWith(command)
        expect(frameDocument.activeElement).toBe(frameDocument.body)
      },
    )

    it('clears the editor from the toolbar', async () => {
      const user = renderScenario()
      const body = await loadedBody(editorFrame())

      await user.click(screen.getByTestId('editor-clear'))

      expect(body).toBeEmptyDOMElement()
      expect(screen.getByTestId('editor-word-count')).toHaveTextContent(
        '0 words',
      )
      expect(screen.getByTestId('editor-html')).toBeEmptyDOMElement()
    })
  })
})
