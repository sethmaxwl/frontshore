import { css } from '@compiled/react'
import type { JSX, PropsWithChildren } from 'react'

type AppShellProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
}>

const shellStyles = css({
  position: 'relative',
  minHeight: '100svh',
  overflow: 'hidden',
})

const backdropStyles = css({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at top, rgba(36, 74, 255, 0.18), transparent 32%), radial-gradient(circle at 80% 20%, rgba(22, 163, 74, 0.14), transparent 24%), linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(244, 247, 251, 0.98))',
  pointerEvents: 'none',
})

const headerStyles = css({
  position: 'relative',
  zIndex: 1,
  width: 'min(1100px, calc(100% - 2rem))',
  margin: '0 auto',
  padding: '4rem 0 2rem',
  '@media (max-width: 640px)': {
    paddingTop: '3rem',
  },
})

const eyebrowStyles = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.45rem 0.8rem',
  border: '1px solid var(--color-border-strong)',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.78)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  color: 'var(--color-text-muted)',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
})

const titleStyles = css({
  maxWidth: '12ch',
  margin: '1.25rem 0 1rem',
  color: 'var(--color-text-strong)',
  lineHeight: 1.05,
  fontSize: 'clamp(3rem, 8vw, 5.75rem)',
  letterSpacing: '-0.05em',
  '@media (max-width: 640px)': {
    maxWidth: '100%',
  },
})

const descriptionStyles = css({
  maxWidth: '62ch',
  margin: 0,
  fontSize: '1.05rem',
})

const contentStyles = css({
  position: 'relative',
  zIndex: 1,
  width: 'min(1100px, calc(100% - 2rem))',
  margin: '0 auto',
  padding: '1rem 0 4rem',
})

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: AppShellProps): JSX.Element {
  return (
    <div css={shellStyles}>
      <div css={backdropStyles} aria-hidden="true" />
      <header css={headerStyles}>
        <span css={eyebrowStyles}>{eyebrow}</span>
        <h1 css={titleStyles}>{title}</h1>
        <p css={descriptionStyles}>{description}</p>
      </header>
      <main css={contentStyles}>{children}</main>
    </div>
  )
}
