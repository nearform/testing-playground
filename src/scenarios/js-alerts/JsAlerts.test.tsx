import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import JsAlerts from './JsAlerts.scenario'

// jsdom does not implement the browser's native dialogs, so each test stubs
// the one it opens and decides how the "user" answers it.
describe('JS Alerts scenario', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows no result until a dialog has been answered', () => {
    TestRenderer(<JsAlerts />)

    expect(screen.queryByTestId('result')).not.toBeInTheDocument()
  })

  it('opens a native alert and reports that it was accepted', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    TestRenderer(<JsAlerts />)

    fireEvent.click(screen.getByTestId('button-alert'))

    expect(alert).toHaveBeenCalledWith('I am a JS Alert')
    expect(screen.getByTestId('result')).toHaveTextContent(
      'You accepted the alert',
    )
  })

  it.each([
    { answer: true, expected: 'You clicked OK', severity: 'success' },
    { answer: false, expected: 'You clicked Cancel', severity: 'warning' },
  ])(
    'reports "$expected" when the confirm is answered with $answer',
    ({ answer, expected, severity }) => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(answer)
      TestRenderer(<JsAlerts />)

      fireEvent.click(screen.getByTestId('button-confirm'))

      expect(confirm).toHaveBeenCalledWith('Do you want to continue?')
      const result = screen.getByTestId('result')
      expect(result).toHaveTextContent(expected)
      expect(result).toHaveAttribute('data-severity', severity)
    },
  )

  it('opens a prompt with a default answer and shows what was entered', () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('Ada Lovelace')
    TestRenderer(<JsAlerts />)

    fireEvent.click(screen.getByTestId('button-prompt'))

    expect(prompt).toHaveBeenCalledWith('What is your name?', 'Tester')
    expect(screen.getByTestId('result')).toHaveTextContent(
      'You entered: Ada Lovelace',
    )
  })

  it.each([
    { answer: null, expected: 'You cancelled the prompt' },
    { answer: '   ', expected: 'You submitted an empty answer' },
  ])(
    'reports "$expected" when the prompt returns $answer',
    ({ answer, expected }) => {
      vi.spyOn(window, 'prompt').mockReturnValue(answer)
      TestRenderer(<JsAlerts />)

      fireEvent.click(screen.getByTestId('button-prompt'))

      expect(screen.getByTestId('result')).toHaveTextContent(expected)
    },
  )

  it('replaces the previous result when another dialog is answered', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    TestRenderer(<JsAlerts />)

    fireEvent.click(screen.getByTestId('button-alert'))
    fireEvent.click(screen.getByTestId('button-confirm'))

    const result = screen.getByTestId('result')
    expect(result).toHaveTextContent('You clicked Cancel')
    expect(result).not.toHaveTextContent('You accepted the alert')
  })
})

describe('JsAlerts when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  it('shows the result in the new language', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    TestRenderer(<JsAlerts />)
    fireEvent.click(screen.getByTestId('button-confirm'))

    await switchLanguage('fr')

    expect(screen.getByTestId('result')).toHaveTextContent(
      'Vous avez cliqué sur Annuler',
    )
  })
})
