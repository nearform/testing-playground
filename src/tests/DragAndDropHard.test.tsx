import { fireEvent, screen, waitFor, act } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './customRender'
import DragAndDropHard from '../scenarios/DragAndDropHard'

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
    const firstDraggable = screen.getByTestId((id: string) => id.startsWith('draggable-') && id.endsWith('-1'))
    // Determine the drop target based on the shape of the first draggable square
    const dropTargetTestId = (((firstDraggable as HTMLElement)?.getAttribute('data-testid')?.includes('circle')) ?? false) ? 'drop-circle' : 'drop-square'
    const dropTarget = screen.getByTestId(dropTargetTestId)
    await act(async () => {
      fireEvent.dragStart(firstDraggable, {
        dataTransfer: {
          setData: vi.fn()
        }
      })
      fireEvent.drop(dropTarget, {
        dataTransfer: {
          getData: vi.fn(() => '1')
        }
      })
    })
    await waitFor(() => {
      expect(screen.getByTestId('total-count')).toHaveTextContent('Total Correct: 1')
    })
  })
})
