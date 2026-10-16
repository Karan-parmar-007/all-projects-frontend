import { NavLink, Outlet } from 'react-router-dom'
import { FolderKanban, Sparkles, Tags } from 'lucide-react'
import { SignOutButton } from '@/components/SignOutButton'
import { useAuth } from '@/context/useAuth'

const NAV = [
  { to: '/admin', label: 'Projects', icon: FolderKanban, end: true },
  { to: '/admin/statuses', label: 'Statuses', icon: Tags, end: false },
  { to: '/admin/skills', label: 'Skills', icon: Sparkles, end: false },
]

export function AdminLayout() {
  const { user } = useAuth()
  const letter = (user?.name || user?.email || 'A').trim().charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#0a192f] text-[#8892b0]">
      <header className="border-b border-[#172a45] bg-[#0a192f]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <a href="/" className="font-mono text-xs text-[#64ffda]">
              // APPS ADMIN
            </a>
            <nav className="flex items-center gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded px-3 py-2 font-mono text-xs transition-colors ${
                      isActive
                        ? 'bg-[#112240] text-[#64ffda]'
                        : 'text-[#ccd6f6] hover:text-[#64ffda]'
                    }`
                  }
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#8892b0] sm:inline">
              {user?.name || user?.email}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#64ffda] font-mono text-sm text-[#64ffda]">
              {letter}
            </span>
            <SignOutButton className="rounded px-3 py-2 font-mono text-xs text-[#ccd6f6] hover:text-[#64ffda]" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
