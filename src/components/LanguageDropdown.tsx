import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nearform/quantum'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { languageTag } from '../i18n/i18nConfig'

// Each language is named in itself, so each option is marked with its own
// lang for screen readers to pronounce it correctly (WCAG 3.1.2). The chosen
// one, shown in the trigger, is always the page's language already.
const LANGUAGES = [
  { value: 'en', name: 'English' },
  { value: 'fr', name: 'Français' },
  { value: 'ptBr', name: 'Português (Brasil)' },
]

function LanguageSelector(): JSX.Element {
  const { t, i18n } = useTranslation()

  const handleChangeLanguage = (selectedLanguage: string) => {
    i18n.changeLanguage(selectedLanguage)
  }

  return (
    <Select value={i18n.language} onValueChange={handleChangeLanguage}>
      <SelectTrigger aria-label={t('common.language')}>
        <SelectValue placeholder={t('common.language')} />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(({ value, name }) => (
          <SelectItem key={value} value={value} lang={languageTag(value)}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default LanguageSelector
