import React from 'react'

export const Footer: React.FC = () => {
  const portfolioUrl = import.meta.env.VITE_PORTFOLIO_URL || 'http://localhost:5174'

  return (
    <footer className="border-t border-[#172a45] bg-[#0a192f] py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-[#8892b0]">
        <div>
          <span>Designed & Built by </span>
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#64ffda] hover:underline"
          >
            Karan Parmar
          </a>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Karan-parmar-007"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#64ffda] transition-colors"
          >
            GitHub
          </a>
          <span>•</span>
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#64ffda] transition-colors"
          >
            Portfolio
          </a>
          <span>•</span>
          <span className="text-[#495670]">apps.karanparmar.in</span>
        </div>
      </div>
    </footer>
  )
}
