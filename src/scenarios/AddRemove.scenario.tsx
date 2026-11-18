import { Button } from '@nearform/quantum'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'add-remove'

interface InitialState {
  elements: number[]
  // The index the next button added gets (it is shown as one more)
  nextIndex: number
}

// The buttons saved in sessionStorage or, when there are none and the URL has
// ?initialElements=N, buttons 1 to N. Worked out once, as the page loads, so
// emptying the list later does not bring the URL's buttons back.
export const loadInitialState = (search: string): InitialState => {
  const storedElements = sessionStorage.getItem('elements')
  const elements: number[] =
    storedElements !== null ? JSON.parse(storedElements) : []

  if (elements.length > 0) {
    // Never reuse a saved button's number, even if the saved index is stale
    const afterSaved = Math.max(...elements) + 1
    const storedIndex = parseInt(sessionStorage.getItem('nextIndex') ?? '', 10)
    return {
      elements,
      nextIndex: isNaN(storedIndex)
        ? afterSaved
        : Math.max(storedIndex, afterSaved),
    }
  }

  const count = parseInt(
    new URLSearchParams(search).get('initialElements') ?? '',
    10,
  )
  if (!isNaN(count) && count > 0) {
    // Buttons 1 to N have the indexes 0 to N - 1, so the next one is N
    return {
      elements: Array.from({ length: count }, (_, i) => i),
      nextIndex: count,
    }
  }

  return { elements: [], nextIndex: 0 }
}

const AddRemove = (): JSX.Element => {
  const { t } = useTranslation()
  const location = useLocation()
  const [initialState] = useState(() => loadInitialState(location.search))
  const [elements, setElements] = useState<number[]>(initialState.elements)
  const [nextIndex, setNextIndex] = useState(initialState.nextIndex)

  // Save both whenever they change, so they cannot fall out of step
  useEffect(() => {
    sessionStorage.setItem('elements', JSON.stringify(elements))
  }, [elements])

  useEffect(() => {
    sessionStorage.setItem('nextIndex', nextIndex.toString())
  }, [nextIndex])

  const addElement = (): void => {
    setNextIndex((prevIndex) => prevIndex + 1)
    setElements((prevElements) => [...prevElements, nextIndex])
  }

  const removeElement = (indexToRemove: number): void => {
    setElements((prevElements) => {
      const newElements = prevElements.filter(
        (element) => element !== indexToRemove,
      )
      if (newElements.length === 0) {
        setNextIndex(0)
      }
      return newElements
    })
  }

  const clearStorage = (): void => {
    sessionStorage.clear()
    setElements([]) // Clear elements in state as well
    setNextIndex(0)
  }

  const ElementComponent = ({
    index,
    removeElement,
  }: {
    index: number
    removeElement: () => void
  }): JSX.Element => {
    const { t } = useTranslation()

    return (
      <>
        <Button
          variant='danger'
          onClick={removeElement}
          data-testid={`remove-element-${index + 1}`}
        >
          {t(`scenarios.${SLUG}.remove-element`)} {index + 1}
        </Button>
      </>
    )
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex gap-4 mb-4'>
          <Button
            variant='primary'
            onClick={addElement}
            data-testid='add-element'
          >
            {t(`scenarios.${SLUG}.add-element`)}
          </Button>
          <Button
            variant='secondary'
            onClick={clearStorage}
            data-testid='clear-storage'
          >
            {t(`scenarios.${SLUG}.clear-storage`)}
          </Button>
        </div>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4'>
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
        </div>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(AddRemove, {
  slug: SLUG,
  difficulty: 'easy',
})
