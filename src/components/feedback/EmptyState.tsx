import { css } from '@compiled/react'
import type { JSX } from 'react'

import { SurfaceCard } from '@/components/primitives/SurfaceCard'

const titleStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.1rem',
  fontWeight: 700,
  margin: 0,
})

const copyStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const shellStyles = css({
  display: 'grid',
  gap: '0.65rem',
  padding: '0.5rem',
  textAlign: 'center',
})

type EmptyStateProps = {
  description: string
  title: string
}

export function EmptyState({
  description,
  title,
}: EmptyStateProps): JSX.Element {
  return (
    <SurfaceCard as="div">
      <div css={shellStyles}>
        <p css={titleStyles}>{title}</p>
        <p css={copyStyles}>{description}</p>
      </div>
    </SurfaceCard>
  )
}
