import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import {
  createTag,
  fetchAdminProject,
  fetchAdminSkills,
  fetchLiveApps,
  fetchProjectStatuses,
  fetchSsoRoles,
  fetchTags,
  saveProject,
} from '@/api'
import { RichTextEditor } from '@/components/RichTextEditor'
import type { LiveAppOption, ProjectStatus, Skill, SsoRole, Tag } from '@/types'

const inputClass =
  'w-full rounded-lg border border-[#233554] bg-[#0a192f] px-3 py-2 text-[#ccd6f6] outline-none focus:border-[#64ffda]'

export function AdminProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [ssoRoles, setSsoRoles] = useState<SsoRole[]>([])
  const [liveApps, setLiveApps] = useState<LiveAppOption[]>([])
  const [newTag, setNewTag] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('<p></p>')
  const [statusId, setStatusId] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [liveUrl, setLiveUrl] = useState('')
  const [appKey, setAppKey] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [roleNames, setRoleNames] = useState<string[]>([])
  const [cover, setCover] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [localCoverPreview, setLocalCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!cover) {
      setLocalCoverPreview(null)
      return
    }
    const url = URL.createObjectURL(cover)
    setLocalCoverPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [cover])

  const coverPreview = localCoverPreview || coverUrl

  useEffect(() => {
    void fetchAdminSkills()
      .then(setSkills)
      .catch((err: Error) => {
        setSkills([])
        setError((prev) => prev ?? `Failed to load skills: ${err.message}`)
      })
    void fetchTags().then(setTags).catch(() => setTags([]))
    void fetchProjectStatuses(true)
      .then((items) => {
        setStatuses(items)
        if (!id && items.length > 0) {
          const offline = items.find((s) => s.slug === 'offline')
          setStatusId((offline || items[0]).id)
        }
      })
      .catch(() => setStatuses([]))
    void fetchSsoRoles().then(setSsoRoles).catch(() => setSsoRoles([]))
    void fetchLiveApps().then(setLiveApps).catch(() => setLiveApps([]))
  }, [id])

  useEffect(() => {
    if (!id) return
    void fetchAdminProject(id)
      .then((project) => {
        setName(project.name)
        setSlug(project.slug)
        setShortDescription(project.shortDescription)
        setLongDescription(project.longDescription || '<p></p>')
        setStatusId(project.status.id)
        setIsFeatured(project.isFeatured)
        setLiveUrl(project.liveUrl || '')
        setAppKey(project.appKey || '')
        setGithubUrl(project.githubUrl || '')
        setTechStack(project.techStack || [])
        setTagIds((project.tags || []).map((t) => t.id))
        setRoleNames(project.requiredRoles || [])
        setCoverUrl(project.coverImageUrl || null)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const toggleSkill = (skillName: string) => {
    setTechStack((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === skillName.toLowerCase())
      if (exists) {
        return prev.filter((s) => s.toLowerCase() !== skillName.toLowerCase())
      }
      return [...prev, skillName]
    })
  }

  const toggleRole = (roleName: string) => {
    setRoleNames((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName],
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statusId) {
      setError('Pick a status')
      return
    }
    setSaving(true)
    setError(null)
    const fd = new FormData()
    fd.append('name', name)
    if (slug) fd.append('slug', slug)
    fd.append('short_description', shortDescription)
    fd.append('long_description', longDescription)
    fd.append('status_id', statusId)
    fd.append('is_featured', String(isFeatured))
    // Always send so empty values clear the DB fields
    fd.append('live_url', appKey ? '' : liveUrl)
    fd.append('app_key', appKey)
    fd.append('github_url', githubUrl)
    fd.append('tech_stack', JSON.stringify(techStack))
    fd.append('tag_ids', JSON.stringify(tagIds))
    fd.append('role_names', JSON.stringify(roleNames))
    if (cover) fd.append('cover_image', cover)
    try {
      await saveProject(fd, id)
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="font-mono text-sm text-[#64ffda]">Loading…</p>
  }

  return (
    <form className="space-y-8" onSubmit={(e) => void submit(e)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/admin" className="font-mono text-xs text-[#64ffda] hover:underline">
            ← All projects
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-[#ccd6f6]">
            {isEdit ? 'Edit project' : 'New project'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border border-[#64ffda] bg-[#64ffda]/10 px-5 py-2 font-mono text-sm text-[#64ffda] hover:bg-[#64ffda]/20 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <section className="overflow-hidden rounded-xl border border-[#172a45] bg-[#112240]">
        <label className="block cursor-pointer">
          {coverPreview ? (
            <img src={coverPreview} alt="" className="h-56 w-full object-cover sm:h-72" />
          ) : (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-[#8892b0] sm:h-72">
              <ImagePlus className="h-8 w-8 text-[#64ffda]" />
              <span className="font-mono text-xs">Click to add a cover image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="border-t border-[#172a45] px-4 py-3 font-mono text-xs text-[#8892b0]">
          Cover image — shown on the project page
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-[#ccd6f6]">Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[#ccd6f6]">Slug (optional)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${inputClass} font-mono text-sm`}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-[#ccd6f6]">Short description</span>
        <textarea
          required
          rows={3}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className={inputClass}
        />
      </label>

      <div>
        <p className="mb-2 text-sm text-[#ccd6f6]">Long description</p>
        <RichTextEditor value={longDescription} onChange={setLongDescription} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-[#ccd6f6]">Status</span>
          <select
            required
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select status
            </option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pt-7 text-sm text-[#ccd6f6]">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured
        </label>
      </div>

      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-[#ccd6f6]">Linked live app</span>
          <select
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            className={inputClass}
          >
            <option value="">None (showcase / external URL)</option>
            {liveApps.map((app) => (
              <option key={app.key} value={app.key}>
                {app.name} ({app.key})
              </option>
            ))}
          </select>
          {appKey ? (
            <p className="mt-1 text-xs text-[#8892b0]">
              Canonical URL: <span className="font-mono text-[#64ffda]">/apps/{slug || '<slug>'}</span>
              . Status and roles control access for every endpoint.
            </p>
          ) : (
            <p className="mt-1 text-xs text-[#8892b0]">
              Leave empty for portfolio-only projects. Set a live URL below if needed.
            </p>
          )}
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-[#ccd6f6]">Live URL</span>
            <input
              value={appKey ? `/apps/${slug || '…'}` : liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              disabled={Boolean(appKey)}
              className={`${inputClass} disabled:opacity-60`}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#ccd6f6]">GitHub URL</span>
            <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm text-[#ccd6f6]">Access roles</p>
        <p className="mb-2 text-xs text-[#8892b0]">
          When the app is live, only users with one of these SSO roles can access it. Leave empty for open access.
        </p>
        <div className="flex flex-wrap gap-2">
          {ssoRoles.map((role) => {
            const active = roleNames.includes(role.name)
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.name)}
                className={`rounded border px-2.5 py-1 font-mono text-xs ${
                  active
                    ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                    : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/40'
                }`}
              >
                {role.name}
              </button>
            )
          })}
        </div>
        {ssoRoles.length === 0 ? (
          <p className="mt-2 text-xs text-[#8892b0]">No SSO roles loaded.</p>
        ) : null}
        {roleNames.length > 0 ? (
          <button
            type="button"
            onClick={() => setRoleNames([])}
            className="mt-2 font-mono text-xs text-[#8892b0] hover:text-[#64ffda]"
          >
            Clear all roles
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-1 text-sm text-[#ccd6f6]">Skills / tech stack</p>
        <p className="mb-2 text-xs text-[#8892b0]">
          Click to select. Manage the catalog under{' '}
          <Link to="/admin/skills" className="text-[#64ffda] hover:underline">
            Admin → Skills
          </Link>
          .
        </p>
        {skills.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#233554] px-3 py-4 text-xs text-[#8892b0]">
            No skills loaded. Add some in Admin → Skills, then refresh this page.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const active = techStack.some(
                (name) => name.toLowerCase() === skill.name.toLowerCase(),
              )
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.name)}
                  className={`rounded border px-2.5 py-1 font-mono text-xs ${
                    active
                      ? 'border-[#64ffda] bg-[#64ffda]/10 text-[#64ffda]'
                      : 'border-[#233554] text-[#8892b0] hover:border-[#64ffda]/40'
                  }`}
                >
                  {skill.name}
                </button>
              )
            })}
          </div>
        )}
        {techStack.length > 0 ? (
          <p className="mt-2 font-mono text-[11px] text-[#8892b0]">
            Selected: {techStack.join(', ')}
          </p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-sm text-[#ccd6f6]">Tags</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = tagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setTagIds((prev) =>
                    active ? prev.filter((x) => x !== tag.id) : [...prev, tag.id],
                  )
                }
                className={`rounded border px-2.5 py-1 font-mono text-xs ${
                  active ? 'border-[#64ffda] text-[#64ffda]' : 'border-[#233554] text-[#8892b0]'
                }`}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag"
            className="rounded-lg border border-[#233554] bg-[#0a192f] px-3 py-1.5 text-sm text-[#ccd6f6] outline-none focus:border-[#64ffda]"
          />
          <button
            type="button"
            onClick={() => {
              if (!newTag.trim()) return
              void createTag(newTag.trim())
                .then((tag) => {
                  setTags((prev) => [...prev, tag])
                  setTagIds((prev) => [...prev, tag.id])
                  setNewTag('')
                })
                .catch((err: Error) => setError(err.message))
            }}
            className="rounded-lg border border-[#64ffda] px-3 py-1.5 font-mono text-xs text-[#64ffda]"
          >
            Add tag
          </button>
        </div>
      </div>
    </form>
  )
}
