import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, ssoLoginUrl } from '@/context/AuthContext'
import { onUnauthenticated } from '@/lib/sso'

export function AdminGate({ children }: { children: ReactNode }) {
  const { isLoading, session, isAdmin, refetch } = useAuth()

  useEffect(() => {
    void refetch()
  }, [refetch])

  useEffect(() => {
    if (!isLoading && !session.authenticated) {
      window.location.replace(ssoLoginUrl('/admin'))
    }
  }, [isLoading, session.authenticated])

  useEffect(() => {
    return onUnauthenticated(() => {
      window.location.replace(ssoLoginUrl('/admin'))
    })
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a192f]">
        <p className="font-mono text-sm text-[#64ffda]">Checking session…</p>
      </div>
    )
  }

  if (!session.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a192f]">
        <p className="font-mono text-sm text-[#64ffda]">Redirecting to sign in…</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a192f] px-6 text-center">
        <h1 className="text-2xl font-semibold text-[#ccd6f6]">Not authorised</h1>
        <p className="max-w-md text-[#8892b0]">
          Owner or super_admin access is required for the projects admin.
        </p>
        <Link to="/" className="font-mono text-sm text-[#64ffda] hover:underline">
          Go home
        </Link>
      </div>
    )
  }

  return children
}
