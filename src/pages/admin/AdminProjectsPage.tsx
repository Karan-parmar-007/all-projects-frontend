import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Star, Trash2 } from 'lucide-react'
import {
  deleteProject,
  fetchAdminProjects,
  fetchProjectStatuses,
  setProjectFeatured,
  setProjectStatus,
} from '@/api'
import type { Project, ProjectStatus } from '@/types'

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const load = async (q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const [data, statusList] = await Promise.all([
        fetchAdminProjects({ q, pageSize: 100 }),
        fetchProjectStatuses(true),
      ])
      setProjects(data.items)
      setStatuses(statusList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#ccd6f6]">Projects</h1>
          <p className="mt-1 text-sm text-[#8892b0]">
            Create, feature, and publish apps shown on the portfolio and this site.
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded border border-[#64ffda] px-4 py-2 font-mono text-xs text-[#64ffda] hover:bg-[#64ffda]/10"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      <form
        className="mb-6"
        onSubmit={(e) => {
          e.preventDefault()
          void load(query)
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          className="w-full max-w-md rounded border border-[#233554] bg-[#112240] px-3 py-2 text-sm text-[#ccd6f6] outline-none focus:border-[#64ffda]"
        />
      </form>

      {loading ? (
        <p className="font-mono text-sm text-[#64ffda]">Loading…</p>
      ) : error ? (
        <p className="text-sm text-rose-400">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-[#8892b0]">No projects yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#172a45]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#112240] font-mono text-xs text-[#64ffda]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Stack</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-t border-[#172a45]">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/projects/${project.id}`}
                      className="font-medium text-[#ccd6f6] hover:text-[#64ffda]"
                    >
                      {project.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-[#8892b0]">/{project.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={project.status.id}
                      onChange={(e) => {
                        void setProjectStatus(project.id, e.target.value)
                          .then((updated) =>
                            setProjects((prev) =>
                              prev.map((p) => (p.id === updated.id ? updated : p)),
                            ),
                          )
                          .catch((err: Error) => setError(err.message))
                      }}
                      className="rounded border border-[#233554] bg-[#0a192f] px-2 py-1 text-xs text-[#ccd6f6]"
                    >
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        void setProjectFeatured(project.id, !project.isFeatured)
                          .then((updated) =>
                            setProjects((prev) =>
                              prev.map((p) => (p.id === updated.id ? updated : p)),
                            ),
                          )
                          .catch((err: Error) => setError(err.message))
                      }}
                      className={project.isFeatured ? 'text-[#64ffda]' : 'text-[#495670]'}
                      aria-label="Toggle featured"
                    >
                      <Star className="h-4 w-4" fill={project.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8892b0]">
                    {(project.techStack || []).slice(0, 4).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`Delete “${project.name}”?`)) return
                        void deleteProject(project.id)
                          .then(() => setProjects((prev) => prev.filter((p) => p.id !== project.id)))
                          .catch((err: Error) => setError(err.message))
                      }}
                      className="text-[#8892b0] hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
