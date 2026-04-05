import { css } from '@compiled/react'
import { useEffect } from 'react'
import type { CSSProperties, JSX, PropsWithChildren } from 'react'

type ThemeVars = CSSProperties & Record<`--${string}`, string>

const themeVars: ThemeVars = {
  '--color-background': '#f4f7fb',
  '--color-surface': 'rgba(255, 255, 255, 0.78)',
  '--color-surface-muted': 'rgba(241, 245, 249, 0.92)',
  '--color-border': 'rgba(148, 163, 184, 0.28)',
  '--color-border-strong': 'rgba(71, 85, 105, 0.22)',
  '--color-text': '#475569',
  '--color-text-muted': '#64748b',
  '--color-text-strong': '#0f172a',
  '--color-accent': '#244aff',
  '--color-accent-alt': '#0ea5a4',
  '--shadow-panel': '0 30px 80px rgba(15, 23, 42, 0.12)',
  '--shadow-card': '0 18px 40px rgba(15, 23, 42, 0.08)',
}

const appProvidersStyles = css({
  minHeight: '100vh',
  minWidth: '320px',
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-background)',
  fontFamily: "'Sora', 'Avenir Next', 'Segoe UI', sans-serif",
  lineHeight: 1.5,
  fontWeight: 400,
  fontSynthesis: 'none',
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  useEffect(() => {
    const previousBodyMargin = document.body.style.margin
    const previousBodyMinHeight = document.body.style.minHeight
    const previousBodyMinWidth = document.body.style.minWidth
    const previousScrollBehavior = document.documentElement.style.scrollBehavior

    document.body.style.margin = '0'
    document.body.style.minHeight = '100vh'
    document.body.style.minWidth = '320px'
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.body.style.margin = previousBodyMargin
      document.body.style.minHeight = previousBodyMinHeight
      document.body.style.minWidth = previousBodyMinWidth
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    }
  }, [])

  return (
    <div style={themeVars} css={appProvidersStyles}>
      {children}
    </div>
  )
}
