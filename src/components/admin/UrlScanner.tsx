'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Loader2, CheckCircle2, XCircle, AlertTriangle, Info, Search } from 'lucide-react'

type ScanStatus = 'idle' | 'scanning' | 'completed' | 'error'
type Verdict = 'unknown' | 'harmless' | 'suspicious' | 'malicious' | 'timeout'

interface ScanResult {
  verdict: Verdict
  status: string
  isHighRisk: boolean
  lastAnalysisStats?: Record<string, number>
  lastAnalysisDate?: number
  detail?: string
}

export function UrlScanner() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Enter a URL to scan.')
      return
    }

    try {
      new URL(url)
    } catch {
      setError('Invalid format. Use something like https://example.com')
      return
    }

    setStatus('scanning')
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/url/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.detail || data.error || 'Link scan failed'
        throw new Error(errorMsg)
      }

      setResult(data.result)
      setStatus('completed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error during the scan'
      setError(errorMessage)
      setStatus('error')
      console.error('URL scan error:', err)
    }
  }

  const getVerdictBadge = (verdict: Verdict) => {
    const variants = {
      harmless: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Harmless' },
      suspicious: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Suspicious' },
      malicious: { color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Malicious' },
      unknown: { color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', label: 'Unknown' },
      timeout: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', label: 'Timeout' },
    }

    const variant = variants[verdict] || variants.unknown

    return <Badge className={`border ${variant.color}`}>{variant.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          VirusTotal link scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleScan()
              }
            }}
            disabled={status === 'scanning'}
          />
          <Button onClick={handleScan} disabled={status === 'scanning' || !url.trim()} className="min-w-[100px]">
            {status === 'scanning' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Scan
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {status === 'completed' && result && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Verdict:</span>
              <div className="flex items-center gap-2">
                {result.isHighRisk ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {getVerdictBadge(result.verdict)}
              </div>
            </div>

            {result.isHighRisk && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">
                    <strong>Warning:</strong> this link is flagged as high risk.
                  </p>
                </div>
              </div>
            )}

            {!result.isHighRisk && result.verdict === 'harmless' && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-600">No malicious reports detected in VirusTotal.</p>
                </div>
              </div>
            )}

            {result.lastAnalysisStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {Object.entries(result.lastAnalysisStats).map(([key, value]) => (
                  <div key={key} className="p-2 rounded bg-surface-muted border border-border">
                    <p className="text-muted mb-1 uppercase tracking-wide">{key}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {result.lastAnalysisDate && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Info className="h-3 w-3" />
                <span>Last analysis: {new Date(result.lastAnalysisDate * 1000).toLocaleString('en-GB')}</span>
              </div>
            )}

            {result.detail && <p className="text-xs text-muted">{result.detail}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
