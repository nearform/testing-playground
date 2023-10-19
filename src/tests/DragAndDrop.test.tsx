import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from './customRender'
import DragAndDrop from '../scenarios/DragAndDrop'

describe('DragAndDrop component', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('handles drag-and-drop correctly', () => {
    TestRenderer(<DragAndDrop />)
    const draggableBox = screen.getByTestId('draggable-box')
    const dropTarget = screen.getByTestId('drop-target')

    // Mock dataTransfer for drag start
    fireEvent.dragStart(draggableBox, {
      dataTransfer: { setData: vi.fn() }
    })

    // Mock dataTransfer for drop
    fireEvent.drop(dropTarget, {
      dataTransfer: { getData: vi.fn().mockReturnValue('smallBox') }
    })

    expect(screen.getByTestId('total-drops')).toHaveTextContent('Total Drops: 1')
  })

  it('displays the correct total drops', () => {
    TestRenderer(<DragAndDrop />)
    const draggableBox = screen.getByTestId('draggable-box')
    const dropTarget = screen.getByTestId('drop-target')
    for (let i = 0; i < 3; i++) {
      fireEvent.dragStart(draggableBox, {
        dataTransfer: { setData: vi.fn() }
      })
      fireEvent.drop(dropTarget, {
        dataTransfer: { getData: vi.fn().mockReturnValue('smallBox') }
      })
    }
    expect(screen.getByTestId('total-drops')).toHaveTextContent('Total Drops: 3')
  })
})
