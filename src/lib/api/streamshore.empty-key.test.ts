import { describe, expect, it, vi } from 'vitest'

vi.mock('@/config/appConfig', () => ({
  appConfig: {
    apiBaseUrl: 'http://localhost:4000',
    wsBaseUrl: 'ws://localhost:4000',
    youtubeApiKey: '',
  },
}))

vi.mock('@/lib/api/client', () => ({
  apiRequest: vi.fn(),
}))

import { searchYouTubeVideos } from '@/lib/api/streamshore'

describe('searchYouTubeVideos without a configured key', () => {
  it('requires a youtube api key before searching', async () => {
    await expect(searchYouTubeVideos('ambient stream')).rejects.toThrow(
      'A YouTube API key is required for search.',
    )
  })
})
