import { fireEvent, screen, waitFor, act } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import DragAndDropHard from './DragAndDropHard.scenario'

describe('DragAndDropHard component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('should render 5 draggable items', () => {
    const { getAllByTestId } = TestRenderer(<DragAndDropHard />)
    const draggableItems = getAllByTestId(/^draggable/)
    expect(draggableItems.length).toBe(5)
  })

  it('increases the count when moved to the correct shape', async () => {
    TestRenderer(<DragAndDropHard />)
    // Get the first draggable square with data-testid starting with 'draggable-'
    const firstDraggable = screen.getByTestId(
      (id: string) => id.startsWith('draggable-') && id.endsWith('-1'),
    )
    // Determine the drop target based on the shape of the first draggable square
    const dropTargetTestId = (firstDraggable
      ?.getAttribute('data-testid')
      ?.includes('circle') as boolean)
      ? 'drop-circle'
      : 'drop-square'
    const dropTarget = screen.getByTestId(dropTargetTestId)
    await act(async () => {
      fireEvent.dragStart(firstDraggable, {
        dataTransfer: {
          setData: vi.fn(),
        },
      })
      fireEvent.drop(dropTarget, {
        dataTransfer: {
          getData: vi.fn(() => '1'),
        },
      })
    })
    await waitFor(() => {
      expect(screen.getByTestId('total-count')).toHaveTextContent(
        'Total Correct: 1',
      )
    })
  })

  describe('dragging over a target', () => {
    // The first shape and the target it belongs on
    const firstShapeAndTarget = (): {
      shape: HTMLElement
      target: HTMLElement
    } => {
      const shape = screen.getByTestId(
        (id: string) => id.startsWith('draggable-') && id.endsWith('-1'),
      )
      const kind = shape.getAttribute('data-testid')?.includes('circle')
        ? 'circle'
        : 'square'
      return { shape, target: screen.getByTestId(`drop-${kind}`) }
    }

    it('lets the shape be dropped there', () => {
      TestRenderer(<DragAndDropHard />)
      const { target } = firstShapeAndTarget()

      // fireEvent returns false when the event's default was prevented,
      // which is what allows a drop
      const notCancelled = fireEvent.dragOver(target, {
        dataTransfer: { getData: vi.fn(() => '1') },
      })

      expect(notCancelled).toBe(false)
    })

    it('does not count as a drop', () => {
      TestRenderer(<DragAndDropHard />)
      const { shape, target } = firstShapeAndTarget()

      fireEvent.dragOver(target, {
        dataTransfer: { getData: vi.fn(() => '1') },
      })

      expect(screen.getByTestId('total-count')).toHaveTextContent(
        'Total Correct: 0',
      )
      // The shape's colour is only in its inline style
      expect(shape.style.backgroundColor).toBe('red')
    })
  })

  describe('dropping a shape', () => {
    const dropFirstShape = (onMatchingTarget: boolean): HTMLElement => {
      const shape = screen.getByTestId(
        (id: string) => id.startsWith('draggable-') && id.endsWith('-1'),
      )
      const isCircle = shape.getAttribute('data-testid')?.includes('circle')
      const kind = isCircle === onMatchingTarget ? 'circle' : 'square'
      fireEvent.drop(screen.getByTestId(`drop-${kind}`), {
        dataTransfer: { getData: vi.fn(() => '1') },
      })
      return shape
    }

    it('turns it green on its own shape', () => {
      TestRenderer(<DragAndDropHard />)

      const shape = dropFirstShape(true)

      expect(shape.style.backgroundColor).toBe('green')
    })

    it('turns it yellow on the other shape', () => {
      TestRenderer(<DragAndDropHard />)

      const shape = dropFirstShape(false)

      expect(shape.style.backgroundColor).toBe('yellow')
    })

    it('leaves the other shapes as they were', () => {
      TestRenderer(<DragAndDropHard />)

      dropFirstShape(true)

      const others = screen
        .getAllByTestId(/^draggable-/)
        .filter((shape) => !shape.getAttribute('data-testid')?.endsWith('-1'))
      expect(others.map((shape) => shape.style.backgroundColor)).toEqual([
        'red',
        'red',
        'red',
        'red',
      ])
    })
  })
})
