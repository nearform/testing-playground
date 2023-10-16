import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import React from 'react'
import { useTranslation } from 'react-i18next'

function LanguageSelector(): JSX.Element {
  const { i18n } = useTranslation()

  const handleChangeLanguage = async (
    event: SelectChangeEvent<string>,
  ): Promise<void> => {
    const newLanguage = event.target.value
    await i18n.changeLanguage(newLanguage)
  }

  return (
    <Select
      value={i18n.language}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onChange={handleChangeLanguage}
      sx={{ color: 'inherit' }}
    >
      <MenuItem value='en'>English</MenuItem>
      <MenuItem value='fr'>Français</MenuItem>
      <MenuItem value='ptBr'>Português (Brasil)</MenuItem>
    </Select>
  )
}

export default LanguageSelector
