import { appConfig } from '@/config/appConfig'
import { apiRequest } from '@/lib/api/client'
import type {
  AdminUserRecord,
  AuthSession,
  FriendListResponse,
  Playlist,
  RoomDetails,
  RoomSettingsDraft,
  RoomSummary,
  RoomVideo,
  YouTubeSearchResult,
  UserTracking,
} from '@/lib/types/streamshore'
import { decodeHtmlEntities } from '@/lib/utils/media'

export const defaultRoomThumbnail =
  'https://i.ytimg.com/vi/mfycQJrzXCA/maxresdefault.jpg'

function normalizePlaylistVideoEntry(entry: unknown): RoomVideo {
  if (Array.isArray(entry) && entry[0]) {
    return normalizePlaylistVideoEntry(entry[0])
  }

  return entry as RoomVideo
}

function toRoomSettingsDraft(room: RoomDetails): RoomSettingsDraft {
  return {
    anon_chat: room.anon_chat === 1,
    anon_queue: room.anon_queue === 1,
    chat_filter: room.chat_filter === 1,
    chat_level: room.chat_level === 50,
    motd: room.motd ?? '',
    queue_level: room.queue_level === 50,
    queue_limit: room.queue_limit,
    route: room.route,
    vote_enable: room.vote_enable === 1,
    vote_threshold: room.vote_threshold,
  }
}

function serializeRoomSettingsDraft(
  draft: RoomSettingsDraft,
): Record<string, number | string> {
  return {
    anon_chat: Number(draft.anon_chat),
    anon_queue: Number(draft.anon_queue),
    chat_filter: Number(draft.chat_filter),
    chat_level: draft.chat_level ? 50 : 10,
    motd: draft.motd,
    queue_level: draft.queue_level ? 50 : 10,
    queue_limit: draft.queue_limit,
    vote_enable: Number(draft.vote_enable),
    vote_threshold: draft.vote_threshold,
  }
}

export async function createSession(
  payload: { id: string; password: string } | Record<string, never>,
): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/session', {
    body: payload,
    method: 'POST',
    skipAuth: true,
  })
}

export async function registerUser(payload: {
  email: string
  password: string
  username: string
}): Promise<{ success: true }> {
  return apiRequest<{ success: true }>('/api/users', {
    body: payload,
    method: 'POST',
    skipAuth: true,
  })
}

export async function verifyUser(
  user: string,
  verifyToken: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}`, {
    body: { verify_token: verifyToken },
    method: 'PUT',
    skipAuth: true,
  })
}

export async function resendVerification(id: string): Promise<unknown> {
  return apiRequest(`/api/users/${id}`, {
    body: { resend_verification: true },
    method: 'PUT',
    skipAuth: true,
  })
}

export async function requestPasswordReset(email: string): Promise<unknown> {
  return apiRequest(`/api/users/${email}`, {
    body: { reset_password: true },
    method: 'PUT',
    skipAuth: true,
  })
}

export async function resetPassword(
  user: string,
  password: string,
  token: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}`, {
    body: { password },
    method: 'PUT',
    skipAuth: true,
    token,
  })
}

export async function changePassword(
  user: string,
  password: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}`, {
    body: { password },
    method: 'PUT',
  })
}

export async function deleteAccount(user: string): Promise<unknown> {
  return apiRequest(`/api/users/${user}`, {
    method: 'DELETE',
  })
}

export async function fetchRooms(): Promise<RoomSummary[]> {
  return apiRequest<RoomSummary[]>('/api/rooms')
}

export async function fetchRoomBySlug(slug: string): Promise<RoomSummary> {
  return apiRequest<RoomSummary>(`/api/rooms/${slug}`, {
    skipAuth: true,
  })
}

export async function createRoom(
  payload: Record<string, number | string>,
): Promise<RoomSummary> {
  return apiRequest<RoomSummary>('/api/rooms', {
    body: payload,
    method: 'POST',
  })
}

export async function fetchRoomSettings(
  slug: string,
): Promise<RoomSettingsDraft> {
  const room = await apiRequest<RoomDetails>(`/api/rooms/${slug}/edit`)

  return toRoomSettingsDraft(room)
}

export async function updateRoom(
  slug: string,
  draft: RoomSettingsDraft,
): Promise<unknown> {
  return apiRequest(`/api/rooms/${slug}`, {
    body: serializeRoomSettingsDraft(draft),
    method: 'PUT',
  })
}

export async function deleteRoom(slug: string): Promise<unknown> {
  return apiRequest(`/api/rooms/${slug}`, {
    method: 'DELETE',
  })
}

export async function updateRoomPermission(
  slug: string,
  user: string,
  permission: number,
): Promise<unknown> {
  return apiRequest(`/api/rooms/${slug}/permissions/${user}`, {
    body: { permission },
    method: 'PUT',
  })
}

export async function addVideoToQueue(
  slug: string,
  payload: { id: string; user: string },
): Promise<unknown> {
  return apiRequest(`/api/rooms/${slug}/videos`, {
    body: payload,
    method: 'POST',
  })
}

export async function moveQueueVideoToFront(
  slug: string,
  index: number,
): Promise<unknown> {
  return apiRequest(`/api/rooms/${slug}/videos/${index}`, {
    method: 'PUT',
  })
}

export async function removeQueueVideo(
  slug: string,
  index: number,
): Promise<unknown> {
  return apiRequest(`/api/rooms/${slug}/videos/${index}`, {
    method: 'DELETE',
  })
}

export async function fetchFavorites(user: string): Promise<RoomSummary[]> {
  return apiRequest<RoomSummary[]>(`/api/users/${user}/favorites`)
}

export async function fetchFavoriteStatus(
  user: string,
  roomSlug: string,
): Promise<boolean> {
  return apiRequest<boolean>(`/api/users/${user}/favorites/${roomSlug}`)
}

export async function addFavorite(
  user: string,
  roomSlug: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/favorites`, {
    body: { room: roomSlug },
    method: 'POST',
  })
}

