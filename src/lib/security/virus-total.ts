import { createHash } from 'node:crypto'

const API_ROOT = 'https://www.virustotal.com/api/v3'

export type VirusTotalVerdict = 'unknown' | 'harmless' | 'suspicious' | 'malicious' | 'timeout'

export interface VirusTotalScanResult {
  id: string
  url: string
  verdict: VirusTotalVerdict
  lastAnalysisStats?: Record<string, number>
  lastAnalysisDate?: number
  status: 'completed' | 'queued' | 'error'
  detail?: string
}

function getApiKey(): string | null {
  if (!process.env.VIRUSTOTAL_API_KEY) {
    return null
  }
  return process.env.VIRUSTOTAL_API_KEY
}

function encodeUrl(url: string): string {
  return Buffer.from(url).toString('base64url')
}

export function getUrlIdentifier(url: string): string {
  return createHash('sha256').update(url).digest('hex')
}

export async function submitUrlForScan(url: string): Promise<VirusTotalScanResult | null> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return null
  }

  const response = await fetch(`${API_ROOT}/urls`, {
    method: 'POST',
    headers: {
      'x-apikey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `url=${encodeURIComponent(url)}`,
  })

  if (!response.ok) {
    const detail = await safeJson(response)
    return {
      id: 'error',
      url,
      verdict: 'unknown',
      status: 'error',
      detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
    }
  }

  const payload = await response.json()
  const analysisId: string = payload?.data?.id
  return {
    id: analysisId,
    url,
    verdict: 'unknown',
    status: 'queued',
  }
}

export async function getUrlScanResult(url: string): Promise<VirusTotalScanResult | null> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return null
  }

  const identifier = encodeUrl(url)
  const response = await fetch(`${API_ROOT}/urls/${identifier}`, {
    headers: {
      'x-apikey': apiKey,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await safeJson(response)
    return {
      id: 'error',
      url,
      verdict: 'unknown',
      status: 'error',
      detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
    }
  }

  const payload = await response.json()
  const data = payload?.data
  const attributes = data?.attributes
  const stats = attributes?.last_analysis_stats ?? {}

  let verdict: VirusTotalVerdict = 'unknown'
  if (typeof stats.malicious === 'number' && stats.malicious > 0) {
    verdict = 'malicious'
  } else if (typeof stats.suspicious === 'number' && stats.suspicious > 0) {
    verdict = 'suspicious'
  } else if (typeof stats.harmless === 'number' && stats.harmless > 0) {
    verdict = 'harmless'
  }

  return {
    id: data?.id ?? identifier,
    url,
    verdict,
    status: 'completed',
    lastAnalysisStats: stats,
    lastAnalysisDate: attributes?.last_analysis_date,
  }
}

export function isHighRiskVerdict(result: VirusTotalScanResult | null): boolean {
  if (!result) return false
  return result.verdict === 'malicious' || result.verdict === 'suspicious'
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return await response.text()
  }
}
