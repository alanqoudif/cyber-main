'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Globe,
  Search,
  AlertTriangle,
  Activity,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XOctagon,
  Circle,
  CircleCheck,
  CircleDot,
} from 'lucide-react'
import { trackExperienceEvent } from '@/lib/telemetry'

type Verdict = 'harmless' | 'suspicious' | 'malicious'

interface Phase {
  id: 'protocol' | 'reputation' | 'behaviour'
  title: string
  description: string
  benefit: string
  icon: ComponentType<{ className?: string }>
}

interface SampleLink {
  id: string
  label: string
  url: string
  verdict: Verdict
  note: string
}

interface Cue {
  id: string
  label: string
  status: 'pass' | 'review' | 'fail'
  detail: string
}

interface AnalysisResult {
  verdict: Verdict
  headline: string
  cues: Cue[]
  recommendations: string[]
}

const phases: Phase[] = [
  {
    id: 'protocol',
    title: 'Protocol & certificate',
    description: 'Validate HTTPS, TLS strength, and certificate ownership before touching the content.',
    benefit: 'Stops downgrade attacks and look-alike hosts without a trusted certificate.',
    icon: Globe,
  },
  {
    id: 'reputation',
    title: 'Reputation intelligence',
    description: 'Query threat feeds, sandbox history, and WHOIS age for the destination domain.',
    benefit: 'Flags hosts abused in previous phishing or recently registered for a campaign.',
    icon: Search,
  },
  {
    id: 'behaviour',
    title: 'Behavioural sandbox',
    description: 'Launch the page in a disposable browser to observe redirects and payload drops.',
    benefit: 'Catches obfuscated scripts, forced downloads, and credential harvest forms.',
    icon: Activity,
  },
]

const sampleLinks: SampleLink[] = [
  {
    id: 'hr-safe',
    label: 'HR benefits portal',
    url: 'https://hr.company.com/benefits/summary',
    verdict: 'harmless',
    note: 'Official subdomain with hardened TLS and a clean threat history.',
  },
  {
    id: 'payroll-clone',
    label: 'Payroll “secure” update',
    url: 'https://accounts-payroll-secure.com/update/login',
    verdict: 'malicious',
    note: 'Look-alike domain with registrar privacy and credential capture wizard.',
  },
  {
    id: 'bonus-short',
    label: 'Shortened bonus survey',
    url: 'http://bit.ly/2024-bonus-review',
    verdict: 'suspicious',
    note: 'Shortener hides the real host and downgrades to HTTP',
  },
]

const verdictStyles: Record<
  Verdict,
  {
    badge: string
    tone: string
    headline: string
    description: string
  }
> = {
  harmless: {
    badge: 'bg-green-500/10 text-green-600 border-green-500/30',
    tone: 'text-green-700',
    headline: 'Likely harmless',
    description:
      'Controls and context align with trusted patterns. Continue verifying before entering credentials.',
  },
  suspicious: {
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    tone: 'text-amber-700',
    headline: 'Needs escalation',
    description: 'Mixed indicators. Pause and verify with the sender before interacting further.',
  },
  malicious: {
    badge: 'bg-red-500/10 text-red-600 border-red-500/30',
    tone: 'text-red-700',
    headline: 'High-risk destination',
    description: 'Multiple high-risk signals detected. Report immediately and block downstream access.',
  },
}

const shortenerHosts = ['bit.ly', 'tinyurl.com', 't.co', 'rebrand.ly', 'goo.gl']
const riskyTlds = ['.xyz', '.top', '.click', '.ru', '.cn', '.kim', '.work']

type PhaseStatus = 'pending' | 'active' | 'complete'

const createPhaseStatuses = () =>
  phases.reduce<Record<Phase['id'], PhaseStatus>>((acc, phase) => {
    acc[phase.id] = 'pending'
    return acc
  }, {} as Record<Phase['id'], PhaseStatus>)

