import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('appConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses legacy local endpoints by default', async () => {
    vi.stubEnv('PROD', false)

    const { appConfig } = await import('@/config/appConfig')

    expect(appConfig).toMatchObject({
      apiBaseUrl: 'http://localhost:4000',
      wsBaseUrl: 'ws://localhost:4000',
    })
    expect(appConfig.youtubeApiKey.length).toBeGreaterThan(0)
  })

  it('uses legacy production endpoints when running a production build', async () => {
    vi.stubEnv('PROD', true)

    const { appConfig } = await import('@/config/appConfig')

    expect(appConfig.apiBaseUrl).toBe(
      'https://streamshore-backend.nextinfinity.net',
    )
    expect(appConfig.wsBaseUrl).toBe(
      'wss://streamshore-backend.nextinfinity.net',
    )
  })

  it('prefers explicit vite environment overrides', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
    vi.stubEnv('VITE_WS_BASE_URL', 'wss://ws.example.test')
    vi.stubEnv('VITE_YOUTUBE_API_KEY', 'youtube-test-key')

    const { appConfig } = await import('@/config/appConfig')

    expect(appConfig).toEqual({
      apiBaseUrl: 'https://api.example.test',
      wsBaseUrl: 'wss://ws.example.test',
      youtubeApiKey: 'youtube-test-key',
    })
  })
})
