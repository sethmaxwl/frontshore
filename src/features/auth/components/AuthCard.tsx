import { css } from '@compiled/react'
import type { JSX, PropsWithChildren, ReactNode } from 'react'

import { SurfaceCard } from '@/components/primitives/SurfaceCard'

const pageStyles = css({
  display: 'grid',
  minHeight: 'calc(100svh - 8rem)',
  placeItems: 'center',
  padding: '2rem 0 4rem',
})

const cardStyles = css({
  display: 'grid',
  gap: '1.25rem',
  maxWidth: '32rem',
  width: 'min(100%, 32rem)',
})

const headerStyles = css({
  display: 'grid',
  gap: '0.75rem',
})

const eyebrowStyles = css({
  color: 'var(--color-accent)',
  fontSize: '0.82rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  margin: 0,
  textTransform: 'uppercase',
})

const titleStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  lineHeight: 1,
  margin: 0,
})

const descriptionStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const footerStyles = css({
  color: 'var(--color-text-muted)',
  display: 'grid',
  gap: '0.55rem',
})

type AuthCardProps = PropsWithChildren<{
  description: string
  footer?: ReactNode
  eyebrow?: string
  title: string
}>

export function AuthCard({
  children,
  description,
  eyebrow = 'Streamshore access',
  footer,
  title,
}: AuthCardProps): JSX.Element {
  return (
    <div css={pageStyles}>
      <SurfaceCard as="section">
        <div css={cardStyles}>
          <header css={headerStyles}>
            <p css={eyebrowStyles}>{eyebrow}</p>
            <h1 css={titleStyles}>{title}</h1>
            <p css={descriptionStyles}>{description}</p>
          </header>
          {children}
          {footer ? <div css={footerStyles}>{footer}</div> : null}
        </div>
      </SurfaceCard>
    </div>
  )
}
