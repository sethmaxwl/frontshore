export type RoomPermissionLevel = 0 | 5 | 10 | 50 | 100

export type AppConfig = {
  apiBaseUrl: string
  wsBaseUrl: string
  youtubeApiKey: string
}

export type AuthSession = {
  user: string
  token: string
  anon: boolean
  admin: boolean
  isLoggedIn: boolean
}

export type RoomSummary = {
  motd?: string
  name: string
  owner: string
  privacy: number
  route: string
  thumbnail: string | null
  users: number
}

export type RoomDetails = RoomSummary & {
  anon_chat: number
  anon_queue: number
  chat_filter: number
  chat_level: number
  queue_level: number
  queue_limit: number
  vote_enable: number
  vote_threshold: number
}

export type RoomSettingsDraft = {
  anon_chat: boolean
  anon_queue: boolean
  chat_filter: boolean
  chat_level: boolean
  motd: string
  queue_level: boolean
  queue_limit: number
  route: string
  vote_enable: boolean
  vote_threshold: number
}

export type RoomVideo = {
  channel: string
  id: string
  submittedBy: string
  thumbnail: string
  title: string
}

export type RoomMessage = {
  anon: boolean
  motd?: boolean
  msg: string
  time: number
  user: string
  uuid: string
}

export type PresenceUser = {
  anon: boolean
  name: string
  online_at?: string
  permission: RoomPermissionLevel
  phx_ref?: string
}

type FriendRequest = {
  friendee: string
}

export type UserTracking = {
  online: boolean
  room: string | null
}

export type FriendRelationship = {
  friendee: string
  nickname: string | null
  rooms: RoomSummary[]
  tracking: UserTracking
}

export type FriendListResponse = {
  friends: Array<{
    friendee: string
    nickname: string | null
  }>
  requests: FriendRequest[]
}

export type Playlist = {
  name: string
}

export type PlaylistWithVideos = Playlist & {
  videos: RoomVideo[]
}

export type AdminUserRecord = {
  admin: boolean | number
  email: string
  room: string | null
  username: string
  verify_token?: string | null
}

export type RoomSocketJoinResponse = {
  permission: RoomPermissionLevel
  room: RoomDetails
  videos?: {
    playing?: RoomVideo | null
    queue?: RoomVideo[]
  }
}

export type YouTubeSearchResult = {
  channel: string
  id: string
  thumbnail: string
  title: string
}

export type RoomSocketEvent =
  | { type: 'chat'; payload: RoomMessage }
  | { type: 'delete'; payload: { uuid: string } }
  | {
      type: 'permission'
      payload: { permission: RoomPermissionLevel; user: string }
    }
  | {
      type: 'presence_diff'
      payload: {
        joins: Record<string, { metas: PresenceUser[] }>
        leaves: Record<string, { metas: PresenceUser[] }>
      }
    }
  | {
      type: 'presence_state'
      payload: Record<string, { metas: PresenceUser[] }>
    }
  | { type: 'queue'; payload: { videos: RoomVideo[] } }
  | { type: 'room-deleted'; payload: null }
  | { type: 'time'; payload: { time: number } }
  | { type: 'update'; payload: Partial<RoomDetails> }
  | { type: 'video'; payload: { video: RoomVideo | null } }
