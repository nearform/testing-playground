import React from 'react'
import { useTranslation } from 'react-i18next'

function Footer(): JSX.Element {
  const { t } = useTranslation()
  return (
    <footer className='flex flex-col h-full justify-end py-8 text-sm text-foreground-muted text-center mt-16'>
      &copy; Copyright {new Date().getFullYear()} {t('site.company')} Ltd. All
      Rights Reserved.
    </footer>
  )
}

export default Footer
