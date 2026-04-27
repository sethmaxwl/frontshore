import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockApiRequest } = vi.hoisted(() => ({
  mockApiRequest: vi.fn(),
}))

vi.mock('@/lib/api/client', () => ({
  apiRequest: mockApiRequest,
}))

import {
  addFavorite,
  addVideoToPlaylist,
  addVideoToQueue,
  changePassword,
  createFriendRequest,
  createPlaylist,
  createRoom,
  createSession,
  defaultRoomThumbnail,
  deleteAccount,
  deleteFriend,
  deletePlaylist,
  deleteRoom,
  fetchAdminUsers,
  fetchFavoriteStatus,
  fetchFavorites,
  fetchFriends,
  fetchPlaylistVideos,
  fetchPlaylists,
  fetchRoomBySlug,
  fetchRooms,
  fetchRoomSettings,
  fetchUserTracking,
  moveQueueVideoToFront,
  registerUser,
  removeFavorite,
  removeQueueVideo,
  removeVideoFromPlaylist,
  renamePlaylist,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  searchYouTubeVideos,
  sendAdminEmail,
  updateFriendRelationship,
  updateRoom,
  updateRoomPermission,
  verifyUser,
} from '@/lib/api/streamshore'
import type { RoomSettingsDraft } from '@/lib/types/streamshore'

