import { Box, Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

interface ScenarioBoxProps {
  title: string
  description: string
  link: string
}

const ScenarioBox: React.FC<ScenarioBoxProps> = ({
  title,
  description,
  link,
}) => {
  const transformLink = (link: string): string => {
    return link.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

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
          justifyContent: 'space-between',
          height: '100%',
          minHeight: '220px',
        }}
        data-testid={`${transformLink(link)}-input`}
      >
        <Typography variant='h6' gutterBottom>
          {title}
        </Typography>
        <Typography variant='body2' paragraph>
          {description}
        </Typography>
      </Box>
    </Link>
  )
}

export default ScenarioBox
