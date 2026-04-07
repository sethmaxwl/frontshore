import type { RoomSummary } from '@/lib/types/streamshore'

export type RoomSection = {
  rooms: RoomSummary[]
  title: string
}

export function slugifyRoomName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '')
}

export function sortRoomsByActivity(
  left: RoomSummary,
  right: RoomSummary,
): number {
  const userDelta = right.users - left.users

  if (userDelta !== 0) {
    return userDelta
  }

  return left.name.localeCompare(right.name)
}

export function getPublicRooms(rooms: RoomSummary[]): RoomSummary[] {
  return rooms
    .filter((room) => room.privacy === 0)
    .toSorted(sortRoomsByActivity)
}

export function buildRoomSections(options: {
  favoriteRooms: RoomSummary[]
  friendNames: string[]
  rooms: RoomSummary[]
  username: string
}): RoomSection[] {
  const { favoriteRooms, friendNames, rooms, username } = options
  const favoriteRoutes = new Set(favoriteRooms.map((room) => room.route))
  const publicRooms = getPublicRooms(rooms)
  const myRooms = rooms
    .filter((room) => room.owner === username)
    .toSorted(sortRoomsByActivity)
  const friendRooms = rooms
    .filter((room) => friendNames.includes(room.owner))
    .toSorted(sortRoomsByActivity)
  const orderedSections: Array<RoomSection | null> = [
    favoriteRooms.length > 0
      ? {
          rooms: favoriteRooms.toSorted(sortRoomsByActivity),
          title: 'My Favorite Rooms',
        }
      : null,
    myRooms.length > 0 ? { rooms: myRooms, title: 'My Rooms' } : null,
    friendRooms.length > 0
      ? { rooms: friendRooms, title: 'Friend Rooms' }
      : null,
    {
      rooms: publicRooms.filter(
        (room) => room.owner !== username || !favoriteRoutes.has(room.route),
      ),
      title: 'Public Rooms',
    },
  ]

  return orderedSections.filter(
    (section): section is RoomSection => section !== null,
  )
}

export function findMatchingRooms(
  rooms: RoomSummary[],
  query: string,
): RoomSummary[] {
  const normalizedQuery = query.trim().toUpperCase()

  if (normalizedQuery.length === 0) {
    return []
  }

  return rooms
    .filter((room) => room.privacy === 0)
    .filter((room) => room.name.toUpperCase().includes(normalizedQuery))
    .toSorted(sortRoomsByActivity)
}
