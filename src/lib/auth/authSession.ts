import {
  loadStoredValue,
  removeStoredValue,
  saveStoredValue,
  storageKeys,
} from '@/lib/storage/persistence'
import type { AuthSession } from '@/lib/types/streamshore'

type PartialLegacyAuthSession = Partial<AuthSession> & {
  is_logged_in?: boolean
  username?: string
}

const emptyAuthSession: AuthSession = {
  admin: false,
  anon: true,
  isLoggedIn: false,
  token: '',
  user: '',
}

export function normalizeAuthSession(
  input: PartialLegacyAuthSession,
): AuthSession {
  const token = input.token ?? ''
  const user = input.user ?? input.username ?? ''
  const anon = input.anon ?? token.length === 0
  const isLoggedIn =
    input.isLoggedIn ?? input.is_logged_in ?? (!anon && user.length > 0)

  return {
    admin: Boolean(input.admin),
    anon,
    isLoggedIn,
    token,
    user,
  }
}

export function getStoredAuthSession(): AuthSession | null {
  const session = loadStoredValue<AuthSession | null>(storageKeys.auth, null)

  if (!session) {
    return null
  }

  return normalizeAuthSession(session)
}

export function saveAuthSession(session: AuthSession): void {
  saveStoredValue(storageKeys.auth, session)
}

export function clearAuthSession(): void {
  removeStoredValue(storageKeys.auth)
}

export function getAnonymousSession(): AuthSession {
  return emptyAuthSession
}
