import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { recordEvent, parseIpFromHeaders } from '@/lib/tracking'
import type { EventType } from '@/lib/risk-score'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { type, campaignId, recipientId, userId, meta } = body as {
      type: EventType
      campaignId?: string | null
      recipientId?: string | null
      userId?: string | null
      meta?: Record<string, unknown>
    }

    if (!type || !['OPEN', 'CLICK', 'REPORT', 'IGNORE'].includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    // Get user if authenticated
    let currentUserId = userId
    if (!currentUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      currentUserId = user?.id || null
    }

    const ip = parseIpFromHeaders(request.headers)
    const { error: insertError } = await recordEvent(supabase as any, {
      type,
      campaignId: campaignId ?? null,
      recipientId: recipientId ?? null,
      userId: currentUserId ?? null,
      meta,
      ip,
    })

    if (insertError) throw insertError

    // Update risk score if user is associated
    if (currentUserId && campaignId) {
      try {
        const serviceClient = createServiceClient()
        // Use DB function if available
        await serviceClient.rpc('recalculate_risk_score', {
          p_user_id: currentUserId,
          p_campaign_id: campaignId,
        })
      } catch (riskError) {
        console.error('Failed to recalculate risk score:', riskError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}

// Handle GET for tracking pixel (OPEN event)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaign')
    const recipientId = searchParams.get('recipient')
    const type = searchParams.get('type') || 'OPEN'

    if (!campaignId || !recipientId) {
      return new NextResponse('Missing parameters', { status: 400 })
    }

    const supabase = await createClient()
    await recordEvent(supabase as any, {
      type: (type as EventType) || 'OPEN',
      campaignId,
      recipientId,
      meta: { trackedVia: 'pixel' },
      ip: parseIpFromHeaders(request.headers),
    })

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    return new NextResponse('Error', { status: 500 })
  }
}
