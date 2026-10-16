import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { sso } from '@/lib/sso'

export function AdminGate({ children }: { children: ReactNode }) {
  const { status, isAdmin, signedOut, refetch } = useAuth()

  // Single source: the AuthProvider's SSO session. Signed out → SSO login,
  // returning to this exact URL (path + query + hash).
  useEffect(() => {
    if (status === 'anonymous' && !signedOut) sso.redirectToLogin()
  }, [status, signedOut])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a192f]">
        <p className="font-mono text-sm text-[#64ffda]">Checking session…</p>
      </div>
    )
  }

  if (status === 'unavailable') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a192f] px-6 text-center">
        <h1 className="text-2xl font-semibold text-[#ccd6f6]">Sign-in service unavailable</h1>
        <p className="max-w-md text-[#8892b0]">Could not reach SSO. Try again in a moment.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="font-mono text-sm text-[#64ffda] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (status === 'anonymous') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a192f]">
        <p className="font-mono text-sm text-[#64ffda]">
          {signedOut ? 'Signed out.' : 'Redirecting to sign in…'}
        </p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a192f] px-6 text-center">
        <h1 className="text-2xl font-semibold text-[#ccd6f6]">Not authorised</h1>
        <p className="max-w-md text-[#8892b0]">
          Owner, super_admin or All Projects admin access is required for the projects admin.
        </p>
        <Link to="/" className="font-mono text-sm text-[#64ffda] hover:underline">
          Go home
        </Link>
      </div>
    )
  }

  return children
}
