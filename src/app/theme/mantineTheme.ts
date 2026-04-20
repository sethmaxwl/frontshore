import { createTheme } from '@mantine/core'

const accessibleDarkPalette = [
  '#C9C9C9',
  '#b8b8b8',
  '#a3a3a3',
  '#696969',
  '#424242',
  '#3b3b3b',
  '#2e2e2e',
  '#242424',
  '#1f1f1f',
  '#141414',
] as const

export const mantineTheme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'md',
  autoContrast: true,
  colors: {
    dark: accessibleDarkPalette,
  },
  headings: {
    fontWeight: '700',
  },
  components: {
    Anchor: {
      defaultProps: {
        underline: 'always',
      },
    },
  },
})
