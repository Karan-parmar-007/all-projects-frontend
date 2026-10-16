import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/useAuth'

/** Ends the SSO session (all apps on karanparmar.in) and returns home. */
export function SignOutButton({
  className = '',
  onDone,
}: {
  className?: string
  onDone?: () => void
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    setBusy(true)
    await logout()
    onDone?.()
    navigate('/', { replace: true })
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={busy}
      className={`flex items-center gap-1.5 transition-colors disabled:opacity-60 ${className}`}
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{busy ? 'Signing out…' : 'Sign out'}</span>
    </button>
  )
}
