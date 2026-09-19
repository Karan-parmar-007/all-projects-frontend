import type {
  AppBootstrap,
  LiveAppOption,
  Paginated,
  Project,
  ProjectStatus,
  SessionResponse,
  Skill,
  SkillCategoryGroup,
  SkillsResponse,
  SsoRole,
  Tag,
} from '@/types'
import { getCsrfToken } from '@/lib/csrf'
import { notifyUnauthenticated, ssoLoginUrl } from '@/lib/sso'

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/allprojects'

function authBase(): string {
  try {
    return `${new URL(BASE_URL).origin}/api/auth`
  } catch {
    return '/api/auth'
  }
}

export function resolveMediaUrl(url?: string | null, key?: string | null): string | null {
  if (key) {
    const path = key
      .replace(/^\/+/, '')
      .split('/')
      .map(encodeURIComponent)
      .join('/')
    return `${BASE_URL}/media/${path}`
  }
  if (!url) return null
  const garageIdx = url.indexOf('/apps/')
  if (url.includes(':3900/') && garageIdx >= 0) {
    return `${BASE_URL}/media${url.slice(garageIdx)}`
  }
  if (url.startsWith('/api/allprojects/')) {
    return `${BASE_URL}${url.slice('/api/allprojects'.length)}`
  }
  if (url.startsWith('/api/v1/')) {
    return `${BASE_URL}${url.slice('/api/v1'.length)}`
  }
  return url
}

const anonymousSession: SessionResponse = {
  authenticated: false,
  is_owner: false,
  is_admin: false,
  email: null,
  user_id: null,
  role_name: null,
  name: null,
}

let refreshPromise: Promise<boolean> | null = null

function pick<T>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key] as T
    }
  }
  return undefined
}

export function mapTag(raw: Record<string, unknown>): Tag {
  return {
    id: String(raw.id),
    name: String(raw.name),
  }
}

export function mapStatus(raw: Record<string, unknown>): ProjectStatus {
  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: String(raw.slug),
    sequence: Number(raw.sequence ?? 0),
    showInList: Boolean(pick(raw, 'showInList', 'show_in_list') ?? true),
    allowsAccess: Boolean(pick(raw, 'allowsAccess', 'allows_access') ?? false),
  }
}

export function mapProject(raw: Record<string, unknown>): Project {
  const tagsRaw = (pick<unknown[]>(raw, 'tags') ?? []) as Record<string, unknown>[]
  const statusRaw = pick<Record<string, unknown>>(raw, 'status')
  const rolesRaw = (pick<unknown[]>(raw, 'requiredRoles', 'required_roles') ?? []) as unknown[]
  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: String(raw.slug),
    shortDescription: String(pick(raw, 'shortDescription', 'short_description') ?? ''),
    longDescription: pick<string>(raw, 'longDescription', 'long_description'),
    status: statusRaw
      ? mapStatus(statusRaw)
      : {
          id: '',
          name: String(raw.status ?? 'Unknown'),
          slug: String(raw.status ?? 'unknown'),
          sequence: 0,
          showInList: true,
          allowsAccess: false,
        },
    isFeatured: Boolean(pick(raw, 'isFeatured', 'is_featured')),
    sequence: Number(raw.sequence ?? 0),
    liveUrl: pick<string | null>(raw, 'liveUrl', 'live_url') ?? null,
    appKey: pick<string | null>(raw, 'appKey', 'app_key') ?? null,
    githubUrl: pick<string | null>(raw, 'githubUrl', 'github_url') ?? null,
    coverImageKey: pick<string | null>(raw, 'coverImageKey', 'cover_image_key') ?? null,
    coverImageUrl: resolveMediaUrl(
      pick<string | null>(raw, 'coverImageUrl', 'cover_image_url'),
      pick<string | null>(raw, 'coverImageKey', 'cover_image_key'),
    ),
    techStack: (pick<string[]>(raw, 'techStack', 'tech_stack') ?? []) as string[],
    tags: tagsRaw.map(mapTag),
    requiredRoles: rolesRaw.map(String),
    createdAt: String(pick(raw, 'createdAt', 'created_at') ?? ''),
    updatedAt: pick<string>(raw, 'updatedAt', 'updated_at'),
  }
}

