import { css } from '@compiled/react'
import { useQuery } from '@tanstack/react-query'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

import {
  baseButtonStyles,
  buttonStyles,
  panelStyles,
} from '../../components/primitives/styles.ts'

import { useAuth } from '@/app/providers/AuthProvider'
import { AppShell } from '@/components/layout/AppShell'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { RoomSection } from '@/features/rooms/components/RoomSection'
import { fetchFavorites, fetchFriends, fetchRooms } from '@/lib/api/streamshore'
import { buildRoomSections } from '@/lib/utils/rooms'

const heroMetricsStyles = css({
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  maxWidth: '30rem',
  width: '100%',
  '@media (max-width: 700px)': {
    gridTemplateColumns: '1fr',
  },
})

const metricCardStyles = css({
  display: 'grid',
  gap: '0.35rem',
  padding: '1rem',
})

const metricValueStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.5rem',
  fontWeight: 800,
  margin: 0,
})

const metricLabelStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const contentStyles = css({
  display: 'grid',
  gap: '2rem',
})

type LandingData = {
  favoriteRooms: Awaited<ReturnType<typeof fetchFavorites>>
  friendNames: string[]
  rooms: Awaited<ReturnType<typeof fetchRooms>>
}

function getLandingMetrics(
  data: LandingData,
): Array<{ label: string; value: string }> {
  const publicRooms = data.rooms.filter((room) => room.privacy === 0)
  const privateRooms = data.rooms.length - publicRooms.length

  return [
    { label: 'Rooms live', value: String(data.rooms.length) },
    { label: 'Public rooms', value: String(publicRooms.length) },
    { label: 'Private rooms', value: String(privateRooms) },
  ]
}

export default function LandingPage(): JSX.Element {
  const { isAuthenticated, session } = useAuth()

  const landingQuery = useQuery({
    queryFn: async (): Promise<LandingData> => {
      const roomsPromise = fetchRooms()

      if (!isAuthenticated || !session?.user) {
        return {
          favoriteRooms: [],
          friendNames: [],
          rooms: await roomsPromise,
        }
      }

      const [rooms, favoriteRooms, friendResponse] = await Promise.all([
        roomsPromise,
        fetchFavorites(session.user),
        fetchFriends(session.user),
      ])

      return {
        favoriteRooms,
        friendNames: friendResponse.friends.map((friend) => friend.friendee),
        rooms,
      }
    },
    queryKey: ['landing', session?.user ?? 'guest'],
  })

  const landingData = landingQuery.data ?? {
    favoriteRooms: [],
    friendNames: [],
    rooms: [],
  }
  const roomSections = buildRoomSections({
    favoriteRooms: landingData.favoriteRooms,
    friendNames: landingData.friendNames,
    rooms: landingData.rooms,
    username: session?.user ?? '',
  })
  const favoriteRoutes = new Set(
    landingData.favoriteRooms.map((room) => room.route),
  )

  return (
    <>
      <PageMetadata
        description="Discover public rooms, reconnect with favorite spaces, and launch fresh synchronized watch parties on the new React Streamshore frontend."
        title="Streamshore | Discover"
      />
      <AppShell
        actions={
          <>
            <Link
              css={[baseButtonStyles, buttonStyles.secondary]}
              to="/search?q=watch"
            >
              Search Rooms
            </Link>
            <Link
              css={[baseButtonStyles, buttonStyles.primary]}
              to={isAuthenticated ? '/create-room' : '/register'}
            >
              {isAuthenticated ? 'Launch a room' : 'Create an account'}
            </Link>
          </>
        }
        eyebrow="Realtime rooms"
        subtitle="The Vue-era feature set now sits behind a faster route tree, stronger client state boundaries, and a slimmer initial bundle."
        title="Watch together without the old frontend drag."
        description="Streamshore keeps synchronized playback, live chat, playlists, and moderation tools, but this migration rebuilds the product around modern React patterns and a denser control-room UI."
      >
        <div css={contentStyles}>
          <div css={heroMetricsStyles}>
            {getLandingMetrics(landingData).map((metric) => (
              <section key={metric.label} css={[panelStyles, metricCardStyles]}>
                <p css={metricValueStyles}>{metric.value}</p>
                <p css={metricLabelStyles}>{metric.label}</p>
              </section>
            ))}
          </div>

          {roomSections.map((section) => (
            <RoomSection
              key={section.title}
              favoriteRoutes={favoriteRoutes}
              rooms={section.rooms}
              title={section.title}
            />
          ))}
        </div>
      </AppShell>
    </>
  )
}
