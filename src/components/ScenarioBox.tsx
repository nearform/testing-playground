import {
  Badge,
  CardDescription,
  CardTitle,
  cardVariants,
} from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { DIFFICULTY_BADGE_VARIANT, type Difficulty } from '../utils/difficulty'

interface ScenarioBoxProps {
  title: string
  description: string
  link: string
  difficulty: Difficulty
}

const ScenarioBox: React.FC<ScenarioBoxProps> = ({
  title,
  description,
  link,
  difficulty,
}) => {
  const { t } = useTranslation()

  // The link wears Quantum's interactive card styling itself, so the whole
  // card is one focusable target with Quantum's hover and focus ring
  return (
    <Link
      to={`/${link}`}
      className={cardVariants({
        interactive: true,
        className: 'flex flex-col items-start gap-2 p-4',
      })}
    >
      <Badge variant={DIFFICULTY_BADGE_VARIANT[difficulty]} size='sm' dot>
        {t(`common.${difficulty}`)}
      </Badge>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </Link>
  )
}

export default ScenarioBox
