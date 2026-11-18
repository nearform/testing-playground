import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { defineScenario } from '../../utils/defineScenario'
import { translateInformation } from '../../utils/information'

// The scenario's route, and where its texts live in the locale files
const SLUG = 'drag-and-drop'

const DragAndDrop = (): JSX.Element => {
  const { t } = useTranslation()
  const [dropCount, setDropCount] = useState(0)
  const [grid, setGrid] = useState<string[]>([])

  const handleDragStart = (e: React.DragEvent): void => {
    e.dataTransfer.setData('text/plain', 'smallBox')
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    if (e.dataTransfer.getData('text/plain') === 'smallBox') {
      setDropCount((prevCount) => prevCount + 1)
      setGrid((prevGrid) => [
        ...prevGrid,
        `${t(`scenarios.${SLUG}.box`)} ${prevGrid.length + 1}`,
      ])
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <div className='flex items-center justify-center'>
          {/* Small draggable box on the left */}
          <div
            draggable
            onDragStart={handleDragStart}
            className='m-2.5 flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded bg-red-500 text-center text-grey-900 text-sm shadow'
            data-testid='draggable-box'
          >
            {t(`scenarios.${SLUG}.drag-me`)}!
          </div>

          {/* Larger drop target grid on the right */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className='flex min-h-[200px] w-1/2 flex-wrap items-center justify-center border-2 border-dashed border-grey-800 p-2.5 dark:border-grey-300'
          >
            {/* Render "Drop Here" if the grid is empty */}
            <div
              className={
                grid.length === 0
                  ? 'h-full w-full cursor-pointer rounded border border-dashed border-grey-800 bg-grey-200 text-center dark:border-grey-300 dark:bg-grey-700 leading-[200px] shadow'
                  : 'w-full'
              }
              data-testid='drop-target'
            >
              {grid.length === 0 && t(`scenarios.${SLUG}.drop-here`)}
            </div>

            {/* Render placeholder boxes in the grid */}
            {grid.map((boxId) => (
              <div
                key={boxId}
                className='m-2.5 flex h-[50px] w-[50px] items-center justify-center rounded border border-grey-800 bg-yellow-300 text-grey-900 text-center text-sm shadow'
              >
                {boxId}
              </div>
            ))}
          </div>
        </div>

        <p className='mt-2.5 text-center' data-testid='total-drops'>
          {t(`scenarios.${SLUG}.total-drops`)}: {dropCount}
        </p>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(DragAndDrop, {
  slug: SLUG,
  difficulty: 'medium',
})