export function mapSkill(raw: Record<string, unknown>): Skill {
  return {
    id: String(raw.id),
    name: String(raw.name),
    sequence: Number(raw.sequence ?? 0),
    categoryId: pick<string | null>(raw, 'categoryId', 'category_id') ?? null,
    categoryName: pick<string | null>(raw, 'categoryName', 'category_name') ?? null,
    projectCount: Number(pick(raw, 'projectCount', 'project_count') ?? 0),
    showInAbout: Boolean(pick(raw, 'showInAbout', 'show_in_about')),
    iconKey: pick<string | null>(raw, 'iconKey', 'icon_key') ?? null,
    iconUrl: resolveMediaUrl(
      pick<string | null>(raw, 'iconUrl', 'icon_url'),
      pick<string | null>(raw, 'iconKey', 'icon_key'),
    ),
  }
}

export function mapSkillGroup(raw: Record<string, unknown>): SkillCategoryGroup {
  const skills = ((raw.skills as Record<string, unknown>[]) || []).map(mapSkill)
  return {
    id: raw.id == null ? null : String(raw.id),
    name: String(raw.name),
    sequence: Number(raw.sequence ?? 0),
    showOnHome: Boolean(pick(raw, 'showOnHome', 'show_on_home')),
    skills,
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body.detail || body.message || res.statusText
  } catch {
    return res.statusText
  }
}

function isAuthLifecycle(path: string): boolean {
  return (
    path.startsWith('/auth/session') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/logout')
  )
}

async function rawFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const method = (init.method || 'GET').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = getCsrfToken()
    if (csrf) headers.set('X-CSRF-Token', csrf)
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })
}

export async function refreshAuth(): Promise<boolean> {
  const headers = new Headers()
  const csrf = getCsrfToken()
  if (csrf) headers.set('X-CSRF-Token', csrf)
  const res = await fetch(`${authBase()}/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: '{}',
  })
  return res.ok
}

function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAuth().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function redirectToSsoAfterAuthFailure(): void {
  const path = window.location.pathname
  if (path.startsWith('/admin') || path.startsWith('/apps/')) {
    window.location.replace(ssoLoginUrl(path))
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let res = await rawFetch(path, init)
  if (res.status !== 401 || isAuthLifecycle(path)) {
    return res
  }

  const refreshed = await refreshOnce()
  if (refreshed) {
    res = await rawFetch(path, init)
  }

  if (res.status === 401) {
    notifyUnauthenticated()
    redirectToSsoAfterAuthFailure()
  }
  return res
}

function mapSession(raw: Record<string, unknown>): SessionResponse {
  return {
    authenticated: Boolean(raw.authenticated),
    is_owner: Boolean(raw.is_owner ?? raw.isOwner),
    is_admin: Boolean(raw.is_admin ?? raw.isAdmin),
    email: (raw.email as string | null) ?? null,
    user_id: ((raw.user_id ?? raw.userId) as string | null) ?? null,
    role_name: ((raw.role_name ?? raw.roleName) as string | null) ?? null,
    name: (raw.name as string | null) ?? null,
  }
}

export async function fetchSession(): Promise<SessionResponse> {
  const read = async (): Promise<SessionResponse> => {
    const res = await rawFetch('/auth/session')
    if (!res.ok) return anonymousSession
    return mapSession(await res.json())
  }

  let session = await read()
  if (!session.authenticated) {
    const refreshed = await refreshOnce()
    if (refreshed) session = await read()
  }
  return session
}

export async function fetchProjects(params?: { q?: string }): Promise<Project[]> {
  const url = new URL(`${BASE_URL}/projects`)
  if (params?.q) url.searchParams.set('q', params.q)
  url.searchParams.set('page_size', '50')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`)
  const data = await res.json()
  return (data.items || []).map((p: Record<string, unknown>) => mapProject(p))
}

