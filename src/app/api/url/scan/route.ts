import { NextRequest, NextResponse } from 'next/server'
import {
  getUrlScanResult,
  submitUrlForScan,
  isHighRiskVerdict,
  type VirusTotalScanResult,
} from '@/lib/security/virus-total'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body as { url?: string }

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // First, try to get existing scan result
    let scanResult: VirusTotalScanResult | null = await getUrlScanResult(url)

    // If no result or not completed, submit for new scan
    if (!scanResult || scanResult.status !== 'completed') {
      scanResult = await submitUrlForScan(url)
      
      // If it's queued, wait a bit and try to get the result
      if (scanResult && scanResult.status === 'queued') {
        // Wait 3 seconds for VirusTotal to process
        await new Promise((resolve) => setTimeout(resolve, 3000))
        scanResult = await getUrlScanResult(url)
      }
    }

    // If we got an error result, return it with details
    if (scanResult && scanResult.status === 'error') {
      return NextResponse.json(
        { 
          error: scanResult.detail || 'Failed to scan URL',
          detail: scanResult.detail 
        },
        { status: 500 }
      )
    }

    if (!scanResult) {
      return NextResponse.json(
        { error: 'Failed to scan URL - No result returned from VirusTotal' },
        { status: 500 }
      )
    }

    // Save scan result to database if we have a scan ID
    if (scanResult.id && scanResult.id !== 'error') {
      const hasServiceCredentials =
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!hasServiceCredentials) {
        console.warn('Skipping link scan persistence: missing Supabase service credentials')
      } else {
        const supabase = createServiceClient()
        try {
          await supabase
            .from('link_scans')
            .upsert(
              {
                url: url,
                scan_id: scanResult.id,
                status: scanResult.status,
                risk_label: scanResult.verdict,
                details: scanResult,
              },
              { onConflict: 'url' }
            )
        } catch (persistError) {
          console.error('Failed to save scan result:', persistError)
          // Don't fail the request if DB save fails
        }
      }
    }

    const isHighRisk = isHighRiskVerdict(scanResult)

    return NextResponse.json({
      success: true,
      url,
      result: {
        verdict: scanResult.verdict,
        status: scanResult.status,
        isHighRisk,
        lastAnalysisStats: scanResult.lastAnalysisStats,
        lastAnalysisDate: scanResult.lastAnalysisDate,
        detail: scanResult.detail,
      },
    })
  } catch (error) {
    console.error('URL scan error:', error)
    return NextResponse.json(
      { error: 'Failed to scan URL', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Allow GET with query parameter for convenience
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required. Use ?url=https://example.com' },
      { status: 400 }
    )
  }

  // Use POST handler logic
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  return POST(mockRequest as NextRequest)
}
