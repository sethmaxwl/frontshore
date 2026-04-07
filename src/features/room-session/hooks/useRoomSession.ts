import type { Channel } from 'phoenix'
import { Socket } from 'phoenix'
import {
  useEffect,
  useEffectEvent,
  useReducer,
  useRef,
  startTransition,
} from 'react'

import { appConfig } from '@/config/appConfig'
import {
  initialRoomSessionState,
  roomSessionReducer,
} from '@/features/room-session/utils/reducer'
import type {
  PresenceUser,
  RoomDetails,
  RoomMessage,
  RoomSocketJoinResponse,
  RoomVideo,
} from '@/lib/types/streamshore'

type UseRoomSessionOptions = {
  currentUser: string
  onBanned: () => void
  onDeleted: () => void
  onMissingRoom: () => void
  roomSlug: string
  token: string
}

type JoinPush = ReturnType<Channel['join']> & {
  receive: (status: 'ignore', callback: () => void) => JoinPush
}

export function useRoomSession(options: UseRoomSessionOptions) {
  const [state, dispatch] = useReducer(
    roomSessionReducer,
    initialRoomSessionState,
  )
  const channelReference = useRef<Channel | null>(null)
  const handleBanned = useEffectEvent(options.onBanned)
  const handleDeleted = useEffectEvent(options.onDeleted)
  const handleMissingRoom = useEffectEvent(options.onMissingRoom)

  useEffect(() => {
    if (options.roomSlug.length === 0 || options.token.length === 0) {
      return
    }

    dispatch({ type: 'reset' })

    const socket = new Socket(`${appConfig.wsBaseUrl}/socket`, {
      params: { token: options.token },
    })

    socket.connect()

    const channel = socket.channel(`room:${options.roomSlug}`)
    channelReference.current = channel
    ;(channel.join(10_000) as JoinPush)
      .receive('ignore', () => {
        handleBanned()
      })
      .receive('ok', (payload: unknown) => {
        dispatch({
          payload: payload as RoomSocketJoinResponse,
          type: 'joined',
        })
      })
      .receive('error', (payload: unknown) => {
        const response = payload as { reason?: string }

        if (response.reason === 'unauthorized') {
          handleBanned()
          return
        }

        handleMissingRoom()
      })

    channel.on('chat', (payload: unknown) => {
      startTransition(() => {
        dispatch({
          payload: payload as RoomMessage,
          type: 'chat-received',
        })
      })
    })

    channel.on('delete', (payload: unknown) => {
      startTransition(() => {
        dispatch({
          payload: payload as { uuid: string },
          type: 'message-deleted',
        })
      })
    })

    channel.on('video', (payload: unknown) => {
      dispatch({
        payload: (payload as { video: RoomVideo | null }).video,
        type: 'video-updated',
      })
    })

    channel.on('time', (payload: unknown) => {
      dispatch({
        payload: (payload as { time: number }).time,
        type: 'sync-time-updated',
      })
    })

    channel.on('queue', (payload: unknown) => {
      startTransition(() => {
        dispatch({
          payload: (payload as { videos: RoomVideo[] }).videos,
          type: 'queue-updated',
        })
      })
    })

    channel.on('update', (payload: unknown) => {
      dispatch({
        payload: payload as Partial<RoomDetails>,
        type: 'room-updated',
      })
    })

    channel.on('presence_state', (payload: unknown) => {
      startTransition(() => {
        dispatch({
          payload: payload as Record<string, { metas: PresenceUser[] }>,
          type: 'presence-state',
        })
      })
    })

    channel.on('presence_diff', (payload: unknown) => {
      startTransition(() => {
        dispatch({
          payload: payload as {
            joins: Record<string, { metas: PresenceUser[] }>
            leaves: Record<string, { metas: PresenceUser[] }>
          },
          type: 'presence-diff',
        })
      })
    })

    channel.on('permission', (payload: unknown) => {
      const response = payload as { permission: number; user: string }

      if (response.user === options.currentUser) {
        dispatch({
          payload: response.permission as 0 | 5 | 10 | 50 | 100,
          type: 'local-permission-updated',
        })

        if (response.permission === 0) {
          handleBanned()
        }

        return
      }

      startTransition(() => {
        dispatch({
          payload: {
            permission: response.permission as 0 | 5 | 10 | 50 | 100,
            user: response.user,
          },
          type: 'permission-updated',
        })
      })
    })

    channel.on('room-deleted', () => {
      handleDeleted()
    })

    return () => {
      channelReference.current = null
      channel.leave(10_000)
      socket.disconnect()
    }
  }, [options.currentUser, options.roomSlug, options.token])

  return {
    deleteMessage: (uuid: string) => {
      channelReference.current?.push('delete', { uuid })
    },
    sendChat: (message: string) => {
      channelReference.current?.push('chat', { msg: message })
    },
    skipVideo: () => {
      channelReference.current?.push('skip', {})
    },
    state,
    voteToSkip: () => {
      channelReference.current?.push('vote', {})
    },
  }
}
