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
              ? 'bg-red-100 hover:bg-red-400'
              : 'bg-yellow-100  hover:bg-yellow-400'
            : 'bg-green-100  hover:bg-green-400'
        }`}
      >
        <div className='font-semibold'>{title}</div>
        <div className='mt-1 text-sm text-foreground-muted'>{description}</div>
      </div>
    </Link>
  )
}

export default ScenarioBox
