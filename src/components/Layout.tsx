import React, { type ReactNode } from 'react'
import Footer from './Footer'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <div className='px-4 py-4'>{children}</div>
      <Footer />
    </>
  )
}

export default Layout
