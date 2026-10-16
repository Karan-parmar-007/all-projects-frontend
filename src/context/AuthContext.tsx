import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthState, type AuthStatus } from '@/context/useAuth'
import { isAppAdmin, onUnauthenticated, sso, SSO_APP_ID, type SsoSession, type SsoUser } from '@/lib/sso'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SsoUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [signedOut, setSignedOut] = useState(false)

  const apply = useCallback((session: SsoSession) => {
    if (session.authenticated && session.user) {
      setUser(session.user)
      setStatus('authenticated')
      setSignedOut(false)
    } else {
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  const markUnavailable = useCallback(() => {
    setUser(null)
    setStatus('unavailable')
  }, [])

  // SSO is the source of truth; GET /api/auth/session refreshes server-side.
  const refetch = useCallback(async () => {
    try {
      apply(await sso.getSession())
    } catch {
      markUnavailable()
    }
  }, [apply, markUnavailable])

  const logout = useCallback(async () => {
    setSignedOut(true)
    try {
      await sso.logout()
    } catch {
      // The SDK clears local state and notifies other tabs even on failure.
    }
    setUser(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    let active = true
    sso.getSession().then(
      (session) => {
        if (active) apply(session)
      },
      () => {
        if (active) markUnavailable()
      },
    )
    return () => {
      active = false
    }
  }, [apply, markUnavailable])

  // Login/logout in another tab (or a session change noticed here).
  useEffect(() => sso.onSessionChange(apply), [apply])

  // An app API call stayed 401 after a refresh.
  useEffect(
    () =>
      onUnauthenticated(() => {
        setUser(null)
        setStatus('anonymous')
      }),
    [],
  )

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      isAdmin: status === 'authenticated' && isAppAdmin(user, SSO_APP_ID),
      signedOut,
      refetch,
      logout,
    }),
    [user, status, signedOut, refetch, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
