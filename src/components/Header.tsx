import { ThemeToggle } from '@nearform/quantum'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import LanguageDropdown from './LanguageDropdown'
import { NFLogo } from '../icons/NFLogo'
import { NFLogoSquare } from '../icons/NFLogoSquare'

function Header(): JSX.Element {
  const { t } = useTranslation()

  return (
    <header className='w-full flex flex-col gap-4 md:flex-row justify-between items-center px-8 py-5 lg:px-12 bg-background dark:bg-background-surface-dark'>
      <div className='flex flex-row items-center gap-2 lg:gap-4'>
        <Link to='/'>
          <NFLogo className='hidden w-8 lg:w-40 lg:block lg:w-40 text-accent dark:text-foreground-dark' />
          <NFLogoSquare className='block w-8 lg:hidden text-accent dark:text-foreground-dark' />
        </Link>
        <span className='w-px h-6 md:h-6 bg-button-primary opacity-20 dark:bg-button-primary-dark' />
        <h1 className='lg:text-lg font-bold text-foreground dark:text-foreground-dark'>
          {t('site.title')}
        </h1>
      </div>
      <div className='flex items-center gap-2'>
        <LanguageDropdown />
        <ThemeToggle data-testid='theme-toggle' />
      </div>
    </header>
  )
}

export default Header