function analyseUrl(rawUrl: string): AnalysisResult {
  let parsed: URL | null = null
  try {
    parsed = new URL(rawUrl)
  } catch {
    return {
      verdict: 'suspicious',
      headline: 'Malformed URL supplied',
      cues: [
        {
          id: 'format',
          label: 'URL formatting',
          status: 'fail',
          detail: 'Could not parse the link. Attackers often mangle URLs to hide payloads.',
        },
      ],
      recommendations: ['Request the sender to resend the link through a trusted channel', 'Report the message'],
    }
  }

  const cues: Cue[] = []
  let riskScore = 0

  const isHttps = parsed.protocol === 'https:'
  cues.push({
    id: 'protocol',
    label: 'Transport security',
    status: isHttps ? 'pass' : 'fail',
    detail: isHttps
      ? 'TLS certificate present with HTTPS. Good baseline.'
      : 'Site forces HTTP. Credentials would travel in clear text.',
  })
  if (!isHttps) riskScore += 2

  const lowerHost = parsed.hostname.toLowerCase()
  const isCorporate = lowerHost.endsWith('.company.com') || lowerHost === 'company.com'
  cues.push({
    id: 'domain',
    label: 'Domain alignment',
    status: isCorporate ? 'pass' : 'fail',
    detail: isCorporate
      ? 'Domain matches your corporate estate.'
      : `Host resolves to ${parsed.hostname}, which is outside trusted ranges.`,
  })
  if (!isCorporate) riskScore += 3

  const dotCount = lowerHost.split('.').length - 1
  if (dotCount > 2 && !isCorporate) {
    cues.push({
      id: 'subdomain',
      label: 'Excessive subdomains',
      status: 'review',
      detail: 'Multiple subdomain levels found. Attackers often prepend words to mimic nested teams.',
    })
    riskScore += 1
  }

  const hostTld = riskyTlds.find((tld) => lowerHost.endsWith(tld))
  if (hostTld) {
    cues.push({
      id: 'tld',
      label: 'TLD reputation',
      status: 'fail',
      detail: `Domain registered on ${hostTld}, a top-level domain frequently abused in phishing.`,
    })
    riskScore += 2
  }

  const containsKeywords = ['secure', 'account', 'update', 'login', 'verify'].some((keyword) =>
    lowerHost.includes(keyword)
  )
  if (containsKeywords && !isCorporate) {
    cues.push({
      id: 'keywords',
      label: 'Suspicious domain keywords',
      status: 'review',
      detail: 'High-value words embedded in the host aim to gain trust.',
    })
    riskScore += 1
  }

  const isShortener = shortenerHosts.includes(lowerHost)
  if (isShortener) {
    cues.push({
      id: 'shortener',
      label: 'Link shortener detected',
      status: 'fail',
      detail: 'Shortened URL hides the destination. Expand in a sandbox before taking action.',
    })
    riskScore += 2
  }

  const hasLoginPath = /login|signin|reset|update/.test(parsed.pathname.toLowerCase())
  if (hasLoginPath && !isCorporate) {
    cues.push({
      id: 'path',
      label: 'Credential collection intent',
      status: 'fail',
      detail: 'Path indicates credential harvesting on an untrusted domain.',
    })
    riskScore += 2
  }

  const verdict: Verdict = riskScore >= 5 ? 'malicious' : riskScore >= 3 ? 'suspicious' : 'harmless'

  const recommendations =
    verdict === 'harmless'
      ? ['Still verify the sender before entering sensitive data', 'Monitor the destination for any changes']
      : verdict === 'suspicious'
        ? [
            'Escalate to the security team for deeper sandboxing',
            'Confirm the request using a trusted corporate channel',
          ]
        : ['Report and block the sender immediately', 'Reset affected credentials if anyone clicked already']

  return {
    verdict,
    headline:
      verdict === 'harmless'
        ? 'No critical issues detected'
        : verdict === 'suspicious'
          ? 'Mixed reputation and behavioural flags'
          : 'Credential theft infrastructure detected',
    cues,
    recommendations,
  }
}

