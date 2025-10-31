import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

const allowedEvents = new Set([
  'phishing_clue_revealed',
  'phishing_decision_made',
  'phishing_drill_reset',
  'link_scan_started',
  'link_scan_completed',
  'link_phase_transition',
  'experience_feedback_submitted',
])

export async function POST(request: NextRequest) {
  const user = await requireAuth()
  const supabase = createServiceClient()

  const body = (await request.json()) as {
    event?: string
    payload?: Record<string, unknown>
    recordedAt?: string
  }

  const event = body.event?.trim()

  if (!event || !allowedEvents.has(event)) {
    return NextResponse.json({ error: 'Invalid telemetry event' }, { status: 400 })
  }

  const { error } = await supabase.from('experience_events').insert({
    user_id: user.id,
    event,
    payload: {
      ...(body.payload ?? {}),
      recordedAt: body.recordedAt ?? new Date().toISOString(),
      userEmail: user.email,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
