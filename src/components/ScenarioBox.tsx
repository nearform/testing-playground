import { Circle } from '@mui/icons-material'
import { Box, Rating, Tooltip, Typography } from '@mui/material'
import { red, orange, green } from '@mui/material/colors'
import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <Link to={`/${link}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box
        sx={{
          border: 1,
          borderColor: 'primary.main',
          borderRadius: 2,
          padding: 2,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: '240px',
        }}
        data-testid={`${link}-input`}
      >
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: '0 0 auto',
          }}
        >
          <Typography variant='h6' gutterBottom>
            {title}
          </Typography>
        </Box>
        <Box sx={{ flex: '0 0 auto' }}>
          <Typography variant='body2' paragraph>
            {t('common.difficulty')}:
          </Typography>
          <Rating
            name='read-only'
            value={Number(rating)}
            icon={<Circle fontSize='small' />}
            emptyIcon={<Circle fontSize='small' />}
            max={3}
            readOnly
            sx={{
              color:
                Number(rating) >= 2
                  ? Number(rating) >= 3
                    ? red[300]
                    : orange[300]
                  : green[300],
            }}
          />
        </Box>
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: '1 0 auto',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}
        >
          <Tooltip title={description} arrow>
            <Typography
              variant='body2'
              paragraph
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {description}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
    </Link>
  )
}

export default ScenarioBox