export function LinksTool() {
  const [url, setUrl] = useState('')
  const [selectedSample, setSelectedSample] = useState<SampleLink | null>(null)
  const [phaseStatuses, setPhaseStatuses] = useState<Record<Phase['id'], PhaseStatus>>(createPhaseStatuses)
  const [activePhase, setActivePhase] = useState<Phase['id'] | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const progress = useMemo(() => {
    const completeCount = Object.values(phaseStatuses).filter((status) => status === 'complete').length
    return Math.round((completeCount / phases.length) * 100)
  }, [phaseStatuses])

  const applySample = (sample: SampleLink) => {
    setSelectedSample(sample)
    setUrl(sample.url)
    setAnalysis(null)
    setError(null)
    setPhaseStatuses(createPhaseStatuses())
  }

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Paste or select a URL to start the scan.')
      return
    }

    const trimmedUrl = url.trim()
    let host: string | null = null
    try {
      host = new URL(trimmedUrl).hostname
    } catch {
      host = null
    }

    trackExperienceEvent('link_scan_started', {
      urlHost: host,
      inputLength: trimmedUrl.length,
      isSample: Boolean(selectedSample),
      sampleId: selectedSample?.id ?? null,
    })

    setIsScanning(true)
    setAnalysis(null)
    setError(null)
    setActivePhase(null)
    setPhaseStatuses(createPhaseStatuses())

    for (const phase of phases) {
      setPhaseStatuses((prev) => ({ ...prev, [phase.id]: 'active' }))
      setActivePhase(phase.id)
      trackExperienceEvent('link_phase_transition', {
        phase: phase.id,
        status: 'active',
        urlHost: host,
      })
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 600))
      setPhaseStatuses((prev) => ({ ...prev, [phase.id]: 'complete' }))
      trackExperienceEvent('link_phase_transition', {
        phase: phase.id,
        status: 'complete',
        urlHost: host,
      })
    }

    const result = analyseUrl(trimmedUrl)
    setAnalysis(result)
    setIsScanning(false)
    trackExperienceEvent('link_scan_completed', {
      urlHost: host,
      verdict: result.verdict,
      cueSummary: result.cues.map((cue) => ({ id: cue.id, status: cue.status })),
      recommendationCount: result.recommendations.length,
      isSample: Boolean(selectedSample),
      sampleId: selectedSample?.id ?? null,
    })
  }

  const verdictInfo = analysis ? verdictStyles[analysis.verdict] : null

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-2xl font-semibold text-foreground">Link scanner</CardTitle>
          <Badge className="bg-accent/10 text-accent border border-accent/30">Live sandbox walkthrough</Badge>
        </div>
        <p className="text-sm text-muted leading-6 max-w-2xl">
          Feed any URL into the sandbox. Watch the protocol, reputation, and behavioural checks run in sequence and learn
          the signals that drive the final verdict.
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-surface px-4 py-5 space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  type="url"
                  placeholder="https://example.com/path"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed"
                  disabled={isScanning}
                />
                <Button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="min-w-[150px] bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analysing…
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Run scan
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-muted mb-2">Sample links</p>
                <div className="flex flex-wrap gap-2">
                  {sampleLinks.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => applySample(sample)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        selectedSample?.id === sample.id
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border/70 bg-surface-muted text-muted hover:text-foreground'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
                {selectedSample && (
                  <p className="mt-2 text-xs text-muted italic">
                    {selectedSample.note} Verdict: {selectedSample.verdict.toUpperCase()}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface/80 shadow-inner">
              <header className="flex items-center gap-2 border-b border-border/60 bg-surface-muted/80 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-400" />
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span className="size-2 rounded-full bg-green-500" />
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs text-muted">
                  <ExternalLink className="h-4 w-4" />
                  Sandbox browser
                </div>
              </header>
              <div className="space-y-4 px-5 py-5">
                <div className="rounded-lg border border-border/60 bg-surface px-4 py-3 text-sm font-mono text-foreground">
                  {url || 'waiting for input…'}
                </div>
                <div className="rounded-xl border border-border/60 bg-surface-muted/70 px-4 py-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        Sandbox in progress
                      </>
                    ) : analysis ? (
                      <>
                        {analysis.verdict === 'harmless' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : analysis.verdict === 'suspicious' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <XOctagon className="h-4 w-4 text-red-500" />
                        )}
                        {verdictInfo?.headline}
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-muted" />
                        Awaiting scan
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-6 text-muted">
                    {analysis
                      ? verdictInfo?.description
                      : 'The sandbox spins up a disposable browser session to replay the full navigation securely.'}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {phases.map((phase) => {
                      const status = phaseStatuses[phase.id]
                      return (
                        <div
                          key={phase.id}
                          className={`rounded-lg border px-3 py-3 text-xs transition ${
                            status === 'complete'
                              ? 'border-green-500/40 bg-green-500/10 text-green-600'
                              : status === 'active'
                                ? 'border-accent/40 bg-accent/10 text-accent'
                                : 'border-border/60 bg-surface text-muted'
                          }`}
                        >
                          <p className="font-semibold text-sm mb-1">{phase.title}</p>
                          <p className="leading-5 text-[11px]">{phase.description}</p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="rounded-lg border border-border/70 bg-surface px-4 py-3 text-xs text-muted">
                    {activePhase
                      ? phases.find((phase) => phase.id === activePhase)?.benefit
                      : 'Benefits of each phase will appear here while the sandbox runs.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-surface/60 px-4 py-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-muted">Scan timeline</p>
              <div className="space-y-2">
                {phases.map((phase) => {
                  const status = phaseStatuses[phase.id]
                  const Icon = phase.icon
                  return (
                    <div
                      key={phase.id}
                      className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition ${
                        status === 'complete'
                          ? 'border-green-500/40 bg-green-500/10 text-green-700'
                          : status === 'active'
                            ? 'border-accent/40 bg-accent/10 text-accent'
                            : 'border-border/60 bg-surface text-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{phase.title}</p>
                        <p className="text-xs leading-5">{phase.benefit}</p>
                      </div>
                      {status === 'complete' ? (
                        <CircleCheck className="ml-auto h-4 w-4 text-green-500" />
                      ) : status === 'active' ? (
                        <CircleDot className="ml-auto h-4 w-4 text-accent animate-pulse" />
                      ) : (
                        <Circle className="ml-auto h-4 w-4 text-muted" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {analysis && verdictInfo && (
              <div className="rounded-2xl border border-border/70 bg-surface px-4 py-5 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">Final decision</p>
                    <h3 className={`text-lg font-semibold ${verdictInfo.tone}`}>{verdictInfo.headline}</h3>
                  </div>
                  <Badge className={`border ${verdictInfo.badge}`}>
                    Verdict: {analysis.verdict.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {analysis.cues.map((cue) => (
                    <div
                      key={cue.id}
                      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
                        cue.status === 'pass'
                          ? 'border-green-500/40 bg-green-500/10 text-green-700'
                          : cue.status === 'review'
                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-700'
                            : 'border-red-500/40 bg-red-500/10 text-red-700'
                      }`}
                    >
                      <p className="font-semibold">{cue.label}</p>
                      <p className="text-xs mt-1">{cue.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border/70 bg-surface-muted/80 px-4 py-4 text-xs leading-6 text-muted">
                  <p className="text-sm font-semibold text-foreground mb-2">Next actions</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((recommendation) => (
                      <li key={recommendation}>• {recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
