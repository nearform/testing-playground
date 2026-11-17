import { FooterStatement, WebsiteFooter } from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

function Footer(): JSX.Element {
  const { t } = useTranslation()
  return (
    <WebsiteFooter size='sm'>
      <FooterStatement size='sm'>
        &copy; Copyright {new Date().getFullYear()} {t('site.company')} Ltd. All
        Rights Reserved.
      </FooterStatement>
    </WebsiteFooter>
  )
}

export default Footer