export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const res = await fetch(`${BASE_URL}/projects/${slug}`)
  if (!res.ok) throw new Error(`Project not found: ${res.statusText}`)
  return mapProject(await res.json())
}

export async function fetchSkills(): Promise<SkillsResponse> {
  const res = await fetch(`${BASE_URL}/skills`)
  if (!res.ok) throw new Error(`Failed to fetch skills: ${res.statusText}`)
  const data = await res.json()
  const items = (data.items || []).map((g: Record<string, unknown>) => mapSkillGroup(g))
  const allSkills = (data.allSkills || data.all_skills || []).map((s: Record<string, unknown>) =>
    mapSkill(s),
  )
  return { items, allSkills }
}

export async function fetchAdminProjects(params?: {
  q?: string
  page?: number
  pageSize?: number
}): Promise<Paginated<Project>> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  query.set('page', String(params?.page ?? 1))
  query.set('page_size', String(params?.pageSize ?? 50))
  const res = await apiFetch(`/admin/projects?${query.toString()}`)
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return {
    items: (data.items || []).map((p: Record<string, unknown>) => mapProject(p)),
    total: data.total ?? 0,
    page: data.page ?? 1,
    page_size: data.page_size ?? data.pageSize ?? 50,
    total_pages: data.total_pages ?? data.totalPages ?? 0,
  }
}

export async function fetchAdminProject(id: string): Promise<Project> {
  const res = await apiFetch(`/admin/projects/${id}`)
  if (!res.ok) throw new Error(await parseError(res))
  return mapProject(await res.json())
}

