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
    const { name, subject, html } = body

    if (!name || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For now, return a mock updated template
    // In production, you would update: supabase.from('email_templates').update({ name, subject, html }).eq('id', id)
    const template = {
      id,
      name,
      subject,
      html,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ template })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update template'
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
    // In production, you would delete: supabase.from('email_templates').delete().eq('id', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete template'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

