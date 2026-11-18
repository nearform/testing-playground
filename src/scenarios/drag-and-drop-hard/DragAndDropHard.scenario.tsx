import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

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
      // Cancelling dragover is what lets a shape be dropped here; only the
      // drop itself checks the shape
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        onDrop(e)
      }}
      // The fill alone is under 3:1 on either surface, so a dashed outline in
      // the easy Drag and Drop scenario's colours marks out the drop zone
      className={`m-2.5 h-[100px] w-[100px] cursor-pointer border-2 border-dashed border-grey-800 bg-grey-200 shadow dark:border-grey-300 dark:bg-grey-700 transition-colors duration-300 ${
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
      // Green on the matching shape, yellow on the wrong one
      const isCorrect = draggedShape.shape === targetShape
      if (isCorrect) {
        setTotalCorrectCount((prevCount) => prevCount + 1)
      }
      const color = isCorrect ? 'green' : 'yellow'

      // A new object for the dropped shape, so the previous state is left
      // untouched
      setShapes(
        shapes.map((shape) =>
          shape.id === draggedShape.id ? { ...shape, color } : shape,
        ),
      )
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
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
            {t(`scenarios.${SLUG}.total-correct`)}: {totalCorrectCount}
          </div>
        </div>
      </PageSetup>
    </Layout>
  )
}

export default DragAndDropHard
