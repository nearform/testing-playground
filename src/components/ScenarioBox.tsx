import React from 'react'
import { Link } from 'react-router-dom'

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
  return (
    <Link
      to={`/${link}`}
      className='block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
    >
      <div
        className={`h-full rounded-2xl p-6 min-h-48 transition-colors ${
          Number(rating) >= 2
            ? Number(rating) >= 3
              ? 'bg-red-100 hover:bg-red-400 dark:bg-red-900/40 dark:hover:bg-red-900/70'
              : 'bg-yellow-100 hover:bg-yellow-400 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/70'
            : 'bg-green-100 hover:bg-green-400 dark:bg-green-900/40 dark:hover:bg-green-900/70'
        }`}
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
