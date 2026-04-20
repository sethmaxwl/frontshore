import {
  Anchor,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'
import type { JSX } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from '@/app/providers/AuthProvider'
import { PageHero } from '@/components/layout/PageHero'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { RoomSection } from '@/features/rooms/components/RoomSection'
import { getApiErrorMessage } from '@/lib/api/client'
import {
  addVideoToPlaylist,
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
  renamePlaylist,
  updateFriendRelationship,
} from '@/lib/api/streamshore'
import type {
  FriendRelationship,
  PlaylistWithVideos,
  RoomSummary,
} from '@/lib/types/streamshore'
import { sortRoomsByActivity } from '@/lib/utils/rooms'

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
    <Group justify="space-between" wrap="wrap" gap="sm" align="flex-start">
      <Stack gap={2}>
        <Text fw={700}>
          {friend.nickname ?? friend.friendee}
          {friend.tracking.online
            ? ` • Online in ${friend.tracking.room ?? 'a room'}`
            : ''}
        </Text>
        <Text c="dimmed" size="sm">
          {friend.nickname ? `${friend.friendee} • ` : ''}
          Hosting {friend.rooms.length} room
          {friend.rooms.length === 1 ? '' : 's'}
        </Text>
      </Stack>
      <Group gap="xs" wrap="wrap" align="flex-end">
        {friend.tracking.online && friend.tracking.room ? (
          <Button
            component={Link}
            to={`/${friend.tracking.room}`}
            size="xs"
            variant="default"
          >
            Join room
          </Button>
        ) : null}
        <TextInput
          aria-label={`Nickname for ${friend.friendee}`}
          onChange={(event) => setNickname(event.currentTarget.value)}
          placeholder="Nickname"
          size="xs"
          value={nickname}
        />
        <Button
          onClick={() => onSetNickname(friend.friendee, nickname)}
          size="xs"
          variant="default"
          type="button"
        >
          Save nickname
        </Button>
        {friend.nickname ? (
          <Button
            onClick={() => onDeleteNickname(friend.friendee)}
            size="xs"
            variant="default"
            type="button"
          >
            Remove nickname
          </Button>
        ) : null}
        <Button
          color="red"
          onClick={() => onUnfriend(friend.friendee)}
          size="xs"
          variant="light"
          type="button"
        >
          Unfriend
        </Button>
      </Group>
    </Group>
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
    <Paper p="md" radius="md" withBorder component="section">
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap" gap="sm" align="flex-start">
          <Stack gap={2}>
            <Text fw={700}>{playlist.name}</Text>
            <Text c="dimmed" size="sm">
              {playlist.videos.length} video
              {playlist.videos.length === 1 ? '' : 's'}
            </Text>
          </Stack>
          <Group gap="xs" wrap="wrap">
            <TextInput
              aria-label={`Rename ${playlist.name}`}
              onChange={(event) => setNextTitle(event.currentTarget.value)}
              size="xs"
              value={nextTitle}
            />
            <Button
              onClick={() => onRename(playlist.name, nextTitle)}
              size="xs"
              variant="default"
              type="button"
            >
              Rename
            </Button>
            <Button
              color="red"
              onClick={() => onDelete(playlist.name)}
              size="xs"
              variant="light"
              type="button"
            >
              Delete
            </Button>
          </Group>
        </Group>

        <Group gap="sm" align="flex-end" wrap="wrap">
          <TextInput
            label="Add a YouTube URL"
            onChange={(event) => setVideoUrl(event.currentTarget.value)}
            placeholder="https://youtube.com/watch?v=..."
            style={{ flex: 1, minWidth: 200 }}
            value={videoUrl}
          />
          <Button
            onClick={() => {
              onAddVideo(playlist.name, videoUrl)
              setVideoUrl('')
            }}
            type="button"
          >
            Add video
          </Button>
        </Group>

        <Stack gap="sm">
          {playlist.videos.map((video, index) => (
            <div key={`${playlist.name}-${video.id}`}>
              {index > 0 ? <Divider mb="sm" /> : null}
              <Group
                justify="space-between"
                wrap="wrap"
                gap="sm"
                align="flex-start"
              >
                <Stack gap={2}>
                  <Text fw={700}>{video.title}</Text>
                  <Text c="dimmed" size="sm">
                    {video.channel}
                  </Text>
                </Stack>
                <Button
                  color="red"
                  onClick={() => onDeleteVideo(playlist.name, video.id)}
                  size="xs"
                  variant="light"
                  type="button"
                >
                  Remove
                </Button>
              </Group>
            </div>
          ))}
        </Stack>
      </Stack>
    </Paper>
  )
}

