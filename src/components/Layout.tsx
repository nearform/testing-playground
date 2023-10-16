import { CssBaseline, Container } from '@mui/material'
import React, { type ReactNode } from 'react'

import Footer from './Footer'
import Header from './Header'

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Container maxWidth={false} disableGutters>
      <CssBaseline />
      <Header />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
      <Footer />
    </Container>
  )
}

export default Layout
