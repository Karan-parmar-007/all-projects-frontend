import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code, Terminal } from 'lucide-react'
import { fetchSkills } from '@/api'
import type { SkillCategoryGroup, SkillsResponse, Skill } from '@/types'

export const SkillsPage: React.FC = () => {
  const [categories, setCategories] = useState<SkillCategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSkills()
      .then((data: SkillsResponse) => {
        setCategories(data.items || [])
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-14 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#112240] border border-[#172a45] text-[#64ffda] font-mono text-xs mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>02. TECHNICAL ARSENAL</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-[#ccd6f6] tracking-tight mb-4">
          Skills & Technologies
        </h1>
        <p className="text-[#8892b0] text-base md:text-lg leading-relaxed">
          Technologies and tools utilized across my portfolio projects, AI engines, web scrapers,
          and backend architectures. Click any skill to explore the relevant projects.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-xl bg-[#112240] border border-[#172a45] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-[#112240] border border-rose-500/30 rounded-xl text-rose-400 font-mono text-sm">
          Failed to load skills: {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-16 text-center bg-[#112240] border border-[#172a45] rounded-xl text-[#8892b0] font-mono text-sm">
          No skills registered yet.
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((group: SkillCategoryGroup) => (
            <div key={group.name} className="bg-[#112240] rounded-xl border border-[#172a45] p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#172a45] pb-4 mb-6">
                <h2 className="text-xl font-bold text-[#ccd6f6] flex items-center gap-3">
                  <span className="font-mono text-sm text-[#64ffda]">//</span>
                  <span>{group.name}</span>
                </h2>
                <span className="font-mono text-xs text-[#8892b0]">
                  {group.skills.length} {group.skills.length === 1 ? 'skill' : 'skills'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.skills.map((skill: Skill) => (
                  <button
                    key={skill.id}
                    onClick={() => navigate(`/?skill=${encodeURIComponent(skill.name)}`)}
                    className="group text-left p-4 rounded-lg bg-[#0a192f] border border-[#172a45] hover:border-[#64ffda]/50 hover:bg-[#152a4e] transition-all cursor-pointer flex flex-col justify-between h-28"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#ccd6f6] group-hover:text-[#64ffda] transition-colors">
                          {skill.name}
                        </span>
                        <Code className="w-4 h-4 text-[#8892b0] group-hover:text-[#64ffda] transition-colors" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between font-mono text-xs text-[#8892b0] pt-2 border-t border-[#172a45]/40">
                      <span>{skill.projectCount} {skill.projectCount === 1 ? 'project' : 'projects'}</span>
                      <span className="text-[#64ffda] opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
