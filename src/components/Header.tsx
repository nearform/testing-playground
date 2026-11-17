import {
  AppHeader,
  AppHeaderActions,
  AppHeaderLogo,
  ThemeToggle,
} from '@nearform/quantum'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import LanguageDropdown from './LanguageDropdown'
import { NFLogo } from '../icons/NFLogo'
import { NFLogoSquare } from '../icons/NFLogoSquare'

function Header(): JSX.Element {
  const { t } = useTranslation()

  return (
    <AppHeader>
      <div className='flex items-center gap-4'>
        <AppHeaderLogo asChild>
          <Link to='/'>
            {/* The full logo is too wide beside the title on small screens */}
            <NFLogo className='hidden w-40 lg:block' />
            <NFLogoSquare className='w-8 lg:hidden' />
          </Link>
        </AppHeaderLogo>
        <h1 className='font-semibold'>{t('site.title')}</h1>
      </div>
      {/* Quantum hides the actions below `sm` to make room for a mobile menu;
          there is no menu here, so keep them showing */}
      <AppHeaderActions className='flex'>
        <LanguageDropdown />
        <ThemeToggle data-testid='theme-toggle' />
      </AppHeaderActions>
    </AppHeader>
  )
}

export default Header
