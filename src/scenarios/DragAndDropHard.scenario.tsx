import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

interface Shape {
  id: number
  shape: 'circle' | 'square'
  color: string
}

const DraggableShape = ({
  shape,
  onDragStart,
}: {
  shape: Shape
  onDragStart: (e: React.DragEvent, id: number) => void
}): JSX.Element => {
  return (
    <div
      key={shape.id}
      draggable
      onDragStart={(e) => {
        onDragStart(e, shape.id)
      }}
      className={`m-2.5 h-[50px] w-[50px] cursor-grab shadow transition-colors duration-300 ${
        shape.shape === 'circle' ? 'rounded-full' : 'rounded-none'
      }`}
      style={{ backgroundColor: shape.color }}
      data-testid={`draggable-${shape.shape}-${shape.id}`}
    />
  )
}

const DropTarget = ({
  shape,
  onDrop,
}: {
  shape: 'circle' | 'square'
  onDrop: (e: React.DragEvent) => void
}): JSX.Element => {
  return (
    <div
      onDragOver={(e) => {
        onDrop(e)
      }}
      onDrop={(e) => {
        onDrop(e)
      }}
      // The fill alone is under 3:1 on either surface, so the dashed outline
      // (4.8:1 light, 6.9:1 dark) marks out the drop zone
      className={`m-2.5 h-[100px] w-[100px] cursor-pointer border-2 border-dashed border-grey-500 bg-grey-200 shadow dark:border-grey-400 dark:bg-grey-700 transition-colors duration-300 ${
        shape === 'circle' ? 'rounded-full' : 'rounded-none'
      }`}
      data-testid={`drop-${shape}`}
    />
  )
}

const DragAndDropHard = (): JSX.Element => {
  const { t } = useTranslation()
  const [shapes, setShapes] = useState<Shape[]>(
    Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      shape: Math.random() < 0.5 ? 'circle' : 'square',
      color: 'red',
    })),
  )
  const [totalCorrectCount, setTotalCorrectCount] = useState(0)

  const handleDragStart = (e: React.DragEvent, id: number): void => {
    const draggedShape = shapes.find((shape) => shape.id === id)

    e.dataTransfer.setData('shapeId', id.toString())

    // Prevent drag if the shape is already green
    if (draggedShape != null && draggedShape.color.includes('green')) {
      e.preventDefault()
    }
  }

  const handleDrop = (
    e: React.DragEvent,
    targetShape: 'circle' | 'square',
  ): void => {
    e.preventDefault()
    const shapeId = e.dataTransfer?.getData('shapeId') ?? ''
    const draggedShape = shapes.find(
      (shape) => shape.id === parseInt(shapeId, 10),
    )

    if (draggedShape != null) {
      const updatedShapes: Shape[] = [...shapes]

      // Check if the dropped shape matches the target shape
      if (draggedShape.shape === targetShape) {
        setTotalCorrectCount((prevCount) => prevCount + 1)

        // Handle the possibility of find returning undefined
        const updatedShape = updatedShapes.find(
          (shape) => shape.id === draggedShape.id,
        )
        if (updatedShape != null) {
          updatedShape.color = 'green'
        }
      } else {
        // If dropped onto the wrong shape, turn the shape yellow
        const updatedShape = updatedShapes.find(
          (shape) => shape.id === draggedShape.id,
        )
        if (updatedShape != null) {
          updatedShape.color = 'yellow'
        }
      }

      setShapes(updatedShapes)
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.drag-and-drop-hard.title')}
        description={t('scenarios.drag-and-drop-hard.description')}
        information={t('scenarios.drag-and-drop-hard.information')}
      >
        <div className='mx-auto max-w-6xl'>
          <div className='flex flex-wrap items-center justify-center'>
            {shapes.map((shape) => (
              <DraggableShape
                key={shape.id}
                shape={shape}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
          <div className='mt-4 flex flex-wrap items-center justify-center'>
            <DropTarget
              shape='circle'
              onDrop={(e) => {
                handleDrop(e, 'circle')
              }}
            />
            <DropTarget
              shape='square'
              onDrop={(e) => {
                handleDrop(e, 'square')
              }}
            />
          </div>
          <div className='mt-4 text-center' data-testid='total-count'>
            {t('scenarios.drag-and-drop-hard.total-correct')}:{' '}
            {totalCorrectCount}
          </div>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default DragAndDropHard
