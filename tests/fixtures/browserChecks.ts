import type { RoomSummary } from '../../src/lib/types/streamshore.ts'

const browserCheckThumbnailSvg = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">',
  '<defs>',
  '<linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">',
  '<stop offset="0%" stop-color="#0f766e" />',
  '<stop offset="100%" stop-color="#1d4ed8" />',
  '</linearGradient>',
  '</defs>',
  '<rect width="640" height="360" fill="url(#bg)" rx="28" />',
  '<circle cx="150" cy="120" r="84" fill="rgba(255,255,255,0.14)" />',
  '<circle cx="520" cy="250" r="98" fill="rgba(255,255,255,0.12)" />',
  '<text x="56" y="214" fill="#ecfeff" font-family="Arial, sans-serif" font-size="48" font-weight="700">Streamshore</text>',
  '</svg>',
].join('')

export const browserCheckSearchQuery = 'watch'

const browserCheckThumbnailDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(browserCheckThumbnailSvg)}`

export const browserCheckRooms: RoomSummary[] = [
  {
    name: 'Watch Party Central',
    owner: 'casey',
    privacy: 0,
    route: 'watch-party-central',
    thumbnail: browserCheckThumbnailDataUrl,
    users: 18,
  },
  {
    name: 'Late Night Watch Club',
    owner: 'morgan',
    privacy: 0,
    route: 'late-night-watch-club',
    thumbnail: browserCheckThumbnailDataUrl,
    users: 7,
  },
  {
    name: 'Green Room Ops',
    owner: 'ops',
    privacy: 1,
    route: 'green-room-ops',
    thumbnail: browserCheckThumbnailDataUrl,
    users: 3,
  },
]
