import { describe, expect, it } from 'vitest'

import {
  getPresenceUsers,
  initialRoomSessionState,
  roomSessionReducer,
  type RoomSessionAction,
  type RoomSessionState,
} from '@/features/room-session/utils/reducer'
import type {
  PresenceUser,
  RoomDetails,
  RoomMessage,
  RoomSocketEvent,
  RoomSocketJoinResponse,
  RoomVideo,
} from '@/lib/types/streamshore'

const room: RoomDetails = {
  anon_chat: 1,
  anon_queue: 1,
  chat_filter: 0,
  chat_level: 10,
  motd: 'Welcome aboard',
  name: 'Current Room',
  owner: 'captain',
  privacy: 0,
  queue_level: 10,
  queue_limit: 25,
  route: 'current-room',
  thumbnail: null,
  users: 3,
  vote_enable: 1,
  vote_threshold: 60,
}

const playingVideo: RoomVideo = {
  channel: 'Streamshore',
  id: 'abc123',
  submittedBy: 'captain',
  thumbnail: 'https://example.com/thumb.jpg',
  title: 'Night Crossing',
}

const queueVideo: RoomVideo = {
  channel: 'Streamshore',
  id: 'def456',
  submittedBy: 'ally',
  thumbnail: 'https://example.com/thumb-2.jpg',
  title: 'Morning Wake',
}

const chatMessage: RoomMessage = {
  anon: false,
  msg: 'hello',
  time: 1,
  user: 'ally',
  uuid: 'msg-1',
}

const allyPresence = {
  anon: false,
  name: '',
  permission: 10,
} satisfies PresenceUser

const guestPresence = {
  anon: true,
  name: '',
  permission: 10,
} satisfies PresenceUser

