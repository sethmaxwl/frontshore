import { appConfig } from '@/config/appConfig'
import { getStoredAuthSession } from '@/lib/auth/authSession'

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object
  skipAuth?: boolean
  token?: string
}

type ApiErrorPayload = {
  error?: string
  message?: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function withBaseUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${appConfig.apiBaseUrl}${path}`
}

function toRequestBody(body: ApiRequestOptions['body']): BodyInit | undefined {
  if (!body) {
    return undefined
  }

  if (body instanceof FormData || typeof body === 'string') {
    return body
  }

  return JSON.stringify(body)
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (isObject(payload)) {
    const error = payload.error
    const message = payload.message

    if (typeof error === 'string' && error.length > 0) {
      return error
    }

    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  if (typeof payload === 'string' && payload.length > 0) {
    return payload
  }

  return fallback
}

class ApiError extends Error {
  public readonly payload: unknown
  public readonly status: number

  public constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.payload = payload
    this.status = status
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  const requestBody = toRequestBody(options.body)
  const token = options.skipAuth
    ? undefined
    : (options.token ?? getStoredAuthSession()?.token ?? undefined)

  headers.set('Accept', 'application/json')

  if (requestBody && !(requestBody instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(withBaseUrl(path), {
    ...options,
    body: requestBody,
    headers,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as unknown)
    : ((await response.text()) as unknown)

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload,
    )
  }

  if (isObject(payload)) {
    const errorPayload = payload as ApiErrorPayload

    if (
      typeof errorPayload.error === 'string' &&
      errorPayload.error.length > 0
    ) {
      throw new ApiError(errorPayload.error, response.status, payload)
    }
  }

  return payload as T
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return fallback
}