describe('streamshore api wrappers', () => {
  beforeEach(() => {
    mockApiRequest.mockReset()
    mockApiRequest.mockResolvedValue({ ok: true })
  })

  it('routes auth and user account calls through apiRequest', async () => {
    await createSession({ id: 'captain', password: 'secret' })
    await registerUser({
      email: 'captain@example.test',
      password: 'secret',
      username: 'captain',
    })
    await verifyUser('captain', 'verify-token')
    await resendVerification('captain')
    await requestPasswordReset('captain@example.test')
    await resetPassword('captain', 'new-secret', 'reset-token')
    await changePassword('captain', 'new-secret')
    await deleteAccount('captain')

    expect(mockApiRequest.mock.calls).toEqual([
      [
        '/api/session',
        {
          body: { id: 'captain', password: 'secret' },
          method: 'POST',
          skipAuth: true,
        },
      ],
      [
        '/api/users',
        {
          body: {
            email: 'captain@example.test',
            password: 'secret',
            username: 'captain',
          },
          method: 'POST',
          skipAuth: true,
        },
      ],
      [
        '/api/users/captain',
        {
          body: { verify_token: 'verify-token' },
          method: 'PUT',
          skipAuth: true,
        },
      ],
      [
        '/api/users/captain',
        {
          body: { resend_verification: true },
          method: 'PUT',
          skipAuth: true,
        },
      ],
      [
        '/api/users/captain@example.test',
        {
          body: { reset_password: true },
          method: 'PUT',
          skipAuth: true,
        },
      ],
      [
        '/api/users/captain',
        {
          body: { password: 'new-secret' },
          method: 'PUT',
          skipAuth: true,
          token: 'reset-token',
        },
      ],
      [
        '/api/users/captain',
        { body: { password: 'new-secret' }, method: 'PUT' },
      ],
      ['/api/users/captain', { method: 'DELETE' }],
    ])
  })

  it('routes room calls and converts room settings payloads', async () => {
    const roomDetails = {
      anon_chat: 1,
      anon_queue: 0,
      chat_filter: 1,
      chat_level: 50,
      motd: null,
      name: 'Blue Current',
      owner: 'captain',
      privacy: 0,
      queue_level: 10,
      queue_limit: 25,
      route: 'blue-current',
      thumbnail: null,
      users: 12,
      vote_enable: 1,
      vote_threshold: 3,
    }
    const settingsDraft: RoomSettingsDraft = {
      anon_chat: false,
      anon_queue: true,
      chat_filter: false,
      chat_level: false,
      motd: 'Welcome aboard',
      queue_level: true,
      queue_limit: 12,
      route: 'blue-current',
      vote_enable: true,
      vote_threshold: 5,
    }

    mockApiRequest.mockResolvedValueOnce([{ route: 'blue-current' }])
    await fetchRooms()
    await fetchRoomBySlug('blue-current')
    await createRoom({ name: 'Blue Current', privacy: 0 })
    mockApiRequest.mockResolvedValueOnce(roomDetails)
    await expect(fetchRoomSettings('blue-current')).resolves.toEqual({
      anon_chat: true,
      anon_queue: false,
      chat_filter: true,
      chat_level: true,
      motd: '',
      queue_level: false,
      queue_limit: 25,
      route: 'blue-current',
      vote_enable: true,
      vote_threshold: 3,
    })
    mockApiRequest.mockResolvedValueOnce({
      ...roomDetails,
      motd: 'Existing message',
    })
    await expect(fetchRoomSettings('green-current')).resolves.toMatchObject({
      motd: 'Existing message',
    })
    await updateRoom('blue-current', settingsDraft)
    await updateRoom('green-current', {
      ...settingsDraft,
      chat_level: true,
      queue_level: false,
    })
    await deleteRoom('blue-current')
    await updateRoomPermission('blue-current', 'viewer', 30)

    expect(mockApiRequest.mock.calls).toEqual([
      ['/api/rooms'],
      ['/api/rooms/blue-current', { skipAuth: true }],
      [
        '/api/rooms',
        { body: { name: 'Blue Current', privacy: 0 }, method: 'POST' },
      ],
      ['/api/rooms/blue-current/edit'],
      ['/api/rooms/green-current/edit'],
      [
        '/api/rooms/blue-current',
        {
          body: {
            anon_chat: 0,
            anon_queue: 1,
            chat_filter: 0,
            chat_level: 10,
            motd: 'Welcome aboard',
            queue_level: 50,
            queue_limit: 12,
            vote_enable: 1,
            vote_threshold: 5,
          },
          method: 'PUT',
        },
      ],
      [
        '/api/rooms/green-current',
        {
          body: {
            anon_chat: 0,
            anon_queue: 1,
            chat_filter: 0,
            chat_level: 50,
            motd: 'Welcome aboard',
            queue_level: 10,
            queue_limit: 12,
            vote_enable: 1,
            vote_threshold: 5,
          },
          method: 'PUT',
        },
      ],
      ['/api/rooms/blue-current', { method: 'DELETE' }],
      [
        '/api/rooms/blue-current/permissions/viewer',
        { body: { permission: 30 }, method: 'PUT' },
      ],
    ])
  })

  it('routes queue, favorite, friend, playlist, and admin calls', async () => {
    await addVideoToQueue('blue-current', { id: 'video-id', user: 'captain' })
    await moveQueueVideoToFront('blue-current', 2)
    await removeQueueVideo('blue-current', 3)
    await fetchFavorites('captain')
    await fetchFavoriteStatus('captain', 'blue-current')
    await addFavorite('captain', 'blue-current')
    await removeFavorite('captain', 'blue-current')
    await fetchFriends('captain')
    await createFriendRequest('captain', 'viewer')
    await updateFriendRelationship('captain', 'viewer', { accepted: true })
    await deleteFriend('captain', 'viewer')
    await fetchUserTracking('captain')
    await fetchPlaylists('captain')
    await createPlaylist('captain', 'Road Trip')
    await renamePlaylist('captain', 'Road Trip', 'Harbor Mix')
    await deletePlaylist('captain', 'Harbor Mix')
    await addVideoToPlaylist('captain', 'Harbor Mix', 'video-id')
    await removeVideoFromPlaylist('captain', 'Harbor Mix', 'video-id')
    await fetchAdminUsers()
    await sendAdminEmail({ message: 'Hello', subject: 'News' })

    expect(mockApiRequest.mock.calls).toEqual([
      [
        '/api/rooms/blue-current/videos',
        { body: { id: 'video-id', user: 'captain' }, method: 'POST' },
      ],
      ['/api/rooms/blue-current/videos/2', { method: 'PUT' }],
      ['/api/rooms/blue-current/videos/3', { method: 'DELETE' }],
      ['/api/users/captain/favorites'],
      ['/api/users/captain/favorites/blue-current'],
      [
        '/api/users/captain/favorites',
        { body: { room: 'blue-current' }, method: 'POST' },
      ],
      ['/api/users/captain/favorites/blue-current', { method: 'DELETE' }],
      ['/api/users/captain/friends'],
      [
        '/api/users/captain/friends',
        { body: { friendee: 'viewer' }, method: 'POST' },
      ],
      [
        '/api/users/captain/friends/viewer',
        { body: { accepted: true }, method: 'PUT' },
      ],
      ['/api/users/captain/friends/viewer', { method: 'DELETE' }],
      ['/api/users/captain'],
      ['/api/users/captain/playlists'],
      [
        '/api/users/captain/playlists',
        { body: { name: 'Road Trip' }, method: 'POST' },
      ],
      [
        '/api/users/captain/playlists/Road Trip',
        { body: { name: 'Harbor Mix' }, method: 'PUT' },
      ],
      ['/api/users/captain/playlists/Harbor Mix', { method: 'DELETE' }],
      [
        '/api/users/captain/playlists/Harbor Mix/videos',
        { body: { video: 'video-id' }, method: 'POST' },
      ],
      [
        '/api/users/captain/playlists/Harbor Mix/videos/video-id',
        { method: 'DELETE' },
      ],
      ['/api/users'],
      [
        '/api/emails',
        { body: { message: 'Hello', subject: 'News' }, method: 'POST' },
      ],
    ])
  })

  it('normalizes playlist video entries from nested legacy payloads', async () => {
    const firstVideo = { id: 'first-video', title: 'First' }
    const secondVideo = { id: 'second-video', title: 'Second' }

    mockApiRequest.mockResolvedValueOnce([[firstVideo], secondVideo, []])

    await expect(fetchPlaylistVideos('captain', 'Harbor Mix')).resolves.toEqual(
      [firstVideo, secondVideo, []],
    )
  })
})

