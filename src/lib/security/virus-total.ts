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
  // Check both environment variable names for compatibility
  const apiKey = process.env.VIRUSTOTAL_API_KEY || 
                 process.env.NEXT_PUBLIC_VIRUSTOTAL_API_KEY || 
                 '5a34733d24ca3f263f2df24bc5caf848209a9cfb652860b12073c35504a94921'
  return apiKey
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
    return {
      id: 'error',
      url,
      verdict: 'unknown',
      status: 'error',
      detail: 'API key not configured',
    }
  }

  try {
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
      const errorMessage = typeof detail === 'string' 
        ? detail 
        : (detail as any)?.error?.message || JSON.stringify(detail)
      
      console.error('VirusTotal submit error:', response.status, errorMessage)
      
      return {
        id: 'error',
        url,
        verdict: 'unknown',
        status: 'error',
        detail: `VirusTotal API error (${response.status}): ${errorMessage}`,
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
  } catch (error) {
    console.error('VirusTotal submit exception:', error)
    return {
      id: 'error',
      url,
      verdict: 'unknown',
      status: 'error',
      detail: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getUrlScanResult(url: string): Promise<VirusTotalScanResult | null> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      id: 'error',
      url,
      verdict: 'unknown',
      status: 'error',
      detail: 'API key not configured',
    }
  }

  try {
    const identifier = encodeUrl(url)
    const response = await fetch(`${API_ROOT}/urls/${identifier}`, {
      headers: {
        'x-apikey': apiKey,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      // If URL not found (404), return null so we can submit it
      if (response.status === 404) {
        return null
      }
      
      const detail = await safeJson(response)
      const errorMessage = typeof detail === 'string' 
        ? detail 
        : (detail as any)?.error?.message || JSON.stringify(detail)
      
      console.error('VirusTotal get result error:', response.status, errorMessage)
      
      return {
        id: 'error',
        url,
        verdict: 'unknown',
        status: 'error',
        detail: `VirusTotal API error (${response.status}): ${errorMessage}`,
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
  } catch (error) {
    console.error('VirusTotal get result exception:', error)
    return {
      id: 'error',
      url,
      verdict: 'unknown',
      status: 'error',
      detail: error instanceof Error ? error.message : String(error),
    }
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
