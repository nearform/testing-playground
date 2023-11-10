import { CssBaseline, Container, Divider } from '@mui/material'
import React, { type ReactNode } from 'react'

import Footer from './Footer'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container maxWidth={false} disableGutters>
      <CssBaseline />
      <Header />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
      <Divider sx={{ mt: 3, mb: 3 }} />
      <Footer />
    </Container>
  )
}

export default Layout
