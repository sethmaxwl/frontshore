import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Tabs from '@radix-ui/react-tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { JSX } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
  inlineLinkStyles,
} from '../../components/primitives/styles.ts'

import { useAuth } from '@/app/providers/AuthProvider'
import { FormField } from '@/components/forms/FormField'
import { AppShell } from '@/components/layout/AppShell'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { SurfaceCard } from '@/components/primitives/SurfaceCard'
import { RoomSection } from '@/features/rooms/components/RoomSection'
import { getApiErrorMessage } from '@/lib/api/client'
import {
  changePassword,
  createFriendRequest,
  createPlaylist,
  deleteAccount,
  deleteFriend,
  deletePlaylist,
  deleteRoom,
  fetchFavorites,
  fetchFriends,
  fetchPlaylistVideos,
  fetchPlaylists,
  fetchRooms,
  fetchUserTracking,
  removeVideoFromPlaylist,
  addVideoToPlaylist,
  renamePlaylist,
  updateFriendRelationship,
} from '@/lib/api/streamshore'
import type {
  FriendRelationship,
  PlaylistWithVideos,
  RoomSummary,
} from '@/lib/types/streamshore'
import { sortRoomsByActivity } from '@/lib/utils/rooms'

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

const tabContentStyles = css({
  display: 'grid',
  gap: '1rem',
  marginTop: '1rem',
})

const cardListStyles = css({
  display: 'grid',
  gap: '1rem',
})

const rowStyles = css({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
})

const headingStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1rem',
  fontWeight: 800,
  margin: 0,
})

const subcopyStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const stackedFormStyles = css({
  display: 'grid',
  gap: '0.9rem',
})

const listItemStyles = css({
  alignItems: 'center',
  borderTop: '1px solid rgba(148, 163, 184, 0.12)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
  paddingTop: '0.9rem',
})

const valueStackStyles = css({
  display: 'grid',
  gap: '0.2rem',
})

const valueTitleStyles = css({
  color: 'var(--color-text-strong)',
  fontWeight: 700,
  margin: 0,
})

const valueMetaStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const actionWrapStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.55rem',
})

const identityCardStyles = css({
  alignItems: 'center',
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-between',
  padding: '1rem',
})

const identityValueStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.3rem',
  fontWeight: 800,
  margin: 0,
})

type ProfileData = {
  favoriteRooms: RoomSummary[]
  friends: FriendRelationship[]
  myRooms: RoomSummary[]
  playlists: PlaylistWithVideos[]
  requests: Array<{ friendee: string }>
}

const passwordSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
        'Password must include upper, lower, number, special, and 8+ characters',
      ),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordValues = z.infer<typeof passwordSchema>

type FriendRowProps = {
  friend: FriendRelationship
  onDeleteNickname: (friendName: string) => void
  onSetNickname: (friendName: string, nickname: string) => void
  onUnfriend: (friendName: string) => void
}

function FriendRow({
  friend,
  onDeleteNickname,
  onSetNickname,
  onUnfriend,
}: FriendRowProps): JSX.Element {
  const [nickname, setNickname] = useState(friend.nickname ?? '')

  return (
    <div css={listItemStyles}>
      <div css={valueStackStyles}>
        <p css={valueTitleStyles}>
          {friend.nickname ?? friend.friendee}
          {friend.tracking.online
            ? ` • Online in ${friend.tracking.room ?? 'a room'}`
            : ''}
        </p>
        <p css={valueMetaStyles}>
          {friend.nickname ? `${friend.friendee} • ` : ''}
          Hosting {friend.rooms.length} room
          {friend.rooms.length === 1 ? '' : 's'}
        </p>
      </div>
      <div css={actionWrapStyles}>
        {friend.tracking.online && friend.tracking.room ? (
          <Link
            css={[baseButtonStyles, buttonStyles.secondary]}
            to={`/${friend.tracking.room}`}
          >
            Join room
          </Link>
        ) : null}
        <input
          css={fieldStyles.input}
          onChange={(event) => {
            setNickname(event.currentTarget.value)
          }}
          placeholder="Nickname"
          value={nickname}
        />
        <button
          css={[baseButtonStyles, buttonStyles.secondary]}
          onClick={() => {
            onSetNickname(friend.friendee, nickname)
          }}
          type="button"
        >
          Save nickname
        </button>
        {friend.nickname ? (
          <button
            css={[baseButtonStyles, buttonStyles.secondary]}
            onClick={() => {
              onDeleteNickname(friend.friendee)
            }}
            type="button"
          >
            Remove nickname
          </button>
        ) : null}
        <button
          css={[baseButtonStyles, buttonStyles.danger]}
          onClick={() => {
            onUnfriend(friend.friendee)
          }}
          type="button"
        >
          Unfriend
        </button>
      </div>
    </div>
  )
}

