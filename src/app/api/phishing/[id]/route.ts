import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: link, error } = await supabase
      .from('phishing_links')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !link) {
      return NextResponse.json({ error: 'Phishing link not found' }, { status: 404 })
    }

    // Check if user has access
    if (link.created_by !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get submissions for this link
    const { data: submissions } = await supabase
      .from('phishing_submissions')
      .select('*')
      .eq('phishing_link_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ link, submissions: submissions || [] })
  } catch (error) {
    console.error('Error in GET /api/phishing/[id]:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: link } = await supabase
      .from('phishing_links')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Phishing link not found' }, { status: 404 })
    }

    // Check if user has access
    if (link.created_by !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('phishing_links')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting phishing link:', error)
      return NextResponse.json({ error: 'Failed to delete phishing link' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/phishing/[id]:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

