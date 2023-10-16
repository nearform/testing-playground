import { Box, Container, Grid, Paper } from '@mui/material'
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
  onDragStart
}: {
  shape: Shape
  onDragStart: (e: React.DragEvent, id: number) => void
}): JSX.Element => {
  return (
    <Paper
      key={shape.id}
      draggable
      onDragStart={(e) => {
        !shape.color.includes('green') && onDragStart(e, shape.id)
      }}
      sx={{
        width: '50px',
        height: '50px',
        backgroundColor: shape.color,
        borderRadius: shape.shape === 'circle' ? '50%' : '0%',
        textAlign: 'center',
        lineHeight: '50px',
        margin: '0 10px',
        cursor: shape.color.includes('green') ? 'not-allowed' : 'grab',
        transition: 'background-color 0.3s ease'
      }}
      data-testid={`draggable-${shape.shape}-${shape.id}`}
    />
  )
}

const DropTarget = ({
  shape,
  onDrop
}: {
  shape: 'circle' | 'square'
  onDrop: (e: React.DragEvent) => void
}): JSX.Element => {
  return (
    <Paper
      onDragOver={(e) => {
        onDrop(e)
      }}
      onDrop={(e) => {
        onDrop(e)
      }}
      sx={{
        width: '100px',
        height: '100px',
        backgroundColor: 'red',
        borderRadius: shape === 'circle' ? '50%' : '0%',
        textAlign: 'center',
        lineHeight: '100px',
        margin: '0 10px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }}
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
      color: 'red'
    }))
  )
  const [totalCorrectCount, setTotalCorrectCount] = useState(0)

  const handleDragStart = (e: React.DragEvent, id: number): void => {
    const draggedShape = shapes.find((shape) => shape.id === id)

    // Prevent drag if the shape is already green
    if (draggedShape != null && draggedShape.color.includes('green')) {
      e.preventDefault()
      return
    }

    e.dataTransfer.setData('shapeId', id.toString())
  }

  const handleDrop = (
    e: React.DragEvent,
    targetShape: 'circle' | 'square'
  ): void => {
    e.preventDefault()
    const shapeId = e.dataTransfer.getData('shapeId')
    const draggedShape = shapes.find(
      (shape) => shape.id === parseInt(shapeId, 10)
    )

    if (draggedShape != null) {
      const updatedShapes: Shape[] = [...shapes]

      // Check if the dropped shape matches the target shape
      if (draggedShape.shape === targetShape) {
        setTotalCorrectCount((prevCount) => prevCount + 1)
        // Handle the possibility of find returning undefined
        const updatedShape = updatedShapes.find(
          (shape) => shape.id === draggedShape.id
        )
        if (updatedShape != null) {
          updatedShape.color = 'green'
        }
      } else {
        // If dropped onto the wrong shape, turn the shape yellow
        const updatedShape = updatedShapes.find(
          (shape) => shape.id === draggedShape.id
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
      />
      <Container>
        <Grid container justifyContent='center' alignItems='center'>
          {shapes.map((shape) => (
            <DraggableShape
              key={shape.id}
              shape={shape}
              onDragStart={handleDragStart}
            />
          ))}
        </Grid>
        <Grid
          container
          justifyContent='center'
          alignItems='center'
          marginTop={2}
        >
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
        </Grid>
        <Box marginTop={2} textAlign='center' data-testid='total-count'>
          {t('scenarios.drag-and-drop-hard.total-correct')}: {totalCorrectCount}
        </Box>
      </Container>
    </Layout>
  )
}

export default DragAndDropHard
