import { css } from '@compiled/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { CSSProperties, JSX, PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/app/providers/AuthProvider'
import { ThemeProvider, useTheme } from '@/app/providers/ThemeProvider'

type ThemeVars = CSSProperties & Record<`--${string}`, string>

const lightThemeVars: ThemeVars = {
  '--color-accent': '#0891b2',
  '--color-accent-strong': '#0e7490',
  '--color-background': '#d9e8f2',
  '--color-border': 'rgba(10, 37, 64, 0.14)',
  '--color-surface': 'rgba(255, 255, 255, 0.78)',
  '--color-surface-strong': 'rgba(255, 255, 255, 0.95)',
  '--color-surface-muted': 'rgba(228, 238, 245, 0.78)',
  '--color-text': '#294457',
  '--color-text-muted': '#537085',
  '--color-text-strong': '#081523',
  '--shadow-panel': '0 32px 90px rgba(8, 21, 35, 0.14)',
  '--shadow-soft': '0 16px 35px rgba(8, 21, 35, 0.12)',
}

const darkThemeVars: ThemeVars = {
  '--color-accent': '#22d3ee',
  '--color-accent-strong': '#67e8f9',
  '--color-background': '#020817',
  '--color-border': 'rgba(125, 211, 252, 0.16)',
  '--color-surface': 'rgba(7, 15, 28, 0.74)',
  '--color-surface-strong': 'rgba(8, 17, 30, 0.92)',
  '--color-surface-muted': 'rgba(9, 18, 31, 0.64)',
  '--color-text': '#b2c6d9',
  '--color-text-muted': '#7d96ab',
  '--color-text-strong': '#f8fbff',
  '--shadow-panel': '0 34px 120px rgba(1, 9, 18, 0.58)',
  '--shadow-soft': '0 18px 40px rgba(1, 9, 18, 0.34)',
}

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
})

const appProvidersStyles = css({
  background:
    'radial-gradient(circle at top, rgba(34, 211, 238, 0.18), transparent 24%), radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.18), transparent 28%), linear-gradient(180deg, rgba(1, 8, 22, 0.98), rgba(3, 12, 24, 0.98))',
  color: 'var(--color-text)',
  fontFamily: "'Space Grotesk', 'Sora', 'Avenir Next', 'Segoe UI', sans-serif",
  fontSynthesis: 'none',
  lineHeight: 1.5,
  minHeight: '100vh',
  minWidth: '320px',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  '::selection': {
    background: 'rgba(34, 211, 238, 0.3)',
  },
})

function AppSurface({ children }: PropsWithChildren): JSX.Element {
  const { isDarkTheme, themeMode } = useTheme()
  const themeVars = isDarkTheme ? darkThemeVars : lightThemeVars

  useEffect(() => {
    const previousBodyMargin = document.body.style.margin
    const previousBodyMinHeight = document.body.style.minHeight
    const previousBodyMinWidth = document.body.style.minWidth
    const previousBodyBackground = document.body.style.background
    const previousBodyColor = document.body.style.color
    const previousScrollBehavior = document.documentElement.style.scrollBehavior

    document.body.style.margin = '0'
    document.body.style.minHeight = '100vh'
    document.body.style.minWidth = '320px'
    document.body.style.background = themeVars['--color-background']
    document.body.style.color = themeVars['--color-text']
    document.documentElement.style.scrollBehavior = 'smooth'
    document.documentElement.dataset.theme = themeMode

    return () => {
      document.body.style.background = previousBodyBackground
      document.body.style.color = previousBodyColor
      document.body.style.margin = previousBodyMargin
      document.body.style.minHeight = previousBodyMinHeight
      document.body.style.minWidth = previousBodyMinWidth
      document.documentElement.style.scrollBehavior = previousScrollBehavior
      delete document.documentElement.dataset.theme
    }
  }, [themeMode, themeVars])

  return (
    <div style={themeVars} css={appProvidersStyles}>
      {children}
      <Toaster
        closeButton
        richColors
        position="bottom-right"
        theme={themeMode}
      />
    </div>
  )
}

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppSurface>{children}</AppSurface>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
