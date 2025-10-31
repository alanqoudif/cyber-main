import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { EventType } from '@/lib/risk-score'

export async function GET(request: NextRequest) {
  const user = await requireAuth()
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams

  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const type = searchParams.get('type')
  const campaignId = searchParams.get('campaignId')
  const recipientId = searchParams.get('recipientId')

  let query = supabase
    .from('events')
    .select('*, campaigns(title), recipients(email,name), users(email,name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }

  if (campaignId) {
    query = query.eq('campaign_id', campaignId)
  }

  if (recipientId) {
    query = query.eq('recipient_id', recipientId)
  }

  if (user.role !== 'ADMIN') {
    query = query.eq('user_id', user.id)
  }

  const { data: events, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    events: events ?? [],
    count: count ?? 0,
  })
}

export async function POST(request: NextRequest) {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServiceClient()
  const body = await request.json()

  const { type, campaignId, userId, recipientId, meta } = body as {
    type: EventType
    campaignId?: string | null
    userId?: string | null
    recipientId?: string | null
    meta?: Record<string, unknown>
  }

  if (!type || !['OPEN', 'CLICK', 'REPORT', 'IGNORE'].includes(type)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      type,
      campaign_id: campaignId ?? null,
      user_id: userId ?? null,
      recipient_id: recipientId ?? null,
      meta: meta ?? {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ event: data })
}

export async function DELETE(request: NextRequest) {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServiceClient()
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
