import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  // Puedes personalizar el tema aquí
  colors: {
    primary: {
      100: '#E5FCF1',
      200: '#27EF96',
      300: '#10DE82',
      400: '#0EBE6F',
      500: '#0CA25F',
      600: '#0A864F',
      700: '#086F42',
      800: '#075C37',
      900: '#064C2E',
    },
  },
});

export default theme;