describe('roomSessionReducer', () => {
  it('hydrates the room session from the join payload', () => {
    const joinedPayload: RoomSocketJoinResponse = {
      permission: 50,
      room,
      videos: {
        playing: playingVideo,
        queue: [queueVideo],
      },
    }
    const joinedAction: RoomSessionAction = {
      payload: joinedPayload,
      type: 'joined',
    }

    const nextState: RoomSessionState = roomSessionReducer(
      initialRoomSessionState,
      joinedAction,
    )

    expect(nextState.isConnected).toBe(true)
    expect(nextState.permission).toBe(50)
    expect(nextState.currentVideo).toEqual(playingVideo)
    expect(nextState.queuedVideos).toEqual([queueVideo])
    expect(nextState.messages[0]).toMatchObject({
      motd: true,
      msg: 'Welcome aboard',
      user: 'Streamshore',
      uuid: 'motd',
    })
  })

  it('resets transient room state when joining without a motd or active videos', () => {
    const dirtyState: RoomSessionState = {
      currentVideo: playingVideo,
      isConnected: true,
      messages: [chatMessage],
      permission: 100,
      queuedVideos: [queueVideo],
      room,
      syncTime: 42,
      usersByName: {
        ally: {
          ...allyPresence,
          name: 'ally',
        },
      },
    }

    const nextState = roomSessionReducer(dirtyState, {
      payload: {
        permission: 10,
        room: {
          ...room,
          motd: '   ',
        },
      },
      type: 'joined',
    })

    expect(nextState.currentVideo).toBeNull()
    expect(nextState.isConnected).toBe(true)
    expect(nextState.messages).toEqual([])
    expect(nextState.permission).toBe(10)
    expect(nextState.queuedVideos).toEqual([])
    expect(nextState.syncTime).toBe(0)
    expect(nextState.usersByName).toEqual({})
  })

  it('tracks presence state, default permissions, and sorted users', () => {
    const roomDeletedEvent: RoomSocketEvent = {
      payload: null,
      type: 'room-deleted',
    }
    const presenceState: Record<string, { metas: PresenceUser[] }> = {
      ally: { metas: [allyPresence] },
      guest: { metas: [guestPresence] },
      mystery: {
        metas: [{ anon: false, name: '' } as PresenceUser],
      },
      nobody: { metas: [] },
    }

    const withPresence = roomSessionReducer(initialRoomSessionState, {
      payload: presenceState,
      type: 'presence-state',
    })

    expect(withPresence.usersByName.mystery?.permission).toBe(10)
    expect(withPresence.usersByName.nobody).toBeUndefined()
    expect(getPresenceUsers(withPresence).map((user) => user.name)).toEqual([
      'ally',
      'guest',
      'mystery',
    ])
    expect(roomDeletedEvent.type).toBe('room-deleted')
  })

  it('applies chat, presence diffs, permission updates, and message deletes', () => {
    const withPresence = roomSessionReducer(initialRoomSessionState, {
      payload: {
        ally: { metas: [allyPresence] },
        guest: { metas: [guestPresence] },
      },
      type: 'presence-state',
    })
    const withChat = roomSessionReducer(withPresence, {
      payload: chatMessage,
      type: 'chat-received',
    })
    const withPresenceDiff = roomSessionReducer(withChat, {
      payload: {
        joins: {
          captain: {
            metas: [{ anon: false, name: '' } as PresenceUser],
          },
          ignored: { metas: [] },
        },
        leaves: {
          guest: { metas: [] },
        },
      },
      type: 'presence-diff',
    })
    const withPermission = roomSessionReducer(withPresenceDiff, {
      payload: { permission: 50, user: 'captain' },
      type: 'permission-updated',
    })
    const missingUserResult = roomSessionReducer(withPermission, {
      payload: { permission: 50, user: 'missing' },
      type: 'permission-updated',
    })
    const withoutMessage = roomSessionReducer(withPermission, {
      payload: { uuid: 'msg-1' },
      type: 'message-deleted',
    })

    expect(withChat.messages).toEqual([chatMessage])
    expect(withPresenceDiff.usersByName.guest).toBeUndefined()
    expect(withPresenceDiff.usersByName.ignored).toBeUndefined()
    expect(withPresenceDiff.usersByName.captain).toMatchObject({
      name: 'captain',
      permission: 10,
    })
    expect(withPermission.usersByName.captain?.permission).toBe(50)
    expect(missingUserResult).toBe(withPermission)
    expect(withoutMessage.messages).toEqual([])
  })

  it('updates queue, room details, sync time, and current video', () => {
    const withQueue = roomSessionReducer(initialRoomSessionState, {
      payload: [queueVideo],
      type: 'queue-updated',
    })
    const withLocalPermission = roomSessionReducer(withQueue, {
      payload: 50,
      type: 'local-permission-updated',
    })
    const withoutRoom = roomSessionReducer(withLocalPermission, {
      payload: { motd: 'Updated' },
      type: 'room-updated',
    })
    const withRoom = roomSessionReducer(
      {
        ...withLocalPermission,
        room,
      },
      {
        payload: {
          motd: 'Updated',
          users: 9,
        },
        type: 'room-updated',
      },
    )
    const withSyncTime = roomSessionReducer(withRoom, {
      payload: 24,
      type: 'sync-time-updated',
    })
    const withVideo = roomSessionReducer(withSyncTime, {
      payload: playingVideo,
      type: 'video-updated',
    })
    const clearedVideo = roomSessionReducer(withVideo, {
      payload: null,
      type: 'video-updated',
    })

    expect(withQueue.queuedVideos).toEqual([queueVideo])
    expect(withLocalPermission.permission).toBe(50)
    expect(withoutRoom).toBe(withLocalPermission)
    expect(withRoom.room).toMatchObject({
      motd: 'Updated',
      name: room.name,
      users: 9,
    })
    expect(withSyncTime.syncTime).toBe(24)
    expect(withVideo.currentVideo).toEqual(playingVideo)
    expect(clearedVideo.currentVideo).toBeNull()
  })

  it('resets to the initial state and ignores unknown actions', () => {
    const dirtyState: RoomSessionState = {
      currentVideo: playingVideo,
      isConnected: true,
      messages: [chatMessage],
      permission: 50,
      queuedVideos: [queueVideo],
      room,
      syncTime: 9,
      usersByName: {
        ally: {
          ...allyPresence,
          name: 'ally',
        },
      },
    }

    const unknownActionState = roomSessionReducer(dirtyState, {
      type: 'unknown',
    } as unknown as RoomSessionAction)
    const resetState = roomSessionReducer(dirtyState, {
      type: 'reset',
    })

    expect(unknownActionState).toBe(dirtyState)
    expect(resetState).toBe(initialRoomSessionState)
  })
})
