import * as React from 'react'
import { useTranslation } from 'react-i18next'

import LanguageDropdown from './LanguageDropdown'
import { NFLogo } from '../icons/NFLogo'
import { NFLogoSquare } from '../icons/NFLogoSquare'

function Header(): JSX.Element {
  const { t } = useTranslation()

  return (
    <header className='w-full flex flex-col lg:flex-row justify-between items-center px-8 py-5 lg:px-12 bg-background'>
      <div className='flex flex-row items-center gap-2 lg:gap-4'>
        <a href='/'>
          <NFLogo className='hidden w-8 lg:w-40 lg:block lg:w-40 fill-button-primary' />
          <NFLogoSquare className='block w-8 lg:hidden fill-button-primary' />
        </a>
        <span className='w-px h-6 md:h-6 bg-button-primary opacity-20' />
        <h1 className='lg:text-lg font-bold text-foreground'>
          {t('site.title')}
        </h1>
      </div>
      <LanguageDropdown />
    </header>
  )
}

export default Header
