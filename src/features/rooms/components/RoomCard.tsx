import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import {
  addFavorite,
  defaultRoomThumbnail,
  removeFavorite,
} from '@/lib/api/streamshore'
import type { RoomSummary } from '@/lib/types/streamshore'

type RoomCardProps = {
  favoriteRoom?: boolean
  room: RoomSummary
}

export function RoomCard({
  favoriteRoom = false,
  room,
}: RoomCardProps): JSX.Element {
  const queryClient = useQueryClient()
  const { isAuthenticated, session } = useAuth()

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        return
      }

      if (favoriteRoom) {
        await removeFavorite(session.user, room.route)
        return
      }

      await addFavorite(session.user, room.route)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({
        queryKey: ['room', room.route, 'favorite'],
      })
      notifications.show({
        color: 'teal',
        message: favoriteRoom
          ? `${room.name} removed from your favorites.`
          : `${room.name} added to your favorites.`,
      })
    },
  })

  return (
    <Card
      component={Link}
      to={`/${room.route}`}
      padding="md"
      radius="lg"
      withBorder
      shadow="sm"
      style={{ textDecoration: 'none', height: '100%' }}
    >
      <Card.Section>
        <Image
          alt={`${room.name} room thumbnail`}
          src={room.thumbnail ?? defaultRoomThumbnail}
          height={160}
          fit="cover"
        />
      </Card.Section>

      <Stack gap="sm" mt="md" style={{ flex: 1 }}>
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="sm"
        >
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Title order={3} size="h5" lineClamp={1}>
              {room.name}
            </Title>
            <Text c="dimmed" size="sm">
              Hosted by {room.owner}
            </Text>
          </Stack>
          {isAuthenticated ? (
            <ActionIcon
              aria-label={
                favoriteRoom
                  ? `Remove ${room.name} from favorites`
                  : `Add ${room.name} to favorites`
              }
              color={favoriteRoom ? 'yellow' : 'gray'}
              disabled={favoriteMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                favoriteMutation.mutate()
              }}
              variant={favoriteRoom ? 'light' : 'default'}
              size="lg"
              radius="xl"
            >
              <span aria-hidden>{favoriteRoom ? '♥' : '♡'}</span>
            </ActionIcon>
          ) : null}
        </Group>

        <Group justify="space-between" mt="auto">
          <Text c="dimmed" size="sm">
            {room.users} {room.users === 1 ? 'user' : 'users'}
          </Text>
          <Badge
            color={room.privacy === 0 ? 'teal' : 'gray'}
            variant="light"
            radius="xl"
          >
            {room.privacy === 0 ? 'Public' : 'Private'}
          </Badge>
        </Group>
      </Stack>
    </Card>
  )
}
