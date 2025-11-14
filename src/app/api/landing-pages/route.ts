import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  await requireAdmin()
  const supabase = await createClient()

  try {
    // For now, return empty array since we don't have a landing_pages table yet
    // In production, you would query: supabase.from('landing_pages').select('*')
    return NextResponse.json({ landingPages: [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch landing pages'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await requireAdmin()
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { name, html } = body

    if (!name || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For now, return a mock landing page
    // In production, you would insert: supabase.from('landing_pages').insert({ name, html })
    const landingPage = {
      id: `lp_${Date.now()}`,
      name,
      html,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ landingPage })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create landing page'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

