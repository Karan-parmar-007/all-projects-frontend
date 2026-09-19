const UNAUTHENTICATED_EVENT = 'apps:unauthenticated'

export function ssoLoginUrl(returnPath = '/admin'): string {
  const sso = import.meta.env.VITE_SSO_URL || 'http://localhost:5173'
  const next = `${window.location.origin}${returnPath}`
  const url = new URL('/login', sso)
  url.searchParams.set('next', next)
  return url.toString()
}

export function notifyUnauthenticated(): void {
  window.dispatchEvent(new CustomEvent(UNAUTHENTICATED_EVENT))
}

export function onUnauthenticated(handler: () => void): () => void {
  window.addEventListener(UNAUTHENTICATED_EVENT, handler)
  return () => window.removeEventListener(UNAUTHENTICATED_EVENT, handler)
}
