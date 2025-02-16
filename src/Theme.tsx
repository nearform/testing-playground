import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const Theme = createTheme({
  palette: {
    primary: {
      main: '#00E5A4',
    },
    secondary: {
      main: '#5630FF',
      contrastText: '#FFFFFF',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
})

export default Theme