export async function saveProject(form: FormData, id?: string): Promise<Project> {
  const res = await apiFetch(id ? `/admin/projects/${id}` : '/admin/projects', {
    method: id ? 'PUT' : 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapProject(await res.json())
}

export async function deleteProject(id: string): Promise<void> {
  const res = await apiFetch(`/admin/projects/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function setProjectFeatured(id: string, isFeatured: boolean): Promise<Project> {
  const res = await apiFetch(`/admin/projects/${id}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ is_featured: isFeatured, isFeatured }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapProject(await res.json())
}

export async function setProjectStatus(id: string, statusId: string): Promise<Project> {
  const res = await apiFetch(`/admin/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status_id: statusId, statusId }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapProject(await res.json())
}

export async function fetchProjectStatuses(admin = false): Promise<ProjectStatus[]> {
  const path = admin ? '/admin/project-statuses' : '/project-statuses'
  const res = admin ? await apiFetch(path) : await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(admin ? await parseError(res) : res.statusText)
  const data = await res.json()
  return ((data.items || []) as Record<string, unknown>[]).map(mapStatus)
}

export async function createProjectStatus(payload: {
  name: string
  showInList?: boolean
  allowsAccess?: boolean
}): Promise<ProjectStatus> {
  const res = await apiFetch('/admin/project-statuses', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      show_in_list: payload.showInList ?? true,
      showInList: payload.showInList ?? true,
      allows_access: payload.allowsAccess ?? false,
      allowsAccess: payload.allowsAccess ?? false,
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapStatus(await res.json())
}

export async function updateProjectStatus(
  id: string,
  payload: { name?: string; showInList?: boolean; allowsAccess?: boolean },
): Promise<ProjectStatus> {
  const body: Record<string, unknown> = {}
  if (payload.name !== undefined) body.name = payload.name
  if (payload.showInList !== undefined) {
    body.show_in_list = payload.showInList
    body.showInList = payload.showInList
  }
  if (payload.allowsAccess !== undefined) {
    body.allows_access = payload.allowsAccess
    body.allowsAccess = payload.allowsAccess
  }
  const res = await apiFetch(`/admin/project-statuses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapStatus(await res.json())
}

export async function deleteProjectStatus(id: string): Promise<void> {
  const res = await apiFetch(`/admin/project-statuses/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function fetchSsoRoles(): Promise<SsoRole[]> {
  const res = await apiFetch('/admin/sso-roles')
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return ((data.items || []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    name: String(r.name),
  }))
}

export async function fetchLiveApps(): Promise<LiveAppOption[]> {
  const res = await apiFetch('/admin/projects/live-apps')
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return ((data.items || []) as Record<string, unknown>[]).map((raw) => ({
    key: String(raw.key),
    name: String(raw.name),
    description: String(raw.description ?? ''),
  }))
}

export async function fetchAppBootstrap(projectSlug: string): Promise<AppBootstrap> {
  const res = await apiFetch(`/apps/${encodeURIComponent(projectSlug)}/bootstrap`)
  if (!res.ok) throw new Error(await parseError(res))
  const raw = await res.json()
  return {
    projectId: String(raw.projectId ?? raw.project_id),
    projectSlug: String(raw.projectSlug ?? raw.project_slug),
    projectName: String(raw.projectName ?? raw.project_name),
    appKey: String(raw.appKey ?? raw.app_key),
    statusSlug: String(raw.statusSlug ?? raw.status_slug),
    statusName: String(raw.statusName ?? raw.status_name),
    allowsAccess: Boolean(raw.allowsAccess ?? raw.allows_access),
    requiredRoles: ((raw.requiredRoles ?? raw.required_roles ?? []) as unknown[]).map(String),
    canAccess: Boolean(raw.canAccess ?? raw.can_access),
    liveUrl: String(raw.liveUrl ?? raw.live_url ?? ''),
  }
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await apiFetch('/admin/projects/tags/all')
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return (data.items || []).map((t: Record<string, unknown>) => mapTag(t))
}

export async function createTag(name: string): Promise<Tag> {
  const res = await apiFetch('/admin/projects/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapTag(await res.json())
}

export async function uploadAdminMedia(file: File): Promise<{ key: string; url: string }> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await apiFetch('/admin/media', { method: 'POST', body: fd })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { key: string; url: string }
  return { key: data.key, url: resolveMediaUrl(data.url, data.key) || data.url }
}

export async function fetchAdminSkillCategories(): Promise<SkillCategoryGroup[]> {
  const res = await apiFetch('/admin/skill-categories')
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return (data.items || []).map((g: Record<string, unknown>) => mapSkillGroup(g))
}

export async function fetchAdminSkills(): Promise<Skill[]> {
  const res = await apiFetch('/admin/skills')
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return (data.items || []).map((s: Record<string, unknown>) => mapSkill(s))
}

export async function createSkillCategory(payload: {
  name: string
  showOnHome?: boolean
}): Promise<SkillCategoryGroup> {
  const res = await apiFetch('/admin/skill-categories', {
    method: 'POST',
    body: JSON.stringify({ name: payload.name, show_on_home: payload.showOnHome ?? false }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapSkillGroup(await res.json())
}

export async function updateSkillCategory(
  id: string,
  payload: { name?: string; showOnHome?: boolean },
): Promise<SkillCategoryGroup> {
  const body: Record<string, unknown> = {}
  if (payload.name !== undefined) body.name = payload.name
  if (payload.showOnHome !== undefined) body.show_on_home = payload.showOnHome
  const res = await apiFetch(`/admin/skill-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapSkillGroup(await res.json())
}

export async function deleteSkillCategory(id: string): Promise<void> {
  const res = await apiFetch(`/admin/skill-categories/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function saveSkill(form: FormData, id?: string): Promise<Skill> {
  const res = await apiFetch(id ? `/admin/skills/${id}` : '/admin/skills', {
    method: id ? 'PUT' : 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(await parseError(res))
  return mapSkill(await res.json())
}

export async function deleteSkill(id: string): Promise<void> {
  const res = await apiFetch(`/admin/skills/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await parseError(res))
}
