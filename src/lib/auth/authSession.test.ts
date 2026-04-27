import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearAuthSession,
  getAnonymousSession,
  getStoredAuthSession,
  normalizeAuthSession,
  saveAuthSession,
} from '@/lib/auth/authSession'
import { storageKeys } from '@/lib/storage/persistence'
import type { AuthSession } from '@/lib/types/streamshore'

describe('authSession', () => {
  let storageEntries = new Map<string, string>()

  beforeEach(() => {
    storageEntries = new Map()

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

  it('normalizes legacy auth session fields', () => {
    expect(
      normalizeAuthSession({
        admin: true,
        is_logged_in: true,
        token: 'legacy-token',
        username: 'marina',
      }),
    ).toEqual({
      admin: true,
      anon: false,
      isLoggedIn: true,
      token: 'legacy-token',
      user: 'marina',
    })
  })

  it('derives anonymous and login state from token and user fields', () => {
    expect(normalizeAuthSession({})).toEqual(getAnonymousSession())
    expect(
      normalizeAuthSession({ token: 'session-token', user: 'seth' }),
    ).toEqual({
      admin: false,
      anon: false,
      isLoggedIn: true,
      token: 'session-token',
      user: 'seth',
    })
    expect(
      normalizeAuthSession({
        anon: false,
        isLoggedIn: true,
        token: '',
        user: '',
      }),
    ).toEqual({
      admin: false,
      anon: false,
      isLoggedIn: true,
      token: '',
      user: '',
    })
    expect(normalizeAuthSession({ token: 'session-token' })).toEqual({
      admin: false,
      anon: false,
      isLoggedIn: false,
      token: 'session-token',
      user: '',
    })
    expect(
      normalizeAuthSession({
        anon: true,
        isLoggedIn: false,
        token: '',
        user: '',
      }),
    ).toEqual(getAnonymousSession())
  })

  it('round-trips stored auth sessions', () => {
    const session: AuthSession = {
      admin: true,
      anon: false,
      isLoggedIn: true,
      token: 'session-token',
      user: 'captain',
    }

    saveAuthSession(session)

    expect(storageEntries.get(`streamshore:v1:${storageKeys.auth}`)).toBe(
      JSON.stringify(session),
    )
    expect(getStoredAuthSession()).toEqual(session)

    clearAuthSession()

    expect(getStoredAuthSession()).toBeNull()
  })

  it('returns null when no auth session is stored', () => {
    expect(getStoredAuthSession()).toBeNull()
  })
})
