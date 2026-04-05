import { css } from '@compiled/react'
import type { JSX, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

type InfoCardProps = PropsWithChildren<{
  title: string
  to: string
  linkLabel: string
}>

const cardStyles = css({
  padding: '2rem',
  border: '1px solid var(--color-border)',
  borderRadius: '32px',
  background: 'var(--color-surface)',
  boxShadow: 'var(--shadow-panel)',
})

const contentStyles = css({
  display: 'grid',
  gap: '1rem',
  maxWidth: '42rem',
})

const titleStyles = css({
  margin: 0,
  color: 'var(--color-text-strong)',
  lineHeight: 1.05,
  fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
  letterSpacing: '-0.03em',
})

const bodyStyles = css({
  display: 'grid',
  gap: '1rem',
  '& p': {
    margin: 0,
  },
  '& code': {
    padding: '0.12rem 0.4rem',
    borderRadius: '0.45rem',
    background: 'rgba(15, 23, 42, 0.08)',
    color: 'var(--color-text-strong)',
    fontFamily: "'IBM Plex Mono', 'SFMono-Regular', monospace",
  },
})

const linkStyles = css({
  display: 'inline-flex',
  width: 'fit-content',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75rem 1rem',
  borderRadius: '999px',
  background: 'var(--color-accent)',
  color: 'white',
  fontWeight: 700,
  textDecoration: 'none',
})

export function InfoCard({
  title,
  to,
  linkLabel,
  children,
}: InfoCardProps): JSX.Element {
  return (
    <section css={cardStyles}>
      <div css={contentStyles}>
        <h2 css={titleStyles}>{title}</h2>
        <div css={bodyStyles}>{children}</div>
        <Link css={linkStyles} to={to}>
          {linkLabel}
        </Link>
      </div>
    </section>
  )
}
