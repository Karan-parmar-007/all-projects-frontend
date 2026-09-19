export interface ScraperQuota {
  limit: number
  used: number
  remaining: number
  day: string
}

export interface ScraperRun {
  id: string | null
  running: boolean
  searchTerm: string | null
  countries: string[]
  states: string[]
  cities: string[]
  limit: number | null
  companiesTotal: number
  results: Record<string, unknown>[]
  logs: string[]
  status: string | null
  message: string | null
  error: string | null
  startedAt: string | null
  finishedAt: string | null
}

export interface StartScrapePayload {
  search_term: string
  countries: string[]
  states: string[]
  cities: string[]
}

export interface StreamHandlers {
  onStarted?: (data: Record<string, unknown>) => void
  onProgress?: (data: Record<string, unknown>) => void
  onCompany?: (company: Record<string, unknown>) => void
  onCompleted?: (data: Record<string, unknown>) => void
  onError?: (message: string) => void
}
