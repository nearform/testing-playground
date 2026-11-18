import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TestRenderer from '../../tests/TestRenderer'
import { switchLanguage } from '../../tests/switchLanguage'
import DragAndDrop from './DragAndDrop.scenario'

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
      dataTransfer: { setData: vi.fn() },
    })

    // Mock dataTransfer for drop
    fireEvent.drop(dropTarget, {
      dataTransfer: { getData: vi.fn().mockReturnValue('smallBox') },
    })

    expect(screen.getByTestId('total-drops')).toHaveTextContent(
      'Total Drops: 1',
    )
  })

  it('displays the correct total drops', () => {
    TestRenderer(<DragAndDrop />)
    const draggableBox = screen.getByTestId('draggable-box')
    const dropTarget = screen.getByTestId('drop-target')
    for (let i = 0; i < 3; i++) {
      fireEvent.dragStart(draggableBox, {
        dataTransfer: { setData: vi.fn() },
      })
      fireEvent.drop(dropTarget, {
        dataTransfer: { getData: vi.fn().mockReturnValue('smallBox') },
      })
    }
    expect(screen.getByTestId('total-drops')).toHaveTextContent(
      'Total Drops: 3',
    )
  })
})

describe('DragAndDrop when the language changes', () => {
  afterEach(async () => {
    await switchLanguage('en')
  })

  it('labels the dropped boxes in the new language', async () => {
    TestRenderer(<DragAndDrop />)
    fireEvent.drop(screen.getByTestId('drop-target').parentElement!, {
      dataTransfer: { getData: vi.fn().mockReturnValue('smallBox') },
    })
    expect(screen.getByText('Box 1')).toBeInTheDocument()

    await switchLanguage('fr')

    expect(screen.getByText('Boîte 1')).toBeInTheDocument()
    expect(screen.queryByText('Box 1')).not.toBeInTheDocument()
  })
})