export default function ProfilePage(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout, session } = useAuth()
  const [friendInput, setFriendInput] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const passwordForm = useForm<PasswordValues>({
    mode: 'uncontrolled',
    initialValues: { confirmPassword: '', password: '' },
    validate: zodResolver(passwordSchema),
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
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to send friend request'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      setFriendInput('')
      notifications.show({ color: 'teal', message: 'Friend request sent.' })
    },
  })

  const updateFriendMutation = useMutation({
    mutationFn: async (payload: {
      body: Record<string, boolean | null | number | string>
      friend: string
    }) => updateFriendRelationship(username, payload.friend, payload.body),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to update friend'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
    },
  })

  const unfriendMutation = useMutation({
    mutationFn: async (friend: string) => deleteFriend(username, friend),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to remove friend'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      notifications.show({ color: 'teal', message: 'Friend removed.' })
    },
  })

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => createPlaylist(username, name),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to create playlist'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      setPlaylistName('')
      notifications.show({ color: 'teal', message: 'Playlist created.' })
    },
  })

  const renamePlaylistMutation = useMutation({
    mutationFn: async (payload: { currentName: string; nextName: string }) =>
      renamePlaylist(username, payload.currentName, payload.nextName),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to rename playlist'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      notifications.show({ color: 'teal', message: 'Playlist updated.' })
    },
  })

  const deletePlaylistMutation = useMutation({
    mutationFn: async (name: string) => deletePlaylist(username, name),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to delete playlist'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      notifications.show({ color: 'teal', message: 'Playlist deleted.' })
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
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to add video'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      notifications.show({
        color: 'teal',
        message: 'Video added to playlist.',
      })
    },
  })

  const removeVideoMutation = useMutation({
    mutationFn: async (payload: { playlistName: string; videoId: string }) =>
      removeVideoFromPlaylist(username, payload.playlistName, payload.videoId),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to remove video'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      notifications.show({
        color: 'teal',
        message: 'Video removed from playlist.',
      })
    },
  })

  const deleteRoomMutation = useMutation({
    mutationFn: deleteRoom,
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to delete room'),
      })
    },
    onSuccess: () => {
      invalidateProfileData()
      notifications.show({ color: 'teal', message: 'Room deleted.' })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async ({ password }: PasswordValues) =>
      changePassword(username, password),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to change password'),
      })
    },
    onSuccess: () => {
      passwordForm.reset()
      notifications.show({ color: 'teal', message: 'Password updated.' })
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async () => deleteAccount(username),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to delete account'),
      })
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

  const openDeleteAccountConfirm = (): void => {
    modals.openConfirmModal({
      title: 'Delete your Streamshore account?',
      children: 'This action cannot be undone.',
      labels: { cancel: 'Cancel', confirm: 'Delete account' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteAccountMutation.mutate(),
    })
  }

  return (
    <>
      <PageMetadata
        description="Manage your rooms, friendships, playlists, and account settings on Streamshore."
        title="Streamshore | Profile"
      />
      <PageHero
        eyebrow="Profile control room"
        title={username}
        description="Everything tied to your account lives here: favorites, playlists, social graph, room ownership, and account settings."
      >
        <Stack gap="md">
          <Paper p="lg" radius="md" withBorder>
            <Group justify="space-between" wrap="wrap" gap="md">
              <Stack gap={4}>
                <Title order={2} size="h3">
                  {username}
                </Title>
                <Group gap="xs">
                  {session?.admin ? (
                    <Badge color="teal" variant="light">
                      Administrator
                    </Badge>
                  ) : (
                    <Badge variant="light">Room operator</Badge>
                  )}
                </Group>
              </Stack>
              <Button component={Link} to="/create-room" size="md">
                Create a room
              </Button>
            </Group>
          </Paper>

          <Tabs defaultValue="rooms">
            <Tabs.List>
              <Tabs.Tab value="rooms">Rooms</Tabs.Tab>
              <Tabs.Tab value="friends">Friends</Tabs.Tab>
              <Tabs.Tab value="playlists">Playlists</Tabs.Tab>
              <Tabs.Tab value="settings">Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="rooms" pt="md">
              <Stack gap="md">
                <RoomSection
                  rooms={profileData.favoriteRooms}
                  title="Favorite rooms"
                />
                <Paper p="md" radius="md" withBorder component="section">
                  <Stack gap="md">
                    <Stack gap={2}>
                      <Text fw={700}>Rooms you own</Text>
                      <Text c="dimmed" size="sm">
                        Delete stale rooms or jump back into active ones.
                      </Text>
                    </Stack>
                    {profileData.myRooms.map((room, index) => (
                      <div key={room.route}>
                        {index > 0 ? <Divider mb="sm" /> : null}
                        <Group
                          justify="space-between"
                          wrap="wrap"
                          gap="sm"
                          align="flex-start"
                        >
                          <Stack gap={2}>
                            <Text fw={700}>{room.name}</Text>
                            <Text c="dimmed" size="sm">
                              {room.users} users •{' '}
                              {room.privacy === 0 ? 'Public' : 'Private'}
                            </Text>
                          </Stack>
                          <Group gap="xs">
                            <Button
                              component={Link}
                              to={`/${room.route}`}
                              size="xs"
                              variant="default"
                            >
                              Open room
                            </Button>
                            <Button
                              color="red"
                              onClick={() =>
                                deleteRoomMutation.mutate(room.route)
                              }
                              size="xs"
                              variant="light"
                              type="button"
                            >
                              Delete
                            </Button>
                          </Group>
                        </Group>
                      </div>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="friends" pt="md">
              <Stack gap="md">
                <Paper p="md" radius="md" withBorder component="section">
                  <Stack gap="md">
                    <Stack gap={2}>
                      <Text fw={700}>Add a friend</Text>
                      <Text c="dimmed" size="sm">
                        Send a request by username.
                      </Text>
                    </Stack>
                    <Group gap="sm" align="flex-end" wrap="wrap">
                      <TextInput
                        aria-label="Friend username"
                        onChange={(event) =>
                          setFriendInput(event.currentTarget.value)
                        }
                        placeholder="Friend username"
                        style={{ flex: 1, minWidth: 200 }}
                        value={friendInput}
                      />
                      <Button
                        onClick={() => {
                          if (friendInput.trim().length > 0) {
                            addFriendMutation.mutate(friendInput.trim())
                          }
                        }}
                        type="button"
                      >
                        Send request
                      </Button>
                    </Group>
                  </Stack>
                </Paper>

                {profileData.requests.length > 0 ? (
                  <Paper p="md" radius="md" withBorder component="section">
                    <Stack gap="md">
                      <Text fw={700}>Pending requests</Text>
                      {profileData.requests.map((request, index) => (
                        <div key={request.friendee}>
                          {index > 0 ? <Divider mb="sm" /> : null}
                          <Group
                            justify="space-between"
                            wrap="wrap"
                            gap="sm"
                            align="flex-start"
                          >
                            <Stack gap={2}>
                              <Text fw={700}>{request.friendee}</Text>
                              <Text c="dimmed" size="sm">
                                Awaiting your decision
                              </Text>
                            </Stack>
                            <Group gap="xs">
                              <Button
                                onClick={() =>
                                  updateFriendMutation.mutate({
                                    body: { accepted: '1' },
                                    friend: request.friendee,
                                  })
                                }
                                size="xs"
                                type="button"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() =>
                                  updateFriendMutation.mutate({
                                    body: { accepted: '0' },
                                    friend: request.friendee,
                                  })
                                }
                                size="xs"
                                variant="default"
                                type="button"
                              >
                                Decline
                              </Button>
                            </Group>
                          </Group>
                        </div>
                      ))}
                    </Stack>
                  </Paper>
                ) : null}

                <Paper p="md" radius="md" withBorder component="section">
                  <Stack gap="md">
                    <Text fw={700}>Your friends</Text>
                    {profileData.friends.map((friend, index) => (
                      <div key={friend.friendee}>
                        {index > 0 ? <Divider mb="sm" /> : null}
                        <FriendRow
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
                      </div>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="playlists" pt="md">
              <Stack gap="md">
                <Paper p="md" radius="md" withBorder component="section">
                  <Stack gap="md">
                    <Stack gap={2}>
                      <Text fw={700}>Create a playlist</Text>
                      <Text c="dimmed" size="sm">
                        Playlists stay available when you add queue items in a
                        room.
                      </Text>
                    </Stack>
                    <Group gap="sm" align="flex-end" wrap="wrap">
                      <TextInput
                        aria-label="Playlist title"
                        onChange={(event) =>
                          setPlaylistName(event.currentTarget.value)
                        }
                        placeholder="Playlist title"
                        style={{ flex: 1, minWidth: 200 }}
                        value={playlistName}
                      />
                      <Button
                        onClick={() => {
                          if (playlistName.trim().length > 0) {
                            createPlaylistMutation.mutate(playlistName.trim())
                          }
                        }}
                        type="button"
                      >
                        Create playlist
                      </Button>
                    </Group>
                  </Stack>
                </Paper>

                {profileData.playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.name}
                    onAddVideo={(name, url) => {
                      if (url.trim().length > 0) {
                        addVideoMutation.mutate({ playlistName: name, url })
                      }
                    }}
                    onDelete={(name) => deletePlaylistMutation.mutate(name)}
                    onDeleteVideo={(name, videoId) => {
                      removeVideoMutation.mutate({
                        playlistName: name,
                        videoId,
                      })
                    }}
                    onRename={(name, nextName) => {
                      if (nextName.trim().length > 0) {
                        renamePlaylistMutation.mutate({
                          currentName: name,
                          nextName: nextName.trim(),
                        })
                      }
                    }}
                    playlist={playlist}
                  />
                ))}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="settings" pt="md">
              <Stack gap="md">
                <Paper p="md" radius="md" withBorder component="section">
                  <Stack gap="md">
                    <Text fw={700}>Change password</Text>
                    <form
                      onSubmit={passwordForm.onSubmit((values) =>
                        changePasswordMutation.mutate(values),
                      )}
                    >
                      <Stack gap="md">
                        <PasswordInput
                          label="New password"
                          {...passwordForm.getInputProps('password')}
                        />
                        <PasswordInput
                          label="Confirm password"
                          {...passwordForm.getInputProps('confirmPassword')}
                        />
                        <Button
                          loading={changePasswordMutation.isPending}
                          type="submit"
                        >
                          Save password
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </Paper>

                <Paper p="md" radius="md" withBorder component="section">
                  <Stack gap="md">
                    <Text fw={700}>Danger zone</Text>
                    <Text c="dimmed" size="sm">
                      Deleting your account signs you out immediately and
                      removes the current profile.
                    </Text>
                    <Button
                      color="red"
                      onClick={openDeleteAccountConfirm}
                      type="button"
                      variant="light"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      Delete account
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Text c="dimmed" size="sm">
            Looking for a fresh room?{' '}
            <Anchor component={Link} to="/">
              Return to discovery
            </Anchor>
            .
          </Text>
        </Stack>
      </PageHero>
    </>
  )
}
