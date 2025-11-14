import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await context.params
  const supabase = await createClient()

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch events'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

