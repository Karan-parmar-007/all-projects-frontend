import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ExternalLink, Menu, X, Layers, Code, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isAdmin } = useAuth()
  const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL || 'http://localhost:5174'
  const ssoUrl = import.meta.env.VITE_SSO_URL || 'http://localhost:5173'

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-[#0a192f]/90 backdrop-blur-md border-b border-[#172a45]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#112240] border border-[#172a45] flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-[#64ffda] group-hover:shadow-[0_0_15px_rgba(100,255,218,0.2)]">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-mono text-xs text-[#64ffda] tracking-wider block">// APPS ECOSYSTEM</span>
            <span className="text-[#ccd6f6] font-semibold tracking-tight text-sm group-hover:text-[#64ffda] transition-colors">
              karanparmar.in
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs">
          <Link
            to="/"
            className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 ${
              isActive('/')
                ? 'text-[#64ffda] border-[#64ffda]'
                : 'text-[#ccd6f6] border-transparent hover:text-[#64ffda]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects</span>
          </Link>

          <Link
            to="/skills"
            className={`flex items-center gap-1.5 transition-colors py-1 border-b-2 ${
              isActive('/skills')
                ? 'text-[#64ffda] border-[#64ffda]'
                : 'text-[#ccd6f6] border-transparent hover:text-[#64ffda]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Skills</span>
          </Link>

          <div className="h-4 w-[1px] bg-[#172a45]"></div>

          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-[#64ffda] hover:text-[#ccd6f6] transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          ) : null}

          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#8892b0] hover:text-[#ccd6f6] transition-colors"
          >
            <span>Portfolio</span>
            <ExternalLink className="w-3 h-3 text-[#64ffda]" />
          </a>

          <a
            href={ssoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded border border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10 transition-colors tracking-wide"
          >
            SSO Portal ↗
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#ccd6f6] hover:text-[#64ffda] p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#112240] border-b border-[#172a45] px-6 py-4 flex flex-col gap-4 font-mono text-sm">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 ${isActive('/') ? 'text-[#64ffda]' : 'text-[#ccd6f6]'}`}
          >
            Projects
          </Link>
          <Link
            to="/skills"
            onClick={() => setMobileMenuOpen(false)}
            className={`py-2 ${isActive('/skills') ? 'text-[#64ffda]' : 'text-[#ccd6f6]'}`}
          >
            Skills Arsenal
          </Link>
          {isAdmin ? (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#64ffda]"
            >
              Admin
            </Link>
          ) : null}
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 text-[#8892b0] flex items-center justify-between"
          >
            <span>Portfolio</span>
            <ExternalLink className="w-4 h-4 text-[#64ffda]" />
          </a>
          <a
            href={ssoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 text-center rounded border border-[#64ffda] text-[#64ffda]"
          >
            SSO Portal ↗
          </a>
        </div>
      )}
    </header>
  )
}
