import { apiFetch, BASE_URL } from '@/api'
import { getCsrfToken } from '@/lib/csrf'
import type {
  ScraperQuota,
  StartScrapePayload,
  StreamHandlers,
} from '@/api/advanceScraper/types'

export type { ScraperQuota, ScraperRun, StartScrapePayload, StreamHandlers } from '@/api/advanceScraper/types'

function appBase(projectSlug: string): string {
  return `/apps/${encodeURIComponent(projectSlug)}/advance-scraper`
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body.detail || body.message || res.statusText
  } catch {
    return res.statusText
  }
}

export async function fetchScraperQuota(projectSlug: string): Promise<ScraperQuota> {
  const res = await apiFetch(`${appBase(projectSlug)}/quota`)
  if (!res.ok) throw new Error(await readError(res))
  const raw = await res.json()
  return {
    limit: Number(raw.limit),
    used: Number(raw.used),
    remaining: Number(raw.remaining),
    day: String(raw.day),
  }
}

export async function fetchScraperCountries(projectSlug: string): Promise<string[]> {
  const res = await apiFetch(`${appBase(projectSlug)}/locations/countries`)
  if (!res.ok) throw new Error(await readError(res))
  const raw = await res.json()
  return raw.items || []
}

export async function fetchScraperStates(projectSlug: string): Promise<string[]> {
  const res = await apiFetch(`${appBase(projectSlug)}/locations/states`)
  if (!res.ok) throw new Error(await readError(res))
  const raw = await res.json()
  return raw.items || []
}

export async function fetchScraperCities(
  projectSlug: string,
  states: string[],
): Promise<string[]> {
  const params = new URLSearchParams()
  for (const state of states) params.append('state', state)
  const qs = params.toString()
  const res = await apiFetch(
    `${appBase(projectSlug)}/locations/cities${qs ? `?${qs}` : ''}`,
  )
  if (!res.ok) throw new Error(await readError(res))
  const raw = await res.json()
  return raw.items || []
}

export async function streamScrape(
  projectSlug: string,
  payload: StartScrapePayload,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const csrf = getCsrfToken()
  if (csrf) headers.set('X-CSRF-Token', csrf)

  const res = await fetch(`${BASE_URL}${appBase(projectSlug)}/runs/stream`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
    signal,
  })
  if (!res.ok) throw new Error(await readError(res))
  if (!res.body) throw new Error('No stream body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      let parsed: { type?: string; data?: Record<string, unknown> }
      try {
        parsed = JSON.parse(trimmed) as { type?: string; data?: Record<string, unknown> }
      } catch {
        continue
      }
      const type = parsed.type || ''
      const data = parsed.data || {}
      if (type === 'started') handlers.onStarted?.(data)
      else if (type === 'progress') handlers.onProgress?.(data)
      else if (type === 'company' && data.company) {
        handlers.onCompany?.(data.company as Record<string, unknown>)
      } else if (type === 'completed') handlers.onCompleted?.(data)
      else if (type === 'error') {
        handlers.onError?.(String(data.message || 'Scrape failed'))
      }
    }
  }
}

export function downloadCompaniesCsv(
  rows: Record<string, unknown>[],
  filename = 'companies.csv',
): void {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const escape = (value: unknown) => {
    const text = value == null ? '' : String(value)
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
    return text
  }
  const lines = [
    keys.join(','),
    ...rows.map((row) => keys.map((key) => escape(row[key])).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
