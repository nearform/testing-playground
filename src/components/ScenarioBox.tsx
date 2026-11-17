import React from 'react'
import { Link } from 'react-router-dom'

import { DIFFICULTY_STYLES, difficultyOf } from '../utils/difficulty'

interface ScenarioBoxProps {
  title: string
  description: string
  link: string
  rating: string
}

const ScenarioBox: React.FC<ScenarioBoxProps> = ({
  title,
  description,
  link,
  rating,
}) => {
  const styles = DIFFICULTY_STYLES[difficultyOf(rating)]

  return (
    <Link
      to={`/${link}`}
      className='block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
    >
      <div
        className={`h-full rounded-2xl p-6 min-h-48 transition-colors dark:ring-1 dark:ring-inset ${styles.card} ${styles.ring}`}
      >
        <div className='font-semibold'>{title}</div>
        <div className='mt-1 text-sm text-foreground-muted dark:text-foreground-muted-dark'>
          {description}
        </div>
      </div>
    </Link>
  )
}

export default ScenarioBox
