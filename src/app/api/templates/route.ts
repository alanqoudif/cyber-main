import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  await requireAdmin()
  const supabase = await createClient()

  try {
    // For now, return empty array since we don't have a templates table yet
    // In production, you would query: supabase.from('email_templates').select('*')
    return NextResponse.json({ templates: [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch templates'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await requireAdmin()
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { name, subject, html } = body

    if (!name || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For now, return a mock template
    // In production, you would insert: supabase.from('email_templates').insert({ name, subject, html })
    const template = {
      id: `template_${Date.now()}`,
      name,
      subject,
      html,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ template })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create template'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

