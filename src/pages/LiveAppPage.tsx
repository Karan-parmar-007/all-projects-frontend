import { useEffect, useState, type ComponentType } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { fetchAppBootstrap } from '@/api'
import { AdvanceScraperPage } from '@/pages/AdvanceScraperPage'
import { useAuth, ssoLoginUrl } from '@/context/AuthContext'
import type { AppBootstrap } from '@/types'

const APP_COMPONENTS: Record<
  string,
  ComponentType<{ projectSlug: string; bootstrap: AppBootstrap }>
> = {
  advance_scraper: AdvanceScraperPage,
}

export function LiveAppPage() {
  const { projectSlug = '' } = useParams()
  const { session, isLoading: authLoading } = useAuth()
  const [bootstrap, setBootstrap] = useState<AppBootstrap | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectSlug || authLoading) return
    setLoading(true)
    void fetchAppBootstrap(projectSlug)
      .then(setBootstrap)
      .catch((err: unknown) => {
        setBootstrap(null)
        setError(err instanceof Error ? err.message : 'App not found')
      })
      .finally(() => setLoading(false))
  }, [projectSlug, authLoading, session.authenticated])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[#8892b0]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#64ffda]" />
        Loading app…
      </div>
    )
  }

  if (error || !bootstrap) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-wider text-[#64ffda]">// APP</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#ccd6f6]">Not available</h1>
        <p className="mt-3 text-[#8892b0]">{error || 'No live app is linked to this project.'}</p>
      </section>
    )
  }

  if (!session.authenticated) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-wider text-[#64ffda]">// ACCESS</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#ccd6f6]">{bootstrap.projectName}</h1>
        <p className="mt-3 text-[#8892b0]">Sign in with SSO to use this live app.</p>
        <a
          href={ssoLoginUrl(`/apps/${bootstrap.projectSlug}`)}
          className="mt-8 inline-flex items-center justify-center rounded-md border border-[#64ffda] bg-[rgba(100,255,218,0.1)] px-5 py-2.5 font-mono text-sm text-[#64ffda]"
        >
          Continue with SSO
        </a>
      </section>
    )
  }

  if (!bootstrap.allowsAccess) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-wider text-[#64ffda]">// OFFLINE</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#ccd6f6]">{bootstrap.projectName}</h1>
        <p className="mt-3 text-[#8892b0]">
          This app is currently <span className="text-[#ccd6f6]">{bootstrap.statusName}</span>.
          All endpoints are shut down until an admin turns it back on.
        </p>
      </section>
    )
  }

  if (!bootstrap.canAccess) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-wider text-[#64ffda]">// FORBIDDEN</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#ccd6f6]">Access restricted</h1>
        <p className="mt-3 text-[#8892b0]">
          Your role cannot use “{bootstrap.projectName}”.
          {bootstrap.requiredRoles.length
            ? ` Required: ${bootstrap.requiredRoles.join(', ')}.`
            : ''}
        </p>
      </section>
    )
  }

  const AppComponent = APP_COMPONENTS[bootstrap.appKey]
  if (!AppComponent) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-wider text-[#64ffda]">// UNKNOWN</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#ccd6f6]">Unsupported app</h1>
        <p className="mt-3 text-[#8892b0]">
          App key “{bootstrap.appKey}” is not registered in this frontend build.
        </p>
      </section>
    )
  }

  return <AppComponent projectSlug={bootstrap.projectSlug} bootstrap={bootstrap} />
}
