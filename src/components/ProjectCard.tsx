import React from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, ArrowUpRight } from 'lucide-react'
import { GithubIcon } from '@/components/GithubIcon'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  onSelectSkill?: (skill: string) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectSkill }) => {
  const canLaunch = Boolean(project.liveUrl) && Boolean(project.status?.allowsAccess)
  const liveIsInternal = Boolean(project.liveUrl?.startsWith('/'))

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#172a45] bg-[#112240] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#64ffda]/50 hover:bg-[#152a4e] hover:shadow-[0_10px_30px_-15px_rgba(2,12,27,0.7)]">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link
              to={`/projects/${project.slug}`}
              className="transition-colors group-hover:text-[#64ffda]"
            >
              <h3 className="text-lg font-bold leading-snug tracking-tight text-[#ccd6f6]">
                {project.name}
              </h3>
            </Link>

            {project.isFeatured && (
              <span className="shrink-0 rounded border border-[#64ffda]/40 bg-[#64ffda]/20 px-2 py-0.5 font-mono text-[10px] font-medium text-[#64ffda]">
                ★ Featured
              </span>
            )}
            {project.status?.name ? (
              <span className="shrink-0 rounded-full border border-[#233554] bg-[#0a192f] px-2.5 py-1 font-mono text-[11px] text-[#8892b0]">
                {project.status.name}
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1.5 text-[#8892b0] transition-colors hover:bg-[#233554] hover:text-[#64ffda]"
                title="View Source on GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            )}

            {canLaunch && project.liveUrl ? (
              liveIsInternal ? (
                <Link
                  to={project.liveUrl}
                  className="rounded p-1.5 text-[#8892b0] transition-colors hover:bg-[#233554] hover:text-[#64ffda]"
                  title="Open Live App"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1.5 text-[#8892b0] transition-colors hover:bg-[#233554] hover:text-[#64ffda]"
                  title="Open Live Demo"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )
            ) : null}
          </div>
        </div>

        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-[#8892b0]">
          {project.shortDescription}
        </p>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap gap-1.5 border-t border-[#172a45]/60 pt-4">
          {project.techStack && project.techStack.length > 0 ? (
            project.techStack.map((tech: string) => (
              <button
                key={tech}
                type="button"
                onClick={() => onSelectSkill && onSelectSkill(tech)}
                className="cursor-pointer rounded bg-[#233554]/60 px-2 py-0.5 font-mono text-[11px] text-[#a8b2d1] transition-colors hover:bg-[#233554] hover:text-[#64ffda]"
              >
                {tech}
              </button>
            ))
          ) : (
            <span className="font-mono text-[11px] text-[#495670]">Full-Stack</span>
          )}
        </div>

        <div className="flex items-center justify-between font-mono text-xs">
          <Link
            to={`/projects/${project.slug}`}
            className="flex items-center gap-1 text-[#64ffda] hover:underline"
          >
            <span>Read overview</span>
            <span>→</span>
          </Link>

          {canLaunch && project.liveUrl ? (
            liveIsInternal ? (
              <Link
                to={project.liveUrl}
                className="flex items-center gap-1 text-[#8892b0] transition-colors hover:text-[#ccd6f6]"
              >
                <span>Launch</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#8892b0] transition-colors hover:text-[#ccd6f6]"
              >
                <span>Launch</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
