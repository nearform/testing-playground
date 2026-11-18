import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'
import { defineScenario } from '../utils/defineScenario'
import { translateInformation } from '../utils/information'

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
        `${t('scenarios.drag-and-drop.box')} ${prevGrid.length + 1}`,
      ])
    }
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.drag-and-drop.title')}
        description={t('scenarios.drag-and-drop.description')}
        information={translateInformation(
          t,
          'scenarios.drag-and-drop.information',
        )}
      >
        <div className='flex items-center justify-center'>
          {/* Small draggable box on the left */}
          <div
            draggable
            onDragStart={handleDragStart}
            className='m-2.5 flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded bg-red-500 text-center text-grey-900 text-sm shadow'
            data-testid='draggable-box'
          >
            {t('scenarios.drag-and-drop.drag-me')}!
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
              {grid.length === 0 && t('scenarios.drag-and-drop.drop-here')}
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
          {t('scenarios.drag-and-drop.total-drops')}: {dropCount}
        </p>
      </PageSetup>
    </Layout>
  )
}

export default defineScenario(DragAndDrop, {
  slug: 'drag-and-drop',
  difficulty: 'medium',
})
