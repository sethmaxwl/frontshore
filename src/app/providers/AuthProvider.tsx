import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import type { JSX, PropsWithChildren } from 'react'

import { createSession } from '@/lib/api/streamshore'
import {
  clearAuthSession,
  getAnonymousSession,
  getStoredAuthSession,
  normalizeAuthSession,
  saveAuthSession,
} from '@/lib/auth/authSession'
import type { AuthSession } from '@/lib/types/streamshore'

type AuthContextValue = {
  ensureGuestSession: () => Promise<AuthSession>
  isAuthenticated: boolean
  login: (session: AuthSession | Record<string, unknown>) => AuthSession
  logout: () => void
  session: AuthSession | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getInitialSession(): AuthSession | null {
  return getStoredAuthSession()
}

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<AuthSession | null>(getInitialSession)

  const value = useMemo<AuthContextValue>(
    () => ({
      ensureGuestSession: async () => {
        if (session?.token) {
          return session
        }

        const guestSession = normalizeAuthSession(await createSession({}))

        setSession(guestSession)
        saveAuthSession(guestSession)

        return guestSession
      },
      isAuthenticated: Boolean(session?.isLoggedIn && !session.anon),
      login: (nextSession) => {
        const normalizedSession = normalizeAuthSession(nextSession)

        setSession(normalizedSession)
        saveAuthSession(normalizedSession)

        return normalizedSession
      },
      logout: () => {
        setSession(getAnonymousSession())
        clearAuthSession()
        queryClient.clear()
      },
      session,
    }),
    [queryClient, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
