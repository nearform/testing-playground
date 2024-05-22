import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

function LanguageSelector(): JSX.Element {
  const { i18n } = useTranslation()

  const handleChangeLanguage = (selectedLanguage: string) => {
    i18n.changeLanguage(selectedLanguage)
  }

  return (
    <div className='relative inline-block text-left'>
      <Select value={i18n.language} onValueChange={handleChangeLanguage}>
        <SelectTrigger>
          <SelectValue placeholder='English' />
        </SelectTrigger>
        <SelectContent side='top' className='overflow-visible'>
          <SelectItem value='en'>English</SelectItem>
          <SelectItem value='fr'>Français</SelectItem>
          <SelectItem value='ptBr'>Português (Brasil)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelector
