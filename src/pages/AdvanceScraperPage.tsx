import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Download, Loader2, Play, Square } from 'lucide-react'
import {
  downloadCompaniesCsv,
  fetchScraperCities,
  fetchScraperCountries,
  fetchScraperQuota,
  fetchScraperStates,
  streamScrape,
  type ScraperQuota,
} from '@/api/advanceScraper'
import type { AppBootstrap } from '@/types'

const inputClass =
  'w-full rounded-md border border-[#233554] bg-[#0a192f] px-3 py-2 text-sm text-[#ccd6f6] outline-none transition focus:border-[#64ffda]'
const labelClass =
  'mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#8892b0]'

export function AdvanceScraperPage({
  projectSlug,
  bootstrap,
}: {
  projectSlug: string
  bootstrap: AppBootstrap
}) {
  const [quota, setQuota] = useState<ScraperQuota | null>(null)
  const [countries, setCountries] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['United States'])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Record<string, unknown>[]>([])
  const [status, setStatus] = useState('Ready')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [limit, setLimit] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    const [q, st, co] = await Promise.all([
      fetchScraperQuota(projectSlug),
      fetchScraperStates(projectSlug),
      fetchScraperCountries(projectSlug),
    ])
    setQuota(q)
    setStates(st)
    setCountries(co)
  }, [projectSlug])

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to load scraper')
    })
  }, [load])

  useEffect(() => {
    void fetchScraperCities(projectSlug, selectedStates)
      .then(setCities)
      .catch(() => setCities([]))
  }, [selectedStates, projectSlug])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  async function onStart() {
    setError('')
    setMessage('')
    setResults([])
    setRunning(true)
    setStatus('Starting')
    const controller = new AbortController()
    abortRef.current = controller
    try {
      await streamScrape(
        projectSlug,
        {
          search_term: searchTerm.trim(),
          countries: selectedCountries,
          states: selectedStates,
          cities: selectedCities,
        },
        {
          onStarted: (data) => {
            setLimit(Number(data.limit ?? 0) || null)
            setStatus('Running')
          },
          onProgress: (data) => {
            setStatus(String(data.status || 'Running'))
          },
          onCompany: (company) => {
            setResults((prev) => [...prev, company])
          },
          onCompleted: (data) => {
            setStatus(String(data.status || 'completed'))
            setMessage(String(data.message || ''))
          },
          onError: (msg) => {
            setError(msg)
            setStatus('error')
          },
        },
        controller.signal,
      )
      await fetchScraperQuota(projectSlug).then(setQuota).catch(() => undefined)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Could not start scrape')
      }
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }

  function onStop() {
    abortRef.current?.abort()
    setStatus('stopping')
    setMessage('Stop requested — closing stream…')
  }

  const remaining = quota?.remaining ?? 0

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-5">
        <div className="rounded-xl border border-[#172a45] bg-[#112240] p-5">
          <p className="font-mono text-[11px] tracking-wider text-[#64ffda]">
            // DAILY QUOTA
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#ccd6f6]">
            {remaining}
            <span className="ml-1 text-base font-normal text-[#8892b0]">
              / {quota?.limit ?? 50} left
            </span>
          </p>
          <p className="mt-1 text-xs text-[#8892b0]">
            Used {quota?.used ?? 0} · {quota?.day ?? 'today'}
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-[#172a45] bg-[#112240] p-5">
          <div>
            <label className={labelClass}>Search query</label>
            <input
              className={inputClass}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="plumber, IT companies…"
              disabled={running}
            />
          </div>

          <Picker
            label="Countries"
            options={countries}
            selected={selectedCountries}
            disabled={running}
            onToggle={(v) => toggle(selectedCountries, v, setSelectedCountries)}
          />
          <Picker
            label="States"
            options={states}
            selected={selectedStates}
            disabled={running}
            onToggle={(v) => toggle(selectedStates, v, setSelectedStates)}
          />
          <Picker
            label="Cities"
            options={cities}
            selected={selectedCities}
            disabled={running}
            onToggle={(v) => toggle(selectedCities, v, setSelectedCities)}
          />

          <p className="text-[11px] leading-relaxed text-[#495670]">
            Fixed settings: 4 parallel workers · 20 results per ZIP · limit = remaining
            daily quota. Companies are streamed to your browser only — nothing is stored.
          </p>

          {error ? (
            <p className="flex items-start gap-2 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void onStart()}
              disabled={running || !searchTerm.trim() || remaining <= 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[#64ffda] bg-[rgba(100,255,218,0.1)] px-3 py-2.5 font-mono text-xs text-[#64ffda] transition enabled:hover:bg-[rgba(100,255,218,0.18)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Start
            </button>
            <button
              type="button"
              onClick={onStop}
              disabled={!running}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[#233554] bg-[#0a192f] px-3 py-2.5 font-mono text-xs text-[#ccd6f6] transition enabled:hover:border-[#64ffda] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </button>
          </div>
        </div>
      </aside>

      <main className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-wider text-[#64ffda]">// RESULTS</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#ccd6f6]">
              {bootstrap.projectName}
            </h1>
            <p className="mt-1 text-sm text-[#8892b0]">
              {message ||
                'Pick a query and location. Companies stream here live and are never saved on the server.'}
            </p>
          </div>
          <button
            type="button"
            disabled={!results.length}
            onClick={() => downloadCompaniesCsv(results, `scrape-${Date.now()}.csv`)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#233554] px-3 py-2 font-mono text-xs text-[#ccd6f6] enabled:hover:border-[#64ffda] disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </button>
        </div>

        <div className="rounded-xl border border-[#172a45] bg-[#112240] px-5 py-4 font-mono text-xs text-[#a8b2d1]">
          {status}
          {results.length ? ` · ${results.length.toLocaleString()} companies` : ''}
          {limit ? ` · target ${limit}` : ''}
        </div>

        <div className="overflow-hidden rounded-xl border border-[#172a45] bg-[#112240]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#172a45] bg-[#0a192f]/60 font-mono text-[11px] uppercase tracking-wider text-[#8892b0]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#8892b0]">
                      No companies yet.
                    </td>
                  </tr>
                ) : (
                  results.map((row, idx) => (
                    <tr
                      key={String(row.place_id || row.cid || idx)}
                      className="border-b border-[#172a45]/70 text-[#ccd6f6]"
                    >
                      <td className="px-4 py-3">{String(row.name || '—')}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#a8b2d1]">
                        {String(row.phone || '—')}
                      </td>
                      <td className="px-4 py-3">{String(row.city || '—')}</td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-xs text-[#8892b0]">
                        {String(row.website || '—')}
                      </td>
                      <td className="px-4 py-3">{String(row.rating ?? '—')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function Picker({
  label,
  options,
  selected,
  disabled,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  disabled?: boolean
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {selected.length ? ` (${selected.length})` : ''}
      </label>
      <div className="max-h-28 space-y-1 overflow-y-auto rounded-md border border-[#233554] bg-[#0a192f] p-2">
        {options.length === 0 ? (
          <p className="px-1 py-1 text-xs text-[#495670]">No options</p>
        ) : (
          options.map((opt) => {
            const active = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                disabled={disabled}
                onClick={() => onToggle(opt)}
                className={`block w-full rounded px-2 py-1 text-left text-xs transition ${
                  active
                    ? 'bg-[rgba(100,255,218,0.12)] text-[#64ffda]'
                    : 'text-[#a8b2d1] hover:bg-[#112240]'
                } disabled:opacity-50`}
              >
                {opt}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
