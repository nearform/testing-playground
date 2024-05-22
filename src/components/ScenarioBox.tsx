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
    <Link to={`/${link}`}>
      <div
        className={`mt-6 rounded-2xl p-6 min-h-48 ${
          Number(rating) >= 2
            ? Number(rating) >= 3
              ? 'bg-yellow-100 hover:bg-yellow-400'
              : 'bg-red-100  hover:bg-red-400'
            : 'bg-green-100  hover:bg-green-400'
        }`}
      >
        <div className='font-semibold'>{title}</div>
        <div className='text-foreground-muted text-sm text-primary-900'>
          {description}
        </div>
      </div>
    </Link>
  )
}

export default ScenarioBox
