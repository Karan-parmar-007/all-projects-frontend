import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { GithubIcon } from '@/components/GithubIcon'
import { ProjectBody } from '@/components/ProjectBody'
import { fetchProjectBySlug } from '@/api'
import type { Project } from '@/types'

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchProjectBySlug(slug)
      .then((data: Project) => {
        setProject(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-6 py-20">
        <div className="h-6 w-32 rounded bg-[#112240]" />
        <div className="h-64 rounded-xl bg-[#112240]" />
        <div className="h-12 w-3/4 rounded bg-[#112240]" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-[#ccd6f6]">Project Not Found</h2>
        <p className="mb-6 text-[#8892b0]">{error || 'The requested project could not be located.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded border border-[#172a45] bg-[#112240] px-4 py-2 font-mono text-xs text-[#64ffda] hover:border-[#64ffda]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Projects</span>
        </Link>
      </div>
    )
  }

  const canLaunch = Boolean(project.liveUrl) && Boolean(project.status?.allowsAccess)
  const liveIsInternal = Boolean(project.liveUrl?.startsWith('/'))

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 font-mono text-xs text-[#8892b0] transition-colors hover:text-[#64ffda]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Projects</span>
      </Link>

      {project.coverImageUrl ? (
        <img
          src={project.coverImageUrl}
          alt={project.name}
          className="mb-8 h-56 w-full rounded-xl border border-[#172a45] object-cover sm:h-80"
        />
      ) : null}

      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-[#ccd6f6] md:text-4xl">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {project.isFeatured && (
                <span className="rounded border border-[#64ffda]/40 bg-[#64ffda]/20 px-2.5 py-1 font-mono text-xs text-[#64ffda]">
                  ★ Featured
                </span>
              )}
              {project.status?.name ? (
                <span className="rounded-full border border-[#233554] bg-[#112240] px-3 py-1 font-mono text-xs text-[#8892b0]">
                  {project.status.name}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-[#172a45] bg-[#112240] px-4 py-2 font-mono text-xs text-[#ccd6f6] transition-all hover:border-[#64ffda] hover:text-[#64ffda]"
              >
                <GithubIcon className="h-4 w-4" />
                <span>Source Code</span>
              </a>
            )}

            {canLaunch && project.liveUrl ? (
              liveIsInternal ? (
                <Link
                  to={project.liveUrl}
                  className="inline-flex items-center gap-1.5 rounded bg-[#64ffda] px-4 py-2 font-mono text-xs font-semibold text-[#0a192f] hover:bg-[#64ffda]/90"
                >
                  <span>Launch App</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded bg-[#64ffda] px-4 py-2 font-mono text-xs font-semibold text-[#0a192f] hover:bg-[#64ffda]/90"
                >
                  <span>Launch App</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )
            ) : null}
          </div>
        </div>

        <p className="mb-6 text-base leading-relaxed text-[#8892b0]">{project.shortDescription}</p>

        {project.techStack.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-[#172a45] pt-6">
            {project.techStack.map((tech: string) => (
              <button
                key={tech}
                onClick={() => navigate(`/?skill=${encodeURIComponent(tech)}`)}
                className="cursor-pointer rounded border border-[#172a45] bg-[#112240] px-3 py-1 font-mono text-xs text-[#64ffda] transition-colors hover:bg-[#233554]"
              >
                {tech}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {project.longDescription ? (
        <div className="rounded-xl border border-[#172a45] bg-[#112240] p-6 sm:p-8">
          <ProjectBody html={project.longDescription} />
        </div>
      ) : null}
    </article>
  )
}
