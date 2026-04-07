import { css } from '@compiled/react'
import type { JSX } from 'react'

import { EmptyState } from '@/components/feedback/EmptyState'
import { RoomCard } from '@/features/rooms/components/RoomCard'
import type { RoomSummary } from '@/lib/types/streamshore'

const sectionStyles = css({
  display: 'grid',
  gap: '1rem',
})

const titleStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.1rem',
  fontWeight: 800,
  margin: 0,
})

const gridStyles = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
})

type RoomSectionProps = {
  emptyDescription?: string
  favoriteRoutes?: Set<string>
  rooms: RoomSummary[]
  title: string
}

export function RoomSection({
  emptyDescription = 'No rooms are available in this section yet.',
  favoriteRoutes,
  rooms,
  title,
}: RoomSectionProps): JSX.Element {
  return (
    <section css={sectionStyles}>
      <h2 css={titleStyles}>{title}</h2>
      {rooms.length > 0 ? (
        <div css={gridStyles}>
          {rooms.map((room) => (
            <RoomCard
              key={room.route}
              favoriteRoom={favoriteRoutes?.has(room.route) ?? false}
              room={room}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description={emptyDescription}
          title={`No rooms in ${title}`}
        />
      )}
    </section>
  )
}