export async function removeFavorite(
  user: string,
  roomSlug: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/favorites/${roomSlug}`, {
    method: 'DELETE',
  })
}

export async function fetchFriends(user: string): Promise<FriendListResponse> {
  return apiRequest<FriendListResponse>(`/api/users/${user}/friends`)
}

export async function createFriendRequest(
  user: string,
  friendee: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/friends`, {
    body: { friendee },
    method: 'POST',
  })
}

export async function updateFriendRelationship(
  user: string,
  friend: string,
  payload: Record<string, number | string | null | boolean>,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/friends/${friend}`, {
    body: payload,
    method: 'PUT',
  })
}

export async function deleteFriend(
  user: string,
  friend: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/friends/${friend}`, {
    method: 'DELETE',
  })
}

export async function fetchUserTracking(user: string): Promise<UserTracking> {
  return apiRequest<UserTracking>(`/api/users/${user}`)
}

export async function fetchPlaylists(user: string): Promise<Playlist[]> {
  return apiRequest<Playlist[]>(`/api/users/${user}/playlists`)
}

export async function createPlaylist(
  user: string,
  name: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/playlists`, {
    body: { name },
    method: 'POST',
  })
}

export async function renamePlaylist(
  user: string,
  currentName: string,
  name: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/playlists/${currentName}`, {
    body: { name },
    method: 'PUT',
  })
}

export async function deletePlaylist(
  user: string,
  name: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/playlists/${name}`, {
    method: 'DELETE',
  })
}

export async function fetchPlaylistVideos(
  user: string,
  playlist: string,
): Promise<RoomVideo[]> {
  const response = await apiRequest<unknown[]>(
    `/api/users/${user}/playlists/${playlist}/videos`,
  )

  return response.map((entry) => normalizePlaylistVideoEntry(entry))
}

export async function addVideoToPlaylist(
  user: string,
  playlist: string,
  video: string,
): Promise<unknown> {
  return apiRequest(`/api/users/${user}/playlists/${playlist}/videos`, {
    body: { video },
    method: 'POST',
  })
}

export async function removeVideoFromPlaylist(
  user: string,
  playlist: string,
  videoId: string,
): Promise<unknown> {
  return apiRequest(
    `/api/users/${user}/playlists/${playlist}/videos/${videoId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  return apiRequest<AdminUserRecord[]>('/api/users')
}

export async function sendAdminEmail(payload: {
  message: string
  subject: string
}): Promise<unknown> {
  return apiRequest('/api/emails', {
    body: payload,
    method: 'POST',
  })
}

export async function searchYouTubeVideos(
  query: string,
): Promise<YouTubeSearchResult[]> {
  if (appConfig.youtubeApiKey.length === 0) {
    throw new Error('A YouTube API key is required for search.')
  }

  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
  searchUrl.searchParams.set('type', 'video')
  searchUrl.searchParams.set('order', 'relevance')
  searchUrl.searchParams.set('q', query)
  searchUrl.searchParams.set('maxResults', '10')
  searchUrl.searchParams.set('part', 'snippet')
  searchUrl.searchParams.set('key', appConfig.youtubeApiKey)

  const response = await fetch(searchUrl)

  if (!response.ok) {
    throw new Error('YouTube search is unavailable right now.')
  }

  const payload = (await response.json()) as {
    items: Array<{
      id: { videoId: string }
      snippet: {
        channelTitle: string
        thumbnails: {
          high?: { url: string }
          medium?: { url: string }
        }
        title: string
      }
    }>
  }

  return payload.items.map((item) => ({
    channel: decodeHtmlEntities(item.snippet.channelTitle),
    id: item.id.videoId,
    thumbnail:
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      defaultRoomThumbnail,
    title: decodeHtmlEntities(item.snippet.title),
  }))
}
