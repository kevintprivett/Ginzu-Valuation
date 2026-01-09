import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#274268',
    },
    divider: '#091f3d',
    },
  typography: {
    fontFamily: 'Open Sans',
  },
})

export default theme
