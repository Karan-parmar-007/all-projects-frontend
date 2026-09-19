import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchSession } from '@/api'
import { onUnauthenticated, ssoLoginUrl } from '@/lib/sso'
import type { SessionResponse } from '@/types'

export { ssoLoginUrl }

const anonymousSession: SessionResponse = {
  authenticated: false,
  is_owner: false,
  is_admin: false,
  email: null,
  user_id: null,
  role_name: null,
  name: null,
}

interface AuthState {
  session: SessionResponse
  isLoading: boolean
  isAdmin: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionResponse>(anonymousSession)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const next = await fetchSession()
      setSession(next)
    } catch {
      setSession(anonymousSession)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  useEffect(() => {
    return onUnauthenticated(() => {
      setSession(anonymousSession)
    })
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      session,
      isLoading,
      isAdmin: Boolean(session.authenticated && session.is_admin),
      refetch,
    }),
    [session, isLoading, refetch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
