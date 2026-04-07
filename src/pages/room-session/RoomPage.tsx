import { css } from '@compiled/react'
import * as Tabs from '@radix-ui/react-tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  baseButtonStyles,
  buttonStyles,
} from '../../components/primitives/styles.ts'

import { useAuth } from '@/app/providers/AuthProvider'
import { RouteFallback } from '@/components/feedback/RouteFallback'
import { AppShell } from '@/components/layout/AppShell'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
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

const layoutStyles = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'minmax(0, 1.65fr) minmax(20rem, 1fr)',
  '@media (max-width: 960px)': {
    gridTemplateColumns: '1fr',
  },
})

const columnStyles = css({
  display: 'grid',
  gap: '1rem',
})

const topRowStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
})

const tabListStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
})

const tabTriggerStyles = css({
  alignItems: 'center',
  appearance: 'none',
  background: 'rgba(8, 17, 30, 0.48)',
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  fontWeight: 700,
  justifyContent: 'center',
  minHeight: '2.9rem',
  padding: '0.7rem 1rem',
  '&[data-state="active"]': {
    background: 'rgba(34, 211, 238, 0.14)',
    borderColor: 'rgba(34, 211, 238, 0.24)',
    color: 'var(--color-text-strong)',
  },
})

const sidebarContentStyles = css({
  display: 'grid',
  gap: '1rem',
  marginTop: '1rem',
})

export default function RoomPage(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { room: roomSlug = '' } = useParams()
  const { ensureGuestSession, isAuthenticated, session } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
      toast.error('You have been banned from this room.')
      void navigate('/')
    },
    onDeleted: () => {
      toast.error('This room has been deleted.')
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
      toast.error(getApiErrorMessage(error, 'Unable to update favorite'))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({
        queryKey: ['room', roomSlug, 'favorite', currentUser],
      })
      toast.success(
        favoriteQuery.data
          ? 'Removed room from favorites.'
          : 'Added room to favorites.',
      )
    },
  })

  const queueMutation = useMutation({
    mutationFn: async (videoId: string) =>
      addVideoToQueue(roomSlug, { id: videoId, user: currentUser }),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add video to queue'))
    },
  })

  const queueMoveMutation = useMutation({
    mutationFn: async (index: number) => moveQueueVideoToFront(roomSlug, index),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to reorder queue'))
    },
  })

  const queueRemoveMutation = useMutation({
    mutationFn: async (index: number) => removeQueueVideo(roomSlug, index),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to remove video'))
    },
  })

  const permissionMutation = useMutation({
    mutationFn: async (payload: {
      permission: 0 | 5 | 10 | 50
      username: string
    }) => updateRoomPermission(roomSlug, payload.username, payload.permission),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update permissions'))
    },
  })

  const settingsMutation = useMutation({
    mutationFn: async (draft: RoomSettingsDraft) => updateRoom(roomSlug, draft),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save room settings'))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['room', roomSlug, 'settings'],
      })
      toast.success('Room settings saved.')
      setSettingsOpen(false)
    },
  })

  const deleteRoomMutation = useMutation({
    mutationFn: async () => deleteRoom(roomSlug),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete room'))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Room deleted.')
      void navigate('/')
    },
  })

  if (bootstrapQuery.isPending || !room || !activeSession?.token) {
    return <RouteFallback />
  }

  return (
    <>
      <PageMetadata
        description={`Join ${room.name} on Streamshore for synchronized playback, live chat, and queue control.`}
        title={`Streamshore | ${room.name}`}
      />
      <AppShell
        actions={
          <div css={topRowStyles}>
            {isAuthenticated ? (
              <button
                css={[baseButtonStyles, buttonStyles.secondary]}
                onClick={() => {
                  favoriteMutation.mutate()
                }}
                type="button"
              >
                {favoriteQuery.data ? 'Unfavorite' : 'Favorite'}
              </button>
            ) : null}
            {roomPermission >= 50 ? (
              <button
                css={[baseButtonStyles, buttonStyles.secondary]}
                onClick={() => {
                  setSettingsOpen(true)
                }}
                type="button"
              >
                Room settings
              </button>
            ) : null}
          </div>
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
        <div css={layoutStyles}>
          <div css={columnStyles}>
            <RoomVideoPlayer
              canSkipVideo={canSkipVideo}
              currentVideo={roomSession.state.currentVideo}
              key={roomSession.state.currentVideo?.id ?? 'empty'}
              onSkipVideo={roomSession.skipVideo}
              onVoteToSkip={roomSession.voteToSkip}
              syncTime={roomSession.state.syncTime}
              votingEnabled={votingEnabled}
            />
            <QueuePanel
              canAddToQueue={canAddToQueue}
              currentUser={currentUser}
              onAddVideo={(videoId) => {
                queueMutation.mutate(videoId)
              }}
              onMoveToFront={(index) => {
                queueMoveMutation.mutate(index)
              }}
              onRemoveVideo={(index) => {
                queueRemoveMutation.mutate(index)
              }}
              permission={roomPermission}
              playlists={playlistsQuery.data ?? []}
              queuedVideos={roomSession.state.queuedVideos}
            />
          </div>

          <div css={columnStyles}>
            <Tabs.Root defaultValue="chat">
              <Tabs.List css={tabListStyles}>
                <Tabs.Trigger css={tabTriggerStyles} value="chat">
                  Chat
                </Tabs.Trigger>
                <Tabs.Trigger css={tabTriggerStyles} value="users">
                  Users
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content css={sidebarContentStyles} value="chat">
                <ChatPanel
                  currentUser={currentUser}
                  disabled={isChatDisabled}
                  messages={roomSession.state.messages}
                  onDeleteMessage={roomSession.deleteMessage}
                  onSendMessage={roomSession.sendChat}
                  permission={roomPermission}
                  users={roomUsers}
                />
              </Tabs.Content>

              <Tabs.Content css={sidebarContentStyles} value="users">
                <RoomUsersPanel
                  currentPermission={roomPermission}
                  currentUser={currentUser}
                  onUpdatePermission={(username, permission) => {
                    permissionMutation.mutate({ permission, username })
                  }}
                  users={roomUsers}
                />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>

        <RoomSettingsDialog
          initialValues={settingsQuery.data}
          isLoading={settingsQuery.isPending}
          onDeleteRoom={() => {
            setDeleteDialogOpen(true)
          }}
          onOpenChange={setSettingsOpen}
          onSubmit={(draft) => {
            settingsMutation.mutate(draft)
          }}
          open={settingsOpen}
        />
        <ConfirmDialog
          confirmLabel="Delete room"
          description="Everyone connected will be removed and the room route will stop working."
          onConfirm={() => {
            deleteRoomMutation.mutate()
          }}
          onOpenChange={setDeleteDialogOpen}
          open={deleteDialogOpen}
          title={`Delete ${room.name}?`}
        >
          <span />
        </ConfirmDialog>
      </AppShell>
    </>
  )
}
