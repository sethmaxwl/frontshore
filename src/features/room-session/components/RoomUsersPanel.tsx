import { Button, Divider, Group, Paper, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { JSX } from 'react'

import { useAuth } from '@/app/providers/AuthProvider'
import { getApiErrorMessage } from '@/lib/api/client'
import { createFriendRequest } from '@/lib/api/streamshore'
import type { PresenceUser } from '@/lib/types/streamshore'

type RoomUsersPanelProps = {
  currentPermission: number
  currentUser: string
  onUpdatePermission: (username: string, permission: 0 | 5 | 10 | 50) => void
  users: PresenceUser[]
}

export function RoomUsersPanel({
  currentPermission,
  currentUser,
  onUpdatePermission,
  users,
}: RoomUsersPanelProps): JSX.Element {
  const queryClient = useQueryClient()
  const { isAuthenticated, session } = useAuth()
  const addFriendMutation = useMutation({
    mutationFn: async (friend: string) => {
      if (!session?.user) {
        throw new Error('You must be logged in to add friends')
      }

      return createFriendRequest(session.user, friend)
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to send friend request'),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      notifications.show({ color: 'teal', message: 'Friend request sent.' })
    },
  })

  if (users.length === 0) {
    return (
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="xs">
          <Text fw={600}>Nobody is connected yet</Text>
          <Text c="dimmed" size="sm">
            Presence data will appear here after users join the room.
          </Text>
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack gap="sm">
      {users.map((user, index) => {
        const canModerate = currentPermission >= 50 && user.name !== currentUser
        const canPromote =
          currentPermission === 100 &&
          user.name !== currentUser &&
          !user.anon &&
          user.permission < 50

        return (
          <div key={user.name}>
            {index > 0 ? <Divider mb="sm" /> : null}
            <Group
              justify="space-between"
              wrap="wrap"
              gap="sm"
              align="flex-start"
            >
              <Stack gap={2}>
                <Text fw={700}>
                  {user.name}
                  {user.name === currentUser ? ' • You' : ''}
                </Text>
                <Text c="dimmed" size="sm">
                  {user.anon ? 'Anonymous guest' : 'Authenticated user'} •
                  Permission {user.permission}
                </Text>
              </Stack>
              <Group gap="xs" wrap="wrap">
                {isAuthenticated && !user.anon && user.name !== currentUser ? (
                  <Button
                    onClick={() => addFriendMutation.mutate(user.name)}
                    size="xs"
                    variant="default"
                    type="button"
                  >
                    Add friend
                  </Button>
                ) : null}
                {canPromote ? (
                  <Button
                    onClick={() => onUpdatePermission(user.name, 50)}
                    size="xs"
                    variant="default"
                    type="button"
                  >
                    Promote
                  </Button>
                ) : null}
                {canModerate && user.permission !== 5 ? (
                  <Button
                    onClick={() => onUpdatePermission(user.name, 5)}
                    size="xs"
                    variant="default"
                    type="button"
                  >
                    Mute
                  </Button>
                ) : null}
                {canModerate && user.permission === 5 ? (
                  <Button
                    onClick={() => onUpdatePermission(user.name, 10)}
                    size="xs"
                    variant="default"
                    type="button"
                  >
                    Unmute
                  </Button>
                ) : null}
                {canModerate && user.permission < 50 ? (
                  <Button
                    color="red"
                    onClick={() => onUpdatePermission(user.name, 0)}
                    size="xs"
                    variant="light"
                    type="button"
                  >
                    Ban
                  </Button>
                ) : null}
              </Group>
            </Group>
          </div>
        )
      })}
    </Stack>
  )
}
