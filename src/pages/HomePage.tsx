import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, X, Sparkles, Terminal } from 'lucide-react'
import { fetchProjects, fetchProjectStatuses } from '@/api'
import { ProjectCard } from '@/components/ProjectCard'
import type { Project, ProjectStatus } from '@/types'

export const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const selectedSkill = searchParams.get('skill') || ''
  const statusFilter = searchParams.get('status') || 'all'

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    Promise.all([fetchProjects(), fetchProjectStatuses(false)])
      .then(([projectData, statusData]) => {
        if (isMounted) {
          setProjects(projectData)
          setStatuses(statusData)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  const allSkills = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p: Project) => {
      ;(p.techStack || []).forEach((t: string) => set.add(t))
    })
    return Array.from(set).sort()
  }, [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((p: Project) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(q)
        const matchDesc = p.shortDescription.toLowerCase().includes(q)
        const matchTech = (p.techStack || []).some((t: string) => t.toLowerCase().includes(q))
        if (!matchName && !matchDesc && !matchTech) return false
      }

      if (selectedSkill) {
        const hasSkill = (p.techStack || []).some(
          (t: string) => t.toLowerCase() === selectedSkill.toLowerCase(),
        )
        if (!hasSkill) return false
      }

      if (statusFilter !== 'all') {
        if (p.status?.slug !== statusFilter && p.status?.id !== statusFilter) return false
      }

      return true
    })
  }, [projects, searchQuery, selectedSkill, statusFilter])

  const handleSelectSkill = (skill: string) => {
    const params = new URLSearchParams(searchParams)
    if (selectedSkill.toLowerCase() === skill.toLowerCase()) {
      params.delete('skill')
    } else {
      params.set('skill', skill)
    }
    setSearchParams(params)
  }

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    setSearchParams(params)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-14 max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#172a45] bg-[#112240] px-3 py-1 font-mono text-xs text-[#64ffda]">
          <Terminal className="h-3.5 w-3.5" />
          <span>// karanparmar.in ecosystem</span>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-[#ccd6f6] md:text-5xl">
          Projects
        </h1>
        <p className="text-base leading-relaxed text-[#8892b0] md:text-lg">
          A centralized directory of all applications, machine learning experiments, scrapers,
          and utilities built by Karan Parmar. Hosted across dedicated subdomains and local sandboxes.
        </p>
      </div>

      <div className="mb-10 rounded-xl border border-[#172a45] bg-[#112240] p-5 shadow-lg">
        <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8892b0]" />
            <input
              type="text"
              placeholder="Search by title, description, or stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#172a45] bg-[#0a192f] py-2 pl-10 pr-4 text-sm text-[#ccd6f6] placeholder-[#495670] transition-colors focus:border-[#64ffda] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8892b0] hover:text-[#ccd6f6]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex max-w-full flex-wrap items-center gap-1 self-start rounded-lg border border-[#172a45] bg-[#0a192f] p-1 font-mono text-xs md:self-auto">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`rounded px-3 py-1.5 transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#233554] font-medium text-[#64ffda]'
                  : 'text-[#8892b0] hover:text-[#ccd6f6]'
              }`}
            >
              All
            </button>
            {statuses.map((st) => (
              <button
                key={st.id}
                onClick={() => handleStatusFilter(st.slug)}
                className={`rounded px-3 py-1.5 transition-colors ${
                  statusFilter === st.slug
                    ? 'bg-[#233554] font-medium text-[#64ffda]'
                    : 'text-[#8892b0] hover:text-[#ccd6f6]'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {allSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#172a45] pt-4">
            <span className="mr-1 flex items-center gap-1 font-mono text-xs text-[#8892b0]">
              <Filter className="h-3 w-3 text-[#64ffda]" />
              <span>Filter by Stack:</span>
            </span>
            {allSkills.map((skill: string) => {
              const active = selectedSkill.toLowerCase() === skill.toLowerCase()
              return (
                <button
                  key={skill}
                  onClick={() => handleSelectSkill(skill)}
                  className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs transition-all ${
                    active
                      ? 'bg-[#64ffda] font-semibold text-[#0a192f] shadow-[0_0_10px_rgba(100,255,218,0.3)]'
                      : 'border border-[#172a45] bg-[#0a192f] text-[#8892b0] hover:border-[#64ffda]/40 hover:text-[#ccd6f6]'
                  }`}
                >
                  {skill}
                </button>
              )
            })}
            {(selectedSkill || statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-[#8892b0] hover:text-[#64ffda]"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="font-mono text-sm text-[#64ffda]">Loading projects…</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-2 font-mono text-xs text-[#8892b0]">
            <Sparkles className="h-3.5 w-3.5 text-[#64ffda]" />
            <span>
              Showing {filteredProjects.length} of {projects.length} projects.
            </span>
          </div>
          {filteredProjects.length === 0 ? (
            <p className="text-sm text-[#8892b0]">No projects match these filters.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelectSkill={handleSelectSkill}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
