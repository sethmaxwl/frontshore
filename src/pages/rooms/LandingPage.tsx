import { Button, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { PageHero } from '@/components/layout/PageHero'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { RoomSection } from '@/features/rooms/components/RoomSection'
import { fetchFavorites, fetchFriends, fetchRooms } from '@/lib/api/streamshore'
import { buildRoomSections } from '@/lib/utils/rooms'

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
        description="Discover public rooms, reconnect with favorite spaces, and launch fresh synchronized watch parties on Streamshore."
        title="Streamshore | Discover"
      />
      <PageHero
        actions={
          <Button
            component={Link}
            to={isAuthenticated ? '/create-room' : '/register'}
            size="md"
          >
            {isAuthenticated ? 'Launch a room' : 'Create an account'}
          </Button>
        }
        subtitle="Synchronized playback, live chat, playlists, and moderation tools in one dense control room."
        title="Watch together, in sync."
        description="Discover active rooms, jump back into your favorites, or spin up a new one for your group."
      >
        <Stack gap="xl">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {getLandingMetrics(landingData).map((metric) => (
              <Paper key={metric.label} p="lg" radius="md" withBorder>
                <Stack gap={4}>
                  <Text fw={800} size="xl">
                    {metric.value}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {metric.label}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>

          {roomSections.map((section) => (
            <RoomSection
              key={section.title}
              favoriteRoutes={favoriteRoutes}
              rooms={section.rooms}
              title={section.title}
            />
          ))}
        </Stack>
      </PageHero>
    </>
  )
}