describe('searchYouTubeVideos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps youtube search results and decodes html entities', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          items: [
            {
              id: { videoId: 'high-video' },
              snippet: {
                channelTitle: 'Tom &amp; Friends',
                thumbnails: { high: { url: 'https://img/high.jpg' } },
                title: 'High &quot;Quality&quot;',
              },
            },
            {
              id: { videoId: 'medium-video' },
              snippet: {
                channelTitle: 'Medium Channel',
                thumbnails: { medium: { url: 'https://img/medium.jpg' } },
                title: 'Medium Result',
              },
            },
            {
              id: { videoId: 'fallback-video' },
              snippet: {
                channelTitle: 'Fallback Channel',
                thumbnails: {},
                title: 'Fallback Result',
              },
            },
          ],
        }),
      ),
    )

    await expect(searchYouTubeVideos('ambient stream')).resolves.toEqual([
      {
        channel: 'Tom & Friends',
        id: 'high-video',
        thumbnail: 'https://img/high.jpg',
        title: 'High "Quality"',
      },
      {
        channel: 'Medium Channel',
        id: 'medium-video',
        thumbnail: 'https://img/medium.jpg',
        title: 'Medium Result',
      },
      {
        channel: 'Fallback Channel',
        id: 'fallback-video',
        thumbnail: defaultRoomThumbnail,
        title: 'Fallback Result',
      },
    ])
  })

  it('throws when youtube search fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 500 })),
    )

    await expect(searchYouTubeVideos('ambient stream')).rejects.toThrow(
      'YouTube search is unavailable right now.',
    )
  })
})
