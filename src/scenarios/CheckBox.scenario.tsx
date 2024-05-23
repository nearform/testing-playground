import {
  Bookmark,
  BookmarkBorder,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material'
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

const CheckBox = (): JSX.Element => {
  const { t } = useTranslation()
  const [checked, setChecked] = useState([false, false, false])

  const handleRequired = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChecked([checked[0], checked[1], event.target.checked])
  }

  const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChecked([event.target.checked, event.target.checked])
  }

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChecked([event.target.checked, checked[1]])
  }

  const handleChange3 = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setChecked([checked[0], event.target.checked])
  }

  const children = (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
      <FormControlLabel
        data-testid='child'
        label={t('scenarios.check-box.child')}
        control={<Checkbox checked={checked[0]} onChange={handleChange2} />}
      />
      <FormControlLabel
        data-testid='child'
        label={t('scenarios.check-box.child')}
        control={<Checkbox checked={checked[1]} onChange={handleChange3} />}
      />
    </Box>
  )

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.check-box.title')}
        description={t('scenarios.check-box.description')}
        information={t('scenarios.check-box.information')}
      >
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant='body2'>
              {t('scenarios.check-box.scenario-form')}:
            </Typography>
            <FormControl required error={!checked[2]}>
              <FormGroup>
                <FormControlLabel
                  data-testid='checked'
                  control={<Checkbox defaultChecked />}
                  label={t('scenarios.check-box.checked')}
                />
                <FormControlLabel
                  data-testid='disabled'
                  disabled
                  control={<Checkbox />}
                  label={t('scenarios.check-box.disabled')}
                />
                <FormControlLabel
                  data-testid='required'
                  required
                  control={<Checkbox onChange={handleRequired} />}
                  label={t('scenarios.check-box.required')}
                />
                {!checked[2] && (
                  <FormHelperText data-testid='required-message'>
                    {t('scenarios.check-box.required-message')}
                  </FormHelperText>
                )}
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item>
            <Typography variant='body2'>
              {t('scenarios.check-box.scenario-icons')}:
            </Typography>
            <Checkbox
              data-testid='favorite'
              icon={<FavoriteBorder />}
              checkedIcon={<Favorite />}
            />
            <Checkbox
              data-testid='bookmark'
              icon={<BookmarkBorder />}
              checkedIcon={<Bookmark />}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mt: 4, mb: 4 }} />
        <Typography variant='body2'>
          {t('scenarios.check-box.scenario-tree')}:
        </Typography>
        <div>
          <FormControlLabel
            data-testid='parent'
            label={t('scenarios.check-box.parent')}
            control={
              <Checkbox
                checked={checked[0] && checked[1]}
                indeterminate={checked[0] !== checked[1]}
                onChange={handleChange1}
              />
            }
          />
          {children}
        </div>
      </PageSetup>
    </Layout>
  )
}

export default CheckBox
