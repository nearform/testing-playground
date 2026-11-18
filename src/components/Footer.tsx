import { FooterStatement, WebsiteFooter } from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

function Footer(): JSX.Element {
  const { t } = useTranslation()
  return (
    <WebsiteFooter size='sm'>
      <FooterStatement size='sm'>
        {t('common.copyright', {
          year: new Date().getFullYear(),
          company: t('site.company'),
        })}
      </FooterStatement>
    </WebsiteFooter>
  )
}

export default Footer
