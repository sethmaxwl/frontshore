import { css } from '@compiled/react'
import type { JSX, PropsWithChildren } from 'react'

import { panelStyles } from './styles.ts'

const cardStyles = css({
  padding: '1.25rem',
})

type SurfaceCardProps = PropsWithChildren<{
  as?: 'article' | 'div' | 'section'
}>

export function SurfaceCard({
  as = 'section',
  children,
}: SurfaceCardProps): JSX.Element {
  const Component = as

  return <Component css={[panelStyles, cardStyles]}>{children}</Component>
}
