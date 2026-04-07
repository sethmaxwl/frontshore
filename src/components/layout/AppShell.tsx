import { css } from '@compiled/react'
import type { JSX, PropsWithChildren, ReactNode } from 'react'

type AppShellProps = PropsWithChildren<{
  actions?: ReactNode
  eyebrow?: string
  subtitle?: string
  title: string
  description: string
}>

const shellStyles = css({
  position: 'relative',
  minHeight: '100svh',
  overflow: 'hidden',
  paddingBottom: '2.5rem',
})

const backdropStyles = css({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at top, rgba(34, 211, 238, 0.18), transparent 24%), radial-gradient(circle at 82% 15%, rgba(59, 130, 246, 0.18), transparent 26%), linear-gradient(180deg, rgba(5, 15, 28, 0.48), rgba(3, 12, 24, 0.08))',
  pointerEvents: 'none',
})

const headerStyles = css({
  alignItems: 'end',
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  position: 'relative',
  zIndex: 1,
  width: 'min(1280px, calc(100% - 2rem))',
  margin: '0 auto',
  padding: '3.5rem 0 2rem',
  '@media (max-width: 820px)': {
    gridTemplateColumns: '1fr',
  },
})

const eyebrowStyles = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.45rem 0.8rem',
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  background: 'rgba(7, 15, 28, 0.42)',
  color: 'var(--color-accent)',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
})

const titleStyles = css({
  maxWidth: '13ch',
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
  fontSize: '1.02rem',
})

const contentStyles = css({
  position: 'relative',
  zIndex: 1,
  width: 'min(1280px, calc(100% - 2rem))',
  margin: '0 auto',
  padding: '1rem 0 2.5rem',
})

const subtitleStyles = css({
  color: 'var(--color-text-muted)',
  fontSize: '0.95rem',
  margin: 0,
  maxWidth: '62ch',
})

const copyColumnStyles = css({
  minWidth: 0,
})

const actionsStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'flex-end',
  '@media (max-width: 820px)': {
    justifyContent: 'flex-start',
  },
})

export function AppShell({
  actions,
  eyebrow,
  title,
  description,
  subtitle,
  children,
}: AppShellProps): JSX.Element {
  return (
    <div css={shellStyles}>
      <div css={backdropStyles} aria-hidden="true" />
      <header css={headerStyles}>
        <div css={copyColumnStyles}>
          {eyebrow ? <span css={eyebrowStyles}>{eyebrow}</span> : null}
          <h1 css={titleStyles}>{title}</h1>
          <p css={descriptionStyles}>{description}</p>
          {subtitle ? <p css={subtitleStyles}>{subtitle}</p> : null}
        </div>
        {actions ? <div css={actionsStyles}>{actions}</div> : null}
      </header>
      <main css={contentStyles}>{children}</main>
    </div>
  )
}
