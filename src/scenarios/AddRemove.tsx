import { Box, Button } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const AddRemove = (): JSX.Element => {
  const { t } = useTranslation()
  const [elements, setElements] = useState<number[]>([])
  const [nextIndex, setNextIndex] = useState(() => {
    const storedIndex = sessionStorage.getItem('nextIndex')
    return storedIndex !== null ? parseInt(storedIndex, 10) : 0
  })

  const location = useLocation()
  const initialElementsParam = new URLSearchParams(location.search).get('initialElements')

  useEffect(() => {
    if (elements.length === 0 && initialElementsParam != null) {
      const initialElementsCount = parseInt(initialElementsParam, 10)
      if (!isNaN(initialElementsCount) && initialElementsCount > 0) {
        setNextIndex(initialElementsCount - 1)
        sessionStorage.setItem('nextIndex', (initialElementsCount - 1).toString())
        setElements(Array.from({ length: initialElementsCount }, (_, i) => i))
      }
    }
  }, [elements, initialElementsParam])

  const addElement = (): void => {
    setNextIndex((prevIndex) => {
      const newIndex = prevIndex + 1
      sessionStorage.setItem('nextIndex', newIndex.toString())
      return newIndex
    })
    setElements((prevElements) => [...prevElements, nextIndex])
  }

  const removeElement = (indexToRemove: number): void => {
    setElements((prevElements) => {
      const newElements = prevElements.filter((element) => element !== indexToRemove)
      if (newElements.length === 0) {
        setNextIndex(0)
        sessionStorage.setItem('nextIndex', '0')
      }
      return newElements
    })
  }

  const ElementComponent = ({
    index,
    removeElement
  }: {
    index: number
    removeElement: () => void
  }): JSX.Element => {
    const { t: elementT } = useTranslation()

    return (
      <>
        <Button
          variant="contained"
          color="error"
          onClick={removeElement}
          data-testid={`remove-element-${index + 1}`}
        >
          {elementT('scenarios.add-remove.remove-element')} {index + 1}
        </Button>
      </>
    )
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.add-remove.title')}
        description={t('scenarios.add-remove.description')}
        information={t('scenarios.add-remove.information')}
      />
      <Button variant="contained" onClick={addElement} sx={{ mb: 4 }} data-testid="add-element">
        {t('scenarios.add-remove.add-element')}
      </Button>
      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={2}>
        {elements.map((element, index) => (
          <div key={index}>
            <ElementComponent
              index={element}
              removeElement={() => {
                removeElement(element)
              }}
            />
          </div>
        ))}
      </Box>
    </Layout>
  )
}

export default AddRemove