type PlaylistCardProps = {
  onAddVideo: (playlistName: string, url: string) => void
  onDelete: (playlistName: string) => void
  onDeleteVideo: (playlistName: string, videoId: string) => void
  onRename: (playlistName: string, nextName: string) => void
  playlist: PlaylistWithVideos
}

function PlaylistCard({
  onAddVideo,
  onDelete,
  onDeleteVideo,
  onRename,
  playlist,
}: PlaylistCardProps): JSX.Element {
  const [nextTitle, setNextTitle] = useState(playlist.name)
  const [videoUrl, setVideoUrl] = useState('')

  return (
    <SurfaceCard as="section">
      <div css={cardListStyles}>
        <div css={rowStyles}>
          <div css={valueStackStyles}>
            <p css={valueTitleStyles}>{playlist.name}</p>
            <p css={valueMetaStyles}>
              {playlist.videos.length} video
              {playlist.videos.length === 1 ? '' : 's'}
            </p>
          </div>
          <div css={actionWrapStyles}>
            <input
              css={fieldStyles.input}
              onChange={(event) => {
                setNextTitle(event.currentTarget.value)
              }}
              value={nextTitle}
            />
            <button
              css={[baseButtonStyles, buttonStyles.secondary]}
              onClick={() => {
                onRename(playlist.name, nextTitle)
              }}
              type="button"
            >
              Rename
            </button>
            <button
              css={[baseButtonStyles, buttonStyles.danger]}
              onClick={() => {
                onDelete(playlist.name)
              }}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>

        <div css={stackedFormStyles}>
          <FormField label="Add a YouTube URL">
            <input
              css={fieldStyles.input}
              onChange={(event) => {
                setVideoUrl(event.currentTarget.value)
              }}
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
            />
          </FormField>
          <button
            css={[baseButtonStyles, buttonStyles.primary]}
            onClick={() => {
              onAddVideo(playlist.name, videoUrl)
              setVideoUrl('')
            }}
            type="button"
          >
            Add video
          </button>
        </div>

        <div css={cardListStyles}>
          {playlist.videos.map((video) => (
            <div key={`${playlist.name}-${video.id}`} css={listItemStyles}>
              <div css={valueStackStyles}>
                <p css={valueTitleStyles}>{video.title}</p>
                <p css={valueMetaStyles}>{video.channel}</p>
              </div>
              <button
                css={[baseButtonStyles, buttonStyles.danger]}
                onClick={() => {
                  onDeleteVideo(playlist.name, video.id)
                }}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  )
}

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout, session } = useAuth()
  const [friendInput, setFriendInput] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const passwordForm = useForm<PasswordValues>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    resolver: zodResolver(passwordSchema),
  })

  const username = session?.user ?? ''

  const profileQuery = useQuery({
    enabled: username.length > 0,
    queryFn: async (): Promise<ProfileData> => {
      const [rooms, favoriteRooms, friendResponse, playlists] =
        await Promise.all([
          fetchRooms(),
          fetchFavorites(username),
          fetchFriends(username),
          fetchPlaylists(username),
        ])
      const friendNames = friendResponse.friends.map(
        (friend) => friend.friendee,
      )
      const [trackingList, playlistVideos] = await Promise.all([
        Promise.all(
          friendNames.map(async (friend) => fetchUserTracking(friend)),
        ),
        Promise.all(
          playlists.map(async (playlist) =>
            fetchPlaylistVideos(username, playlist.name),
          ),
        ),
      ])

      return {
        favoriteRooms: favoriteRooms.toSorted(sortRoomsByActivity),
        friends: friendResponse.friends.map((friend, index) => ({
          friendee: friend.friendee,
          nickname: friend.nickname,
          rooms: rooms
            .filter((room) => room.owner === friend.friendee)
            .toSorted(sortRoomsByActivity),
          tracking: trackingList[index] ?? { online: false, room: null },
        })),
        myRooms: rooms
          .filter((room) => room.owner === username)
          .toSorted(sortRoomsByActivity),
        playlists: playlists.map((playlist, index) => ({
          ...playlist,
          videos: playlistVideos[index] ?? [],
        })),
        requests: friendResponse.requests,
      }
    },
    queryKey: ['profile', username],
  })

  function invalidateProfileData(): void {
    void queryClient.invalidateQueries({ queryKey: ['landing'] })
    void queryClient.invalidateQueries({ queryKey: ['profile', username] })
    void queryClient.invalidateQueries({ queryKey: ['rooms'] })
  }

  const addFriendMutation = useMutation({
    mutationFn: async (targetFriend: string) =>
      createFriendRequest(username, targetFriend),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to send friend request'))
    },
    onSuccess: () => {
      invalidateProfileData()
      setFriendInput('')
      toast.success('Friend request sent.')
    },
  })

  const updateFriendMutation = useMutation({
    mutationFn: async (payload: {
      body: Record<string, boolean | null | number | string>
      friend: string
    }) => updateFriendRelationship(username, payload.friend, payload.body),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update friend'))
    },
    onSuccess: () => {
      invalidateProfileData()
    },
  })

  const unfriendMutation = useMutation({
    mutationFn: async (friend: string) => deleteFriend(username, friend),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to remove friend'))
    },
    onSuccess: () => {
      invalidateProfileData()
      toast.success('Friend removed.')
    },
  })

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => createPlaylist(username, name),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create playlist'))
    },
    onSuccess: () => {
      invalidateProfileData()
      setPlaylistName('')
      toast.success('Playlist created.')
    },
  })

  const renamePlaylistMutation = useMutation({
    mutationFn: async (payload: { currentName: string; nextName: string }) =>
      renamePlaylist(username, payload.currentName, payload.nextName),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to rename playlist'))
    },
    onSuccess: () => {
      invalidateProfileData()
      toast.success('Playlist updated.')
    },
  })

  const deletePlaylistMutation = useMutation({
    mutationFn: async (name: string) => deletePlaylist(username, name),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete playlist'))
    },
    onSuccess: () => {
      invalidateProfileData()
      toast.success('Playlist deleted.')
    },
  })

  const addVideoMutation = useMutation({
    mutationFn: async (payload: { playlistName: string; url: string }) => {
      const url = new URL(payload.url)
      const videoId =
        url.searchParams.get('v') ?? url.pathname.split('/').at(-1)

      if (!videoId) {
        throw new Error('The YouTube URL is invalid')
      }

      return addVideoToPlaylist(username, payload.playlistName, videoId)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add video'))
    },
    onSuccess: () => {
      invalidateProfileData()
      toast.success('Video added to playlist.')
    },
  })

  const removeVideoMutation = useMutation({
    mutationFn: async (payload: { playlistName: string; videoId: string }) =>
      removeVideoFromPlaylist(username, payload.playlistName, payload.videoId),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to remove video'))
    },
    onSuccess: () => {
      invalidateProfileData()
      toast.success('Video removed from playlist.')
    },
  })

  const deleteRoomMutation = useMutation({
    mutationFn: deleteRoom,
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete room'))
    },
    onSuccess: () => {
      invalidateProfileData()
      toast.success('Room deleted.')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async ({ password }: PasswordValues) =>
      changePassword(username, password),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to change password'))
    },
    onSuccess: () => {
      passwordForm.reset()
      toast.success('Password updated.')
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async () => deleteAccount(username),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete account'))
    },
    onSuccess: () => {
      logout()
      void navigate('/login')
    },
  })

  const profileData = profileQuery.data ?? {
    favoriteRooms: [],
    friends: [],
    myRooms: [],
    playlists: [],
    requests: [],
  }

  return (
    <>
      <PageMetadata
        description="Manage your rooms, friendships, playlists, and account settings on Streamshore."
        title="Streamshore | Profile"
      />
      <AppShell
        eyebrow="Profile control room"
        title={username}
        description="Everything tied to your account lives here: favorites, playlists, social graph, room ownership, and account settings."
      >
        <div css={cardListStyles}>
          <SurfaceCard as="section">
            <div css={identityCardStyles}>
              <div css={valueStackStyles}>
                <p css={identityValueStyles}>{username}</p>
                <p css={valueMetaStyles}>
                  {session?.admin
                    ? 'Administrator access enabled'
                    : 'Standard room operator'}
                </p>
              </div>
              <Link
                css={[baseButtonStyles, buttonStyles.primary]}
                to="/create-room"
              >
                Create a room
              </Link>
            </div>
          </SurfaceCard>

          <Tabs.Root defaultValue="rooms">
            <Tabs.List css={tabListStyles}>
              <Tabs.Trigger css={tabTriggerStyles} value="rooms">
                Rooms
              </Tabs.Trigger>
              <Tabs.Trigger css={tabTriggerStyles} value="friends">
                Friends
              </Tabs.Trigger>
              <Tabs.Trigger css={tabTriggerStyles} value="playlists">
                Playlists
              </Tabs.Trigger>
              <Tabs.Trigger css={tabTriggerStyles} value="settings">
                Settings
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content css={tabContentStyles} value="rooms">
              <RoomSection
                rooms={profileData.favoriteRooms}
                title="Favorite rooms"
              />
              <SurfaceCard as="section">
                <div css={cardListStyles}>
                  <div css={rowStyles}>
                    <div css={valueStackStyles}>
                      <p css={headingStyles}>Rooms you own</p>
                      <p css={subcopyStyles}>
                        Delete stale rooms or jump back into active ones.
                      </p>
                    </div>
                  </div>
                  {profileData.myRooms.map((room) => (
                    <div key={room.route} css={listItemStyles}>
                      <div css={valueStackStyles}>
                        <p css={valueTitleStyles}>{room.name}</p>
                        <p css={valueMetaStyles}>
                          {room.users} users •{' '}
                          {room.privacy === 0 ? 'Public' : 'Private'}
                        </p>
                      </div>
                      <div css={actionWrapStyles}>
                        <Link
                          css={[baseButtonStyles, buttonStyles.secondary]}
                          to={`/${room.route}`}
                        >
                          Open room
                        </Link>
                        <button
                          css={[baseButtonStyles, buttonStyles.danger]}
                          onClick={() => {
                            deleteRoomMutation.mutate(room.route)
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </Tabs.Content>

            <Tabs.Content css={tabContentStyles} value="friends">
              <SurfaceCard as="section">
                <div css={cardListStyles}>
                  <div css={rowStyles}>
                    <div css={valueStackStyles}>
                      <p css={headingStyles}>Add a friend</p>
                      <p css={subcopyStyles}>Send a request by username.</p>
                    </div>
                  </div>
                  <div css={actionWrapStyles}>
                    <input
                      css={fieldStyles.input}
                      onChange={(event) => {
                        setFriendInput(event.currentTarget.value)
                      }}
                      placeholder="Friend username"
                      value={friendInput}
                    />
                    <button
                      css={[baseButtonStyles, buttonStyles.primary]}
                      onClick={() => {
                        if (friendInput.trim().length > 0) {
                          addFriendMutation.mutate(friendInput.trim())
                        }
                      }}
                      type="button"
                    >
                      Send request
                    </button>
                  </div>
                </div>
              </SurfaceCard>

              {profileData.requests.length > 0 ? (
                <SurfaceCard as="section">
                  <div css={cardListStyles}>
                    <p css={headingStyles}>Pending requests</p>
                    {profileData.requests.map((request) => (
                      <div key={request.friendee} css={listItemStyles}>
                        <div css={valueStackStyles}>
                          <p css={valueTitleStyles}>{request.friendee}</p>
                          <p css={valueMetaStyles}>Awaiting your decision</p>
                        </div>
                        <div css={actionWrapStyles}>
                          <button
                            css={[baseButtonStyles, buttonStyles.primary]}
                            onClick={() => {
                              updateFriendMutation.mutate({
                                body: { accepted: '1' },
                                friend: request.friendee,
                              })
                            }}
                            type="button"
                          >
                            Accept
                          </button>
                          <button
                            css={[baseButtonStyles, buttonStyles.secondary]}
                            onClick={() => {
                              updateFriendMutation.mutate({
                                body: { accepted: '0' },
                                friend: request.friendee,
                              })
                            }}
                            type="button"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>
              ) : null}

              <SurfaceCard as="section">
                <div css={cardListStyles}>
                  <p css={headingStyles}>Your friends</p>
                  {profileData.friends.map((friend) => (
                    <FriendRow
                      key={friend.friendee}
                      friend={friend}
                      onDeleteNickname={(friendName) => {
                        updateFriendMutation.mutate({
                          body: { nickname: null },
                          friend: friendName,
                        })
                      }}
                      onSetNickname={(friendName, nickname) => {
                        updateFriendMutation.mutate({
                          body: { nickname },
                          friend: friendName,
                        })
                      }}
                      onUnfriend={(friendName) => {
                        unfriendMutation.mutate(friendName)
                      }}
                    />
                  ))}
                </div>
              </SurfaceCard>
            </Tabs.Content>

            <Tabs.Content css={tabContentStyles} value="playlists">
              <SurfaceCard as="section">
                <div css={cardListStyles}>
                  <div css={rowStyles}>
                    <div css={valueStackStyles}>
                      <p css={headingStyles}>Create a playlist</p>
                      <p css={subcopyStyles}>
                        Playlists stay available when you add queue items in a
                        room.
                      </p>
                    </div>
                  </div>
                  <div css={actionWrapStyles}>
                    <input
                      css={fieldStyles.input}
                      onChange={(event) => {
                        setPlaylistName(event.currentTarget.value)
                      }}
                      placeholder="Playlist title"
                      value={playlistName}
                    />
                    <button
                      css={[baseButtonStyles, buttonStyles.primary]}
                      onClick={() => {
                        if (playlistName.trim().length > 0) {
                          createPlaylistMutation.mutate(playlistName.trim())
                        }
                      }}
                      type="button"
                    >
                      Create playlist
                    </button>
                  </div>
                </div>
              </SurfaceCard>

              {profileData.playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.name}
                  onAddVideo={(playlistName, url) => {
                    if (url.trim().length > 0) {
                      addVideoMutation.mutate({ playlistName, url })
                    }
                  }}
                  onDelete={(playlistName) => {
                    deletePlaylistMutation.mutate(playlistName)
                  }}
                  onDeleteVideo={(playlistName, videoId) => {
                    removeVideoMutation.mutate({ playlistName, videoId })
                  }}
                  onRename={(playlistName, nextName) => {
                    if (nextName.trim().length > 0) {
                      renamePlaylistMutation.mutate({
                        currentName: playlistName,
                        nextName: nextName.trim(),
                      })
                    }
                  }}
                  playlist={playlist}
                />
              ))}
            </Tabs.Content>

            <Tabs.Content css={tabContentStyles} value="settings">
              <SurfaceCard as="section">
                <div css={cardListStyles}>
                  <p css={headingStyles}>Change password</p>
                  <form
                    css={stackedFormStyles}
                    onSubmit={(event) => {
                      void passwordForm.handleSubmit((values) => {
                        changePasswordMutation.mutate(values)
                      })(event)
                    }}
                  >
                    <FormField
                      error={passwordForm.formState.errors.password?.message}
                      label="New password"
                    >
                      <input
                        css={fieldStyles.input}
                        type="password"
                        {...passwordForm.register('password')}
                      />
                    </FormField>
                    <FormField
                      error={
                        passwordForm.formState.errors.confirmPassword?.message
                      }
                      label="Confirm password"
                    >
                      <input
                        css={fieldStyles.input}
                        type="password"
                        {...passwordForm.register('confirmPassword')}
                      />
                    </FormField>
                    <button
                      css={[baseButtonStyles, buttonStyles.primary]}
                      disabled={changePasswordMutation.isPending}
                      type="submit"
                    >
                      Save password
                    </button>
                  </form>
                </div>
              </SurfaceCard>

              <SurfaceCard as="section">
                <div css={cardListStyles}>
                  <p css={headingStyles}>Danger zone</p>
                  <p css={subcopyStyles}>
                    Deleting your account signs you out immediately and removes
                    the current profile.
                  </p>
                  <ConfirmDialog
                    confirmLabel="Delete account"
                    description="This action cannot be undone."
                    onConfirm={() => {
                      deleteAccountMutation.mutate()
                    }}
                    onOpenChange={setAccountDialogOpen}
                    open={accountDialogOpen}
                    title="Delete your Streamshore account?"
                  >
                    <button
                      css={[baseButtonStyles, buttonStyles.danger]}
                      onClick={() => {
                        setAccountDialogOpen(true)
                      }}
                      type="button"
                    >
                      Delete account
                    </button>
                  </ConfirmDialog>
                </div>
              </SurfaceCard>
            </Tabs.Content>
          </Tabs.Root>

          <p css={subcopyStyles}>
            Looking for a fresh room?{' '}
            <Link css={inlineLinkStyles} to="/">
              Return to discovery
            </Link>
            .
          </p>
        </div>
      </AppShell>
    </>
  )
}
