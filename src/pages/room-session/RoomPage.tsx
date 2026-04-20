import { Button, Center, Grid, Group, Loader, Tabs } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import { PageHero } from '@/components/layout/PageHero'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { ChatPanel } from '@/features/room-session/components/ChatPanel'
import { QueuePanel } from '@/features/room-session/components/QueuePanel'
import { RoomSettingsDialog } from '@/features/room-session/components/RoomSettingsDialog'
import { RoomUsersPanel } from '@/features/room-session/components/RoomUsersPanel'
import { RoomVideoPlayer } from '@/features/room-session/components/RoomVideoPlayer'
import { useRoomSession } from '@/features/room-session/hooks/useRoomSession'
import { getPresenceUsers } from '@/features/room-session/utils/reducer'
import { getApiErrorMessage } from '@/lib/api/client'
import {
  addFavorite,
  addVideoToQueue,
  deleteRoom,
  fetchFavoriteStatus,
  fetchPlaylistVideos,
  fetchPlaylists,
  fetchRoomBySlug,
  fetchRoomSettings,
  moveQueueVideoToFront,
  removeFavorite,
  removeQueueVideo,
  updateRoom,
  updateRoomPermission,
} from '@/lib/api/streamshore'
import type {
  PlaylistWithVideos,
  RoomSettingsDraft,
} from '@/lib/types/streamshore'

