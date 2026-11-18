import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import AddRemove from './AddRemove.scenario'

describe('AddRemove component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('adds an element when the "Add Element" button is clicked', () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const removeElementButton = screen.getByTestId('remove-element-1')
    expect(removeElementButton).toBeInTheDocument()
  })

  it('removes an element when the "Remove Element" button is clicked', async () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    expect(screen.queryByTestId('remove-element-1')).toBeInTheDocument()
    const removeElementButton = screen.getByTestId('remove-element-1')
    fireEvent.click(removeElementButton)
    expect(screen.queryByTestId('remove-element-1')).not.toBeInTheDocument()
  })

  it('correctly updates the index when adding elements', () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const secondAddButton = screen.getByTestId('add-element')
    fireEvent.click(secondAddButton)
    const removeSecondElementButton = screen.getByTestId('remove-element-2')
    expect(removeSecondElementButton).toBeInTheDocument()
  })

  it('correctly updates the index when removing elements', () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const secondAddButton = screen.getByTestId('add-element')
    fireEvent.click(secondAddButton)
    const removeFirstElementButton = screen.getByTestId('remove-element-1')
    fireEvent.click(removeFirstElementButton)
    const removeSecondElementButton = screen.getByTestId('remove-element-2')
    expect(removeSecondElementButton).toBeInTheDocument()
  })

  it('numbers two buttons added in the same batch differently', () => {
    TestRenderer(<AddRemove />)
    const addButton = screen.getByTestId('add-element')

    act(() => {
      addButton.click()
      addButton.click()
    })

    expect(
      screen
        .getAllByTestId(/^remove-element-/)
        .map((button) => button.getAttribute('data-testid')),
    ).toEqual(['remove-element-1', 'remove-element-2'])
  })

  it('keeps focus on a Remove button when another button is added', () => {
    TestRenderer(<AddRemove />, {
      initialEntries: ['/add-remove?initialElements=1'],
    })
    const removeButton = screen.getByTestId('remove-element-1')
    removeButton.focus()

    fireEvent.click(screen.getByTestId('add-element'))

    expect(document.activeElement).toBe(removeButton)
  })

  it("keeps a Remove button's element when an earlier button is removed", () => {
    TestRenderer(<AddRemove />, {
      initialEntries: ['/add-remove?initialElements=2'],
    })
    const secondButton = screen.getByTestId('remove-element-2')

    fireEvent.click(screen.getByTestId('remove-element-1'))

    expect(secondButton).toBeInTheDocument()
  })

  it("never reuses a saved button's number, even with a stale saved index", () => {
    sessionStorage.setItem('elements', JSON.stringify([0, 1, 2]))
    sessionStorage.setItem('nextIndex', '0')
    TestRenderer(<AddRemove />)

    fireEvent.click(screen.getByTestId('add-element'))

    expect(screen.getAllByTestId('remove-element-4')).toHaveLength(1)
    expect(screen.getAllByTestId('remove-element-1')).toHaveLength(1)
  })

  describe('with ?initialElements in the URL', () => {
    const renderWithInitialElements = (count: number): void => {
      TestRenderer(<AddRemove />, {
        initialEntries: [`/add-remove?initialElements=${count}`],
      })
    }

    const removeButtonIds = (): string[] =>
      screen
        .queryAllByTestId(/^remove-element-/)
        .map((button) => button.getAttribute('data-testid') ?? '')

    it('starts with that many buttons, numbered from 1', () => {
      renderWithInitialElements(3)

      expect(removeButtonIds()).toEqual([
        'remove-element-1',
        'remove-element-2',
        'remove-element-3',
      ])
    })

    it('numbers the next button added after them', () => {
      renderWithInitialElements(3)

      fireEvent.click(screen.getByTestId('add-element'))

      expect(removeButtonIds()).toEqual([
        'remove-element-1',
        'remove-element-2',
        'remove-element-3',
        'remove-element-4',
      ])
    })

    it('does not bring the buttons back once they have all been removed', () => {
      renderWithInitialElements(2)

      fireEvent.click(screen.getByTestId('remove-element-1'))
      fireEvent.click(screen.getByTestId('remove-element-2'))

      expect(removeButtonIds()).toEqual([])
    })

    it('does not bring the buttons back after "Clear Storage"', () => {
      renderWithInitialElements(2)

      fireEvent.click(screen.getByTestId('clear-storage'))

      expect(removeButtonIds()).toEqual([])
    })

    it('keeps the buttons already saved instead', () => {
      sessionStorage.setItem('elements', JSON.stringify([0, 4]))
      sessionStorage.setItem('nextIndex', '5')
      renderWithInitialElements(3)

      expect(removeButtonIds()).toEqual([
        'remove-element-1',
        'remove-element-5',
      ])
    })

    it('numbers the next button correctly after a reload', () => {
      // Left over from an earlier visit in the same tab: one button was
      // added and removed again
      sessionStorage.setItem('elements', '[]')
      sessionStorage.setItem('nextIndex', '0')
      renderWithInitialElements(3)
      cleanup()
      renderWithInitialElements(3)

      fireEvent.click(screen.getByTestId('add-element'))

      expect(removeButtonIds()).toEqual([
        'remove-element-1',
        'remove-element-2',
        'remove-element-3',
        'remove-element-4',
      ])
    })
  })

  it('clears storage when the "Clear Storage" button is clicked', () => {
    TestRenderer(<AddRemove />)

    // Add an element first
    const addButton = screen.getByTestId('add-element')
    fireEvent.click(addButton)
    const removeElementButton = screen.queryByTestId('remove-element-1')
    expect(removeElementButton).toBeInTheDocument()

    // Click the "Clear Storage" button
    const clearStorageButton = screen.getByTestId('clear-storage')
    fireEvent.click(clearStorageButton)

    // Check if storage is cleared
    expect(sessionStorage.getItem('elements')).toEqual('[]')
    expect(sessionStorage.getItem('nextIndex')).toEqual('0')

    // Check if state is updated
    expect(removeElementButton).not.toBeInTheDocument()
  })

  it('leaves other scenarios\' session data alone on "Clear Storage"', () => {
    sessionStorage.setItem('multi-step-form', '{"step":2}')
    TestRenderer(<AddRemove />)

    fireEvent.click(screen.getByTestId('clear-storage'))

    expect(sessionStorage.getItem('multi-step-form')).toBe('{"step":2}')
  })

  it.each([
    { stored: 'null' },
    { stored: '"abc"' },
    { stored: 'not json' },
    { stored: '[1, "two"]' },
  ])('starts with no buttons when the saved list is $stored', ({ stored }) => {
    sessionStorage.setItem('elements', stored)

    TestRenderer(<AddRemove />)

    expect(screen.getByTestId('add-element')).toBeInTheDocument()
    expect(screen.queryByTestId('remove-element-1')).toBeNull()
  })
})
