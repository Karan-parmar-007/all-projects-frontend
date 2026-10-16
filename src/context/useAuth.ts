import { createContext, useContext } from 'react'
import type { SsoUser } from '@/lib/sso'

/**
 * - loading: first SSO session check in flight (show a neutral placeholder)
 * - authenticated / anonymous: answer from SSO `GET /api/auth/session`
 * - unavailable: SSO could not be reached
 */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

export interface AuthState {
  user: SsoUser | null
  status: AuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  /** Global owner/super_admin, or `admin` in this app (UI only — the backend enforces). */
  isAdmin: boolean
  /** The user pressed "Sign out" in this tab (don't bounce them to the login page). */
  signedOut: boolean
  refetch: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
