import { createSsoClient } from '@/lib/sso/sso-client'

export { isAppAdmin, SsoNetworkError } from '@/lib/sso/sso-client'
export type { SsoSession, SsoUser } from '@/lib/sso/sso-client'

/** This app's id in SSO (app-scoped roles, e.g. { allprojects: ['admin'] }). */
export const SSO_APP_ID = 'allprojects'

/** The one SSO client for this app. `/api/auth/*` is same-origin (Caddy / Vite proxy). */
export const sso = createSsoClient({
  ssoUrl: import.meta.env.VITE_SSO_URL || 'http://localhost:5173',
})

const UNAUTHENTICATED_EVENT = 'apps:unauthenticated'

/** An app API call stayed 401 after a refresh: the user is signed out. */
export function notifyUnauthenticated(): void {
  window.dispatchEvent(new CustomEvent(UNAUTHENTICATED_EVENT))
}

export function onUnauthenticated(handler: () => void): () => void {
  window.addEventListener(UNAUTHENTICATED_EVENT, handler)
  return () => window.removeEventListener(UNAUTHENTICATED_EVENT, handler)
}

/** Protected pages send signed-out users to SSO login (back to this exact URL). */
export function isProtectedPath(pathname = window.location.pathname): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/apps/')
}

/** Refresh after an app API 401; false when signed out or SSO is unreachable. */
export async function refreshSession(): Promise<boolean> {
  try {
    return await sso.refresh()
  } catch {
    return false
  }
}