export default function RoomPage(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { room: roomSlug = '' } = useParams()
  const { ensureGuestSession, isAuthenticated, session } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const bootstrapQuery = useQuery({
    enabled: roomSlug.length > 0,
    queryFn: async () => {
      const roomPromise = fetchRoomBySlug(roomSlug)
      const sessionPromise = session?.token
        ? Promise.resolve(session)
        : ensureGuestSession()

      const [room] = await Promise.all([roomPromise, sessionPromise])

      return room
    },
    queryKey: ['room-bootstrap', roomSlug, session?.user ?? 'guest'],
    retry: 0,
  })

  useEffect(() => {
    if (!bootstrapQuery.isError) {
      return
    }

    void navigate('/404', { replace: true })
  }, [bootstrapQuery.isError, navigate])

  const activeSession = session
  const currentUser = activeSession?.user ?? ''

  const roomSession = useRoomSession({
    currentUser,
    onBanned: () => {
      notifications.show({
        color: 'red',
        message: 'You have been banned from this room.',
      })
      void navigate('/')
    },
    onDeleted: () => {
      notifications.show({
        color: 'red',
        message: 'This room has been deleted.',
      })
      void navigate('/')
    },
    onMissingRoom: () => {
      void navigate('/404', { replace: true })
    },
    roomSlug,
    token: activeSession?.token ?? '',
  })

  const room = roomSession.state.room
  const roomUsers = getPresenceUsers(roomSession.state)
  const roomPermission = roomSession.state.permission
  const isAnonymousViewer = !isAuthenticated
  const canAddToQueue =
    room !== null &&
    (!isAnonymousViewer || room.anon_queue === 1) &&
    roomPermission >= room.queue_level
  const canChat =
    room !== null &&
    (!isAnonymousViewer || room.anon_chat === 1) &&
    roomPermission >= room.chat_level
  const isChatDisabled = !canChat
  const canSkipVideo = roomPermission >= 50
  const votingEnabled = room?.vote_enable === 1

  const favoriteQuery = useQuery({
    enabled: Boolean(isAuthenticated && currentUser && roomSlug),
    queryFn: async () => fetchFavoriteStatus(currentUser, roomSlug),
    queryKey: ['room', roomSlug, 'favorite', currentUser],
  })

  const playlistsQuery = useQuery({
    enabled: Boolean(isAuthenticated && currentUser),
    queryFn: async (): Promise<PlaylistWithVideos[]> => {
      const playlists = await fetchPlaylists(currentUser)
      const videos = await Promise.all(
        playlists.map(async (playlist) =>
          fetchPlaylistVideos(currentUser, playlist.name),
        ),
      )

      return playlists.map((playlist, index) => ({
        ...playlist,
        videos: videos[index] ?? [],
      }))
    },
    queryKey: ['room', roomSlug, 'playlists', currentUser],
  })

  const settingsQuery = useQuery({
    enabled: settingsOpen && roomPermission >= 50,
    queryFn: async (): Promise<RoomSettingsDraft> =>
      fetchRoomSettings(roomSlug),
    queryKey: ['room', roomSlug, 'settings'],
  })

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to favorite a room')
      }

      if (favoriteQuery.data) {
        return removeFavorite(currentUser, roomSlug)
      }

      return addFavorite(currentUser, roomSlug)
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to update favorite'),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({
        queryKey: ['room', roomSlug, 'favorite', currentUser],
      })
      notifications.show({
        color: 'teal',
        message: favoriteQuery.data
          ? 'Removed room from favorites.'
          : 'Added room to favorites.',
      })
    },
  })

  const queueMutation = useMutation({
    mutationFn: async (videoId: string) =>
      addVideoToQueue(roomSlug, { id: videoId, user: currentUser }),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to add video to queue'),
      })
    },
  })

  const queueMoveMutation = useMutation({
    mutationFn: async (index: number) => moveQueueVideoToFront(roomSlug, index),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to reorder queue'),
      })
    },
  })

  const queueRemoveMutation = useMutation({
    mutationFn: async (index: number) => removeQueueVideo(roomSlug, index),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to remove video'),
      })
    },
  })

  const permissionMutation = useMutation({
    mutationFn: async (payload: {
      permission: 0 | 5 | 10 | 50
      username: string
    }) => updateRoomPermission(roomSlug, payload.username, payload.permission),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to update permissions'),
      })
    },
  })

  const settingsMutation = useMutation({
    mutationFn: async (draft: RoomSettingsDraft) => updateRoom(roomSlug, draft),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to save room settings'),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['room', roomSlug, 'settings'],
      })
      notifications.show({ color: 'teal', message: 'Room settings saved.' })
      setSettingsOpen(false)
    },
  })

  const deleteRoomMutation = useMutation({
    mutationFn: async () => deleteRoom(roomSlug),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to delete room'),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      notifications.show({ color: 'teal', message: 'Room deleted.' })
      void navigate('/')
    },
  })

  if (bootstrapQuery.isPending || !room || !activeSession?.token) {
    return (
      <Center h="50vh">
        <Loader />
      </Center>
    )
  }

  const openDeleteConfirm = (): void => {
    modals.openConfirmModal({
      title: `Delete ${room.name}?`,
      children:
        'Everyone connected will be removed and the room route will stop working.',
      labels: { cancel: 'Cancel', confirm: 'Delete room' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteRoomMutation.mutate()
      },
    })
  }

  return (
    <>
      <PageMetadata
        description={`Join ${room.name} on Streamshore for synchronized playback, live chat, and queue control.`}
        title={`Streamshore | ${room.name}`}
      />
      <PageHero
        actions={
          <Group gap="sm" wrap="wrap">
            {isAuthenticated ? (
              <Button
                onClick={() => favoriteMutation.mutate()}
                variant="default"
                type="button"
              >
                {favoriteQuery.data ? 'Unfavorite' : 'Favorite'}
              </Button>
            ) : null}
            {roomPermission >= 50 ? (
              <Button
                onClick={() => setSettingsOpen(true)}
                variant="default"
                type="button"
              >
                Room settings
              </Button>
            ) : null}
          </Group>
        }
        eyebrow="Live room"
        subtitle={
          room.motd || 'No welcome message configured for this room yet.'
        }
        title={room.name}
        description={`Hosted by ${room.owner}. Permission level ${roomPermission}. ${
          room.privacy === 0 ? 'Public room' : 'Private room'
        }.`}
      >
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <RoomVideoPlayer
              canSkipVideo={canSkipVideo}
              currentVideo={roomSession.state.currentVideo}
              key={roomSession.state.currentVideo?.id ?? 'empty'}
              onSkipVideo={roomSession.skipVideo}
              onVoteToSkip={roomSession.voteToSkip}
              syncTime={roomSession.state.syncTime}
              votingEnabled={votingEnabled}
            />
            <div style={{ marginTop: 'var(--mantine-spacing-md)' }}>
              <QueuePanel
                canAddToQueue={canAddToQueue}
                currentUser={currentUser}
                onAddVideo={(videoId) => queueMutation.mutate(videoId)}
                onMoveToFront={(index) => queueMoveMutation.mutate(index)}
                onRemoveVideo={(index) => queueRemoveMutation.mutate(index)}
                permission={roomPermission}
                playlists={playlistsQuery.data ?? []}
                queuedVideos={roomSession.state.queuedVideos}
              />
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Tabs defaultValue="chat">
              <Tabs.List>
                <Tabs.Tab value="chat">Chat</Tabs.Tab>
                <Tabs.Tab value="users">Users</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="chat" pt="md">
                <ChatPanel
                  currentUser={currentUser}
                  disabled={isChatDisabled}
                  messages={roomSession.state.messages}
                  onDeleteMessage={roomSession.deleteMessage}
                  onSendMessage={roomSession.sendChat}
                  permission={roomPermission}
                  users={roomUsers}
                />
              </Tabs.Panel>

              <Tabs.Panel value="users" pt="md">
                <RoomUsersPanel
                  currentPermission={roomPermission}
                  currentUser={currentUser}
                  onUpdatePermission={(username, permission) => {
                    permissionMutation.mutate({ permission, username })
                  }}
                  users={roomUsers}
                />
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
        </Grid>

        <RoomSettingsDialog
          initialValues={settingsQuery.data}
          isLoading={settingsQuery.isPending}
          onDeleteRoom={openDeleteConfirm}
          onOpenChange={setSettingsOpen}
          onSubmit={(draft) => settingsMutation.mutate(draft)}
          open={settingsOpen}
        />
      </PageHero>
    </>
  )
}
