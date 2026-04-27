import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { appConfig } from '@/config/appConfig'
import { apiRequest, getApiErrorMessage } from '@/lib/api/client'
import { storageKeys } from '@/lib/storage/persistence'

function createJsonResponse(
  payload: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json')

  return Response.json(payload, { ...init, headers })
}

describe('apiRequest', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let storageEntries = new Map<string, string>()

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    fetchMock = vi.fn()
    storageEntries = new Map()

    vi.stubGlobal('fetch', fetchMock)

    Object.defineProperty(globalThis.window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storageEntries.get(key) ?? null,
        removeItem: (key: string) => {
          storageEntries.delete(key)
        },
        setItem: (key: string, value: string) => {
          storageEntries.set(key, value)
        },
      },
    })
  })

  it('sends json requests to relative api paths with stored auth', async () => {
    storageEntries.set(
      `streamshore:v1:${storageKeys.auth}`,
      JSON.stringify({
        admin: false,
        anon: false,
        isLoggedIn: true,
        token: 'stored-token',
        user: 'captain',
      }),
    )
    fetchMock.mockResolvedValue(createJsonResponse({ ok: true }))

    await expect(
      apiRequest('/api/rooms', {
        body: { route: 'blue-current' },
        method: 'POST',
      }),
    ).resolves.toEqual({ ok: true })

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(request.headers)

    expect(url).toBe(`${appConfig.apiBaseUrl}/api/rooms`)
    expect(request.body).toBe(JSON.stringify({ route: 'blue-current' }))
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer stored-token')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('uses absolute urls, explicit tokens, and form data without json headers', async () => {
    const formData = new FormData()
    formData.set('thumbnail', 'cover.jpg')
    fetchMock.mockResolvedValue(createJsonResponse({ uploaded: true }))

    await expect(
      apiRequest('https://uploads.example.test/cover', {
        body: formData,
        method: 'POST',
        token: 'explicit-token',
      }),
    ).resolves.toEqual({ uploaded: true })

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(request.headers)

    expect(url).toBe('https://uploads.example.test/cover')
    expect(request.body).toBe(formData)
    expect(headers.get('Authorization')).toBe('Bearer explicit-token')
    expect(headers.get('Content-Type')).toBeNull()
  })

  it('supports text responses and skipped auth', async () => {
    fetchMock.mockResolvedValue(
      new Response('plain response', {
        headers: { 'content-type': 'text/plain' },
      }),
    )

    await expect(
      apiRequest('https://status.example.test/ping', {
        skipAuth: true,
      }),
    ).resolves.toBe('plain response')

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(request.headers)

    expect(request.body).toBeUndefined()
    expect(headers.get('Authorization')).toBeNull()
  })

  it('treats missing response content type as text', async () => {
    const response = new Response('no content type')
    response.headers.delete('content-type')
    fetchMock.mockResolvedValue(response)

    await expect(apiRequest('/api/plain', { skipAuth: true })).resolves.toBe(
      'no content type',
    )
  })

  it('throws api errors from unsuccessful json payloads', async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse(
        { error: 'Room is unavailable', message: 'Fallback message' },
        { status: 409 },
      ),
    )

    await expect(apiRequest('/api/rooms/conflict')).rejects.toMatchObject({
      message: 'Room is unavailable',
      name: 'ApiError',
      payload: { error: 'Room is unavailable', message: 'Fallback message' },
      status: 409,
    })
  })

  it('uses message, string, and status fallbacks for request failures', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(
          { message: 'Verification expired' },
          { status: 410 },
        ),
      )
      .mockResolvedValueOnce(
        new Response('Gateway timeout', {
          headers: { 'content-type': 'text/plain' },
          status: 504,
        }),
      )
      .mockResolvedValueOnce(createJsonResponse({}, { status: 500 }))

    await expect(apiRequest('/api/message-error')).rejects.toThrow(
      'Verification expired',
    )
    await expect(apiRequest('/api/text-error')).rejects.toThrow(
      'Gateway timeout',
    )
    await expect(apiRequest('/api/status-error')).rejects.toThrow(
      'Request failed with status 500',
    )
  })

  it('treats successful json error payloads as api errors', async () => {
    fetchMock.mockResolvedValue(createJsonResponse({ error: 'Still failed' }))

    await expect(apiRequest('/api/soft-error')).rejects.toMatchObject({
      message: 'Still failed',
      status: 200,
    })
  })

  it('formats api errors, plain errors, and unknown values', async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse({ error: 'Nope' }, { status: 400 }),
    )
    let apiError: unknown

    try {
      await apiRequest('/api/nope')
    } catch (error) {
      apiError = error
    }

    const emptyMessageError = new Error('Fallback message')
    Object.defineProperty(emptyMessageError, 'message', { value: String() })

    expect(getApiErrorMessage(apiError)).toBe('Nope')
    expect(getApiErrorMessage(new Error('Plain error'))).toBe('Plain error')
    expect(getApiErrorMessage(emptyMessageError)).toBe('Something went wrong')
    expect(getApiErrorMessage(null, 'Try again')).toBe('Try again')
  })
})
