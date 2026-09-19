export interface ProjectStatus {
  id: string
  name: string
  slug: string
  sequence: number
  showInList: boolean
  allowsAccess: boolean
}

export interface Project {
  id: string
  name: string
  slug: string
  shortDescription: string
  longDescription?: string
  status: ProjectStatus
  isFeatured: boolean
  sequence: number
  liveUrl?: string | null
  appKey?: string | null
  githubUrl?: string | null
  coverImageKey?: string | null
  coverImageUrl?: string | null
  techStack: string[]
  tags?: Tag[]
  requiredRoles: string[]
  createdAt: string
  updatedAt?: string
}

export interface Tag {
  id: string
  name: string
}

export interface Skill {
  id: string
  name: string
  sequence?: number
  categoryId?: string | null
  categoryName?: string | null
  projectCount: number
  showInAbout?: boolean
  iconKey?: string | null
  iconUrl?: string | null
}

export interface SkillCategoryGroup {
  id: string | null
  name: string
  sequence: number
  showOnHome?: boolean
  skills: Skill[]
}

export interface SkillsResponse {
  items: SkillCategoryGroup[]
  allSkills: Skill[]
}

export interface SessionResponse {
  authenticated: boolean
  is_owner: boolean
  is_admin: boolean
  email: string | null
  user_id: string | null
  role_name: string | null
  name: string | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface SsoRole {
  id: string
  name: string
}

export interface LiveAppOption {
  key: string
  name: string
  description: string
}

export interface AppBootstrap {
  projectId: string
  projectSlug: string
  projectName: string
  appKey: string
  statusSlug: string
  statusName: string
  allowsAccess: boolean
  requiredRoles: string[]
  canAccess: boolean
  liveUrl: string
}
