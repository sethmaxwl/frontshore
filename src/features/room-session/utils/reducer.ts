import type {
  PresenceUser,
  RoomDetails,
  RoomMessage,
  RoomPermissionLevel,
  RoomSocketJoinResponse,
  RoomVideo,
} from '@/lib/types/streamshore'

export type RoomSessionState = {
  currentVideo: RoomVideo | null
  isConnected: boolean
  messages: RoomMessage[]
  permission: RoomPermissionLevel
  queuedVideos: RoomVideo[]
  room: RoomDetails | null
  syncTime: number
  usersByName: Record<string, PresenceUser>
}

export type RoomSessionAction =
  | { type: 'chat-received'; payload: RoomMessage }
  | { type: 'joined'; payload: RoomSocketJoinResponse }
  | { type: 'local-permission-updated'; payload: RoomPermissionLevel }
  | { type: 'message-deleted'; payload: { uuid: string } }
  | {
      type: 'permission-updated'
      payload: { permission: RoomPermissionLevel; user: string }
    }
  | {
      type: 'presence-diff'
      payload: {
        joins: Record<string, { metas: PresenceUser[] }>
        leaves: Record<string, { metas: PresenceUser[] }>
      }
    }
  | {
      type: 'presence-state'
      payload: Record<string, { metas: PresenceUser[] }>
    }
  | { type: 'queue-updated'; payload: RoomVideo[] }
  | { type: 'reset' }
  | { type: 'room-updated'; payload: Partial<RoomDetails> }
  | { type: 'sync-time-updated'; payload: number }
  | { type: 'video-updated'; payload: RoomVideo | null }

export const initialRoomSessionState: RoomSessionState = {
  currentVideo: null,
  isConnected: false,
  messages: [],
  permission: 10,
  queuedVideos: [],
  room: null,
  syncTime: 0,
  usersByName: {},
}

function toPresenceUser(
  username: string,
  user: PresenceUser | undefined,
): PresenceUser | undefined {
  if (!user) {
    return undefined
  }

  return {
    ...user,
    name: username,
    permission: user.permission ?? 10,
  }
}

function fromPresenceState(
  payload: Record<string, { metas: PresenceUser[] }>,
): Record<string, PresenceUser> {
  return Object.fromEntries(
    Object.entries(payload)
      .map(([username, presence]) => [
        username,
        toPresenceUser(username, presence.metas[0]),
      ])
      .filter((entry): entry is [string, PresenceUser] => Boolean(entry[1])),
  )
}

function withMotdMessage(room: RoomDetails): RoomMessage[] {
  if (!room.motd || room.motd.trim().length === 0) {
    return []
  }

  return [
    {
      anon: false,
      motd: true,
      msg: room.motd,
      time: Date.now() / 1000,
      user: 'Streamshore',
      uuid: 'motd',
    },
  ]
}

export function getPresenceUsers(state: RoomSessionState): PresenceUser[] {
  return Object.values(state.usersByName).toSorted((left, right) =>
    left.name.localeCompare(right.name),
  )
}

export function roomSessionReducer(
  state: RoomSessionState,
  action: RoomSessionAction,
): RoomSessionState {
  switch (action.type) {
    case 'chat-received': {
      return {
        ...state,
        messages: [...state.messages, action.payload],
      }
    }

    case 'joined': {
      return {
        currentVideo: action.payload.videos?.playing ?? null,
        isConnected: true,
        messages: withMotdMessage(action.payload.room),
        permission: action.payload.permission,
        queuedVideos: action.payload.videos?.queue ?? [],
        room: action.payload.room,
        syncTime: 0,
        usersByName: {},
      }
    }

    case 'local-permission-updated': {
      return {
        ...state,
        permission: action.payload,
      }
    }

    case 'message-deleted': {
      return {
        ...state,
        messages: state.messages.filter(
          (message) => message.uuid !== action.payload.uuid,
        ),
      }
    }

    case 'permission-updated': {
      const currentUser = state.usersByName[action.payload.user]

      if (!currentUser) {
        return state
      }

      return {
        ...state,
        usersByName: {
          ...state.usersByName,
          [action.payload.user]: {
            ...currentUser,
            permission: action.payload.permission,
          },
        },
      }
    }

    case 'presence-diff': {
      const nextUsers = { ...state.usersByName }

      for (const [username, presence] of Object.entries(action.payload.joins)) {
        const user = toPresenceUser(username, presence.metas[0])

        if (user) {
          nextUsers[username] = user
        }
      }

      for (const username of Object.keys(action.payload.leaves)) {
        delete nextUsers[username]
      }

      return {
        ...state,
        usersByName: nextUsers,
      }
    }

    case 'presence-state': {
      return {
        ...state,
        usersByName: fromPresenceState(action.payload),
      }
    }

    case 'queue-updated': {
      return {
        ...state,
        queuedVideos: action.payload,
      }
    }

    case 'reset': {
      return initialRoomSessionState
    }

    case 'room-updated': {
      if (!state.room) {
        return state
      }

      return {
        ...state,
        room: {
          ...state.room,
          ...action.payload,
        },
      }
    }

    case 'sync-time-updated': {
      return {
        ...state,
        syncTime: action.payload,
      }
    }

    case 'video-updated': {
      return {
        ...state,
        currentVideo: action.payload,
      }
    }

    default: {
      return state
    }
  }
}
