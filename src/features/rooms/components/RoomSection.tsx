import { Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { JSX } from 'react'

import { RoomCard } from '@/features/rooms/components/RoomCard'
import type { RoomSummary } from '@/lib/types/streamshore'

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
    <Stack gap="md" component="section">
      <Title order={2} size="h4">
        {title}
      </Title>
      {rooms.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
          {rooms.map((room) => (
            <RoomCard
              key={room.route}
              favoriteRoom={favoriteRoutes?.has(room.route) ?? false}
              room={room}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="xs">
            <Text fw={600}>No rooms in {title}</Text>
            <Text c="dimmed" size="sm">
              {emptyDescription}
            </Text>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
