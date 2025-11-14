import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await context.params

  try {
    const body = await request.json()
    const { name, html } = body

    if (!name || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For now, return a mock updated landing page
    // In production, you would update: supabase.from('landing_pages').update({ name, html }).eq('id', id)
    const landingPage = {
      id,
      name,
      html,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ landingPage })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update landing page'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await context.params

  try {
    // For now, just return success
    // In production, you would delete: supabase.from('landing_pages').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete landing page'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

