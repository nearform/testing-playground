import React from 'react'
import ReactHtmlParser from 'html-react-parser'

import type { Information } from '../utils/information'

// The same muted text as Quantum's CardDescription, which is a <p> and so
// cannot hold the lists below
const textClass =
  'text-sm text-foreground-muted dark:text-foreground-muted-dark'

// Long lines are hard to follow, so prose stops at about 75 characters
const proseClass = `${textClass} max-w-[75ch]`

// Selectors, attributes and API calls stand out from the muted prose, so
// they can be picked out at a glance
const codeClass =
  '[&_code]:rounded [&_code]:bg-background-subtle [&_code]:px-1 [&_code]:text-foreground dark:[&_code]:bg-background-subtle-dark dark:[&_code]:text-foreground-dark'

interface ScenarioInformationProps {
  information: Information
}

const ScenarioInformation: React.FC<ScenarioInformationProps> = ({
  information: { summary, sections },
}) => {
  return (
    <div
      className={`flex flex-col gap-4 ${codeClass}`}
      data-testid='scenario-information'
    >
      {summary.map((paragraph) => (
        <p key={paragraph} className={proseClass}>
          {ReactHtmlParser(paragraph)}
        </p>
      ))}
      {/* Columns rather than a grid, so groups of different lengths pack
          together without leaving gaps */}
      {sections.length > 0 && (
        <div className='gap-x-10 lg:columns-2'>
          {sections.map(({ title, points }) => (
            <section key={title} className='mb-4 break-inside-avoid'>
              <h3 className='mb-1 text-sm font-semibold'>
                {ReactHtmlParser(title)}
              </h3>
              <ul
                className={`${textClass} flex list-disc flex-col gap-1 pl-5 marker:text-foreground-muted dark:marker:text-foreground-muted-dark`}
              >
                {points.map((point) => (
                  <li key={point}>{ReactHtmlParser(point)}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default ScenarioInformation
