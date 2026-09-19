import { useEffect, useMemo, useState } from 'react'
import {
  createSkillCategory,
  deleteSkill,
  deleteSkillCategory,
  fetchAdminSkillCategories,
  fetchAdminSkills,
  saveSkill,
  updateSkillCategory,
} from '@/api'
import type { Skill, SkillCategoryGroup } from '@/types'

export function AdminSkillsPage() {
  const [categories, setCategories] = useState<SkillCategoryGroup[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [error, setError] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [skillName, setSkillName] = useState('')
  const [skillCategory, setSkillCategory] = useState('')
  const [showInAbout, setShowInAbout] = useState(false)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const homeCount = categories.filter((c) => c.showOnHome).length

  const load = async () => {
    setError(null)
    try {
      const [cats, skillList] = await Promise.all([
        fetchAdminSkillCategories(),
        fetchAdminSkills(),
      ])
      setCategories(cats)
      setSkills(skillList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string | null, Skill[]>()
    for (const skill of skills) {
      const key = skill.categoryId ?? null
      const list = map.get(key) ?? []
      list.push(skill)
      map.set(key, list)
    }
    return map
  }, [skills])

  const resetSkillForm = () => {
    setEditingId(null)
    setSkillName('')
    setSkillCategory('')
    setShowInAbout(false)
    setIconFile(null)
  }

  const submitSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', skillName)
    if (skillCategory) fd.append('category_id', skillCategory)
    fd.append('show_in_about', String(showInAbout))
    if (iconFile) fd.append('icon', iconFile)
    try {
      await saveSkill(fd, editingId ?? undefined)
      resetSkillForm()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save skill')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#ccd6f6]">Skills</h1>
        <p className="mt-1 text-sm text-[#8892b0]">
          Categories and skills used by this site and the portfolio. Toggle Home on up to 3
          categories. About skills appear on the portfolio About section.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#172a45] bg-[#112240] p-5">
          <h2 className="mb-3 font-semibold text-[#ccd6f6]">
            Categories
            <span className="ml-2 font-mono text-xs font-normal text-[#8892b0]">
              {homeCount}/3 on home
            </span>
          </h2>
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!categoryName.trim()) return
              void createSkillCategory({ name: categoryName.trim() })
                .then(() => {
                  setCategoryName('')
                  return load()
                })
                .catch((err: Error) => setError(err.message))
            }}
          >
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="New category"
              className="flex-1 rounded border border-[#233554] bg-[#0a192f] px-3 py-2 text-sm text-[#ccd6f6] outline-none focus:border-[#64ffda]"
            />
            <button
              type="submit"
              className="rounded border border-[#64ffda] px-3 py-2 font-mono text-xs text-[#64ffda]"
            >
              Add
            </button>
          </form>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-2">
                <input
                  defaultValue={cat.name}
                  onBlur={(e) => {
                    const next = e.target.value.trim()
                    if (next && cat.id && next !== cat.name) {
                      void updateSkillCategory(cat.id, { name: next })
                        .then(() => load())
                        .catch((err: Error) => setError(err.message))
                    }
                  }}
                  className="flex-1 rounded border border-[#233554] bg-[#0a192f] px-2 py-1.5 text-sm text-[#ccd6f6]"
                />
                <label className="flex items-center gap-1 font-mono text-[11px] text-[#8892b0]">
                  <input
                    type="checkbox"
                    checked={Boolean(cat.showOnHome)}
                    disabled={!cat.showOnHome && homeCount >= 3}
                    onChange={(e) => {
                      if (!cat.id) return
                      void updateSkillCategory(cat.id, { showOnHome: e.target.checked })
                        .then(() => load())
                        .catch((err: Error) => setError(err.message))
                    }}
                  />
                  Home
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!cat.id) return
                    if (!window.confirm(`Delete “${cat.name}”?`)) return
                    void deleteSkillCategory(cat.id)
                      .then(() => load())
                      .catch((err: Error) => setError(err.message))
                  }}
                  className="text-xs text-[#8892b0] hover:text-rose-400"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[#172a45] bg-[#112240] p-5">
          <h2 className="mb-3 font-semibold text-[#ccd6f6]">
            {editingId ? 'Edit skill' : 'Add skill'}
          </h2>
          <form className="space-y-3" onSubmit={(e) => void submitSkill(e)}>
            <input
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Skill name"
              className="w-full rounded border border-[#233554] bg-[#0a192f] px-3 py-2 text-sm text-[#ccd6f6] outline-none focus:border-[#64ffda]"
            />
            <select
              value={skillCategory}
              onChange={(e) => setSkillCategory(e.target.value)}
              className="w-full rounded border border-[#233554] bg-[#0a192f] px-3 py-2 text-sm text-[#ccd6f6]"
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id ?? ''}>
                  {c.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-[#ccd6f6]">
              <input
                type="checkbox"
                checked={showInAbout}
                onChange={(e) => setShowInAbout(e.target.checked)}
              />
              Show in About
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
              className="text-sm text-[#8892b0]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded border border-[#64ffda] px-4 py-2 font-mono text-xs text-[#64ffda]"
              >
                {editingId ? 'Save' : 'Create'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetSkillForm}
                  className="rounded border border-[#233554] px-4 py-2 font-mono text-xs text-[#8892b0]"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>

      <section className="space-y-6">
        {[...categories, { id: null, name: 'Uncategorised', sequence: 999, skills: [] }].map(
          (cat) => {
            const group = grouped.get(cat.id) ?? []
            if (group.length === 0 && cat.id === null) return null
            return (
              <div key={cat.id ?? 'none'} className="rounded-xl border border-[#172a45] p-5">
                <h3 className="mb-3 font-mono text-xs text-[#64ffda]">{cat.name}</h3>
                <ul className="space-y-2">
                  {group.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex items-center justify-between gap-3 rounded border border-[#172a45] bg-[#112240] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {skill.iconUrl ? (
                          <img src={skill.iconUrl} alt="" className="h-5 w-5 object-contain" />
                        ) : null}
                        <span className="text-[#ccd6f6]">{skill.name}</span>
                        {skill.showInAbout ? (
                          <span className="font-mono text-[10px] text-[#64ffda]">about</span>
                        ) : null}
                      </div>
                      <div className="flex gap-3 text-xs">
                        <button
                          type="button"
                          className="text-[#8892b0] hover:text-[#64ffda]"
                          onClick={() => {
                            setEditingId(skill.id)
                            setSkillName(skill.name)
                            setSkillCategory(skill.categoryId ?? '')
                            setShowInAbout(Boolean(skill.showInAbout))
                            setIconFile(null)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-[#8892b0] hover:text-rose-400"
                          onClick={() => {
                            if (!window.confirm(`Delete “${skill.name}”?`)) return
                            void deleteSkill(skill.id)
                              .then(() => load())
                              .catch((err: Error) => setError(err.message))
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          },
        )}
      </section>
    </div>
  )
}
