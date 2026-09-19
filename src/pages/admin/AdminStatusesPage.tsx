import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  createProjectStatus,
  deleteProjectStatus,
  fetchProjectStatuses,
  updateProjectStatus,
} from '@/api'
import type { ProjectStatus } from '@/types'

export function AdminStatusesPage() {
  const [statuses, setStatuses] = useState<ProjectStatus[]>([])
  const [name, setName] = useState('')
  const [showInList, setShowInList] = useState(true)
  const [allowsAccess, setAllowsAccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setStatuses(await fetchProjectStatuses(true))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statuses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#ccd6f6]">Statuses</h1>
        <p className="mt-1 text-sm text-[#8892b0]">
          Create and manage project statuses. “Allows access” controls whether linked live
          apps can be used.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border border-[#172a45] bg-[#112240] p-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          void createProjectStatus({
            name: name.trim(),
            showInList,
            allowsAccess,
          })
            .then(() => {
              setName('')
              setShowInList(true)
              setAllowsAccess(false)
              return load()
            })
            .catch((err: Error) => setError(err.message))
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block text-[#ccd6f6]">New status</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Prototype"
            className="rounded-lg border border-[#233554] bg-[#0a192f] px-3 py-2 text-[#ccd6f6] outline-none focus:border-[#64ffda]"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-[#ccd6f6]">
          <input
            type="checkbox"
            checked={showInList}
            onChange={(e) => setShowInList(e.target.checked)}
          />
          Show in public list
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-[#ccd6f6]">
          <input
            type="checkbox"
            checked={allowsAccess}
            onChange={(e) => setAllowsAccess(e.target.checked)}
          />
          Allows live-app access
        </label>
        <button
          type="submit"
          className="rounded-lg border border-[#64ffda] px-4 py-2 font-mono text-xs text-[#64ffda] hover:bg-[#64ffda]/10"
        >
          Add status
        </button>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-[#64ffda]">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#172a45]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#112240] font-mono text-xs text-[#64ffda]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Public list</th>
                <th className="px-4 py-3">Allows access</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {statuses.map((status) => (
                <tr key={status.id} className="border-t border-[#172a45]">
                  <td className="px-4 py-3">
                    <input
                      defaultValue={status.name}
                      onBlur={(e) => {
                        const next = e.target.value.trim()
                        if (!next || next === status.name) return
                        void updateProjectStatus(status.id, { name: next })
                          .then(() => load())
                          .catch((err: Error) => setError(err.message))
                      }}
                      className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-[#ccd6f6] outline-none focus:border-[#64ffda]"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#8892b0]">{status.slug}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={status.showInList}
                      onChange={(e) => {
                        void updateProjectStatus(status.id, {
                          showInList: e.target.checked,
                        })
                          .then(() => load())
                          .catch((err: Error) => setError(err.message))
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={status.allowsAccess}
                      onChange={(e) => {
                        void updateProjectStatus(status.id, {
                          allowsAccess: e.target.checked,
                        })
                          .then(() => load())
                          .catch((err: Error) => setError(err.message))
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`Delete status “${status.name}”?`)) return
                        void deleteProjectStatus(status.id)
                          .then(() => load())
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
