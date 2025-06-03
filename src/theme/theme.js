import { createTheme } from '@mui/material/styles';

export const netflixColors = {
  red: '#E50914',
  blue: '#0071eb',
  green: '#1DB954',
  yellow: '#E6B91E',
  darkRed: '#B20710',
  darkGray: '#181818',
  darkerGray: '#141414',
  lightGray: '#b3b3b3',
  gray: '#222',
  white: '#fff',
  black: '#000'
};

const theme = createTheme({
  palette: {
    primary: { main: netflixColors.red },
    secondary: { main: netflixColors.blue }, // Make sure this is a string!
    success: { main: netflixColors.green },
    warning: { main: netflixColors.yellow },
    error: { main: netflixColors.red },
    background: {
      default: netflixColors.darkGray,
      paper: netflixColors.darkerGray,
    },
    text: {
      primary: netflixColors.white,
      secondary: netflixColors.lightGray,
    },
  },
});

export default theme;
