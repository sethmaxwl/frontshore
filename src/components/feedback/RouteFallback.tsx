import { css } from '@compiled/react'
import type { JSX } from 'react'

import { SurfaceCard } from '@/components/primitives/SurfaceCard'

const shellStyles = css({
  display: 'grid',
  minHeight: '50vh',
  placeItems: 'center',
  width: '100%',
})

const cardStyles = css({
  display: 'grid',
  gap: '0.75rem',
  maxWidth: '28rem',
  textAlign: 'center',
})

const dotRowStyles = css({
  display: 'inline-flex',
  gap: '0.55rem',
  justifyContent: 'center',
})

const dotStyles = css({
  animation: 'pulse 1.2s ease-in-out infinite',
  background:
    'linear-gradient(135deg, rgba(34, 211, 238, 1), rgba(59, 130, 246, 0.9))',
  borderRadius: '999px',
  height: '0.8rem',
  width: '0.8rem',
  selectors: {
    '&:nth-of-type(2)': {
      animationDelay: '150ms',
    },
    '&:nth-of-type(3)': {
      animationDelay: '300ms',
    },
  },
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 0.35,
      transform: 'translateY(0)',
    },
    '50%': {
      opacity: 1,
      transform: 'translateY(-4px)',
    },
  },
})

const titleStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.15rem',
  fontWeight: 700,
  margin: 0,
})

const copyStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

export function RouteFallback(): JSX.Element {
  return (
    <div css={shellStyles}>
      <SurfaceCard as="div">
        <div css={cardStyles}>
          <div css={dotRowStyles} aria-hidden="true">
            <span css={dotStyles} />
            <span css={dotStyles} />
            <span css={dotStyles} />
          </div>
          <p css={titleStyles}>Loading the next stream surface...</p>
          <p css={copyStyles}>
            We&apos;re pulling the route code in lazily to keep the initial app
            fast.
          </p>
        </div>
      </SurfaceCard>
    </div>
  )
}
