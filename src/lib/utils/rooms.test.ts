import { describe, expect, it } from 'vitest'

import type { RoomSummary } from '@/lib/types/streamshore'
import {
  buildRoomSections,
  findMatchingRooms,
  getPublicRooms,
  slugifyRoomName,
  type RoomSection,
} from '@/lib/utils/rooms'

const rooms: RoomSummary[] = [
  {
    name: 'Aurora Lounge',
    owner: 'seth',
    privacy: 0,
    route: 'aurora-lounge',
    thumbnail: null,
    users: 12,
  },
  {
    name: 'Blue Drift',
    owner: 'ally',
    privacy: 0,
    route: 'blue-drift',
    thumbnail: null,
    users: 8,
  },
  {
    name: 'Anchor Point',
    owner: 'seth',
    privacy: 1,
    route: 'anchor-point',
    thumbnail: null,
    users: 2,
  },
  {
    name: 'Cove Radio',
    owner: 'morgan',
    privacy: 0,
    route: 'cove-radio',
    thumbnail: null,
    users: 18,
  },
]

describe('rooms utils', () => {
  it('slugifies room names into route-safe ids', () => {
    expect(slugifyRoomName('  Midnight Tides!!!  ')).toBe('midnight-tides')
  })

  it('builds landing sections in the legacy order', () => {
    const sections: RoomSection[] = buildRoomSections({
      favoriteRooms: [rooms[1]],
      friendNames: ['morgan'],
      rooms,
      username: 'seth',
    })

    expect(sections.map((section) => section.title)).toEqual([
      'My Favorite Rooms',
      'My Rooms',
      'Friend Rooms',
      'Public Rooms',
    ])
    expect(sections[3]?.rooms.map((room) => room.route)).toEqual([
      'cove-radio',
      'aurora-lounge',
      'blue-drift',
    ])
  })

  it('searches only public rooms by name', () => {
    expect(findMatchingRooms(rooms, 'co')).toEqual([rooms[3]])
    expect(findMatchingRooms(rooms, 'anchor')).toEqual([])
  })

  it('returns public rooms in descending activity order', () => {
    expect(getPublicRooms(rooms).map((room) => room.route)).toEqual([
      'cove-radio',
      'aurora-lounge',
      'blue-drift',
    ])
  })
})
