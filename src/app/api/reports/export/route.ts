import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'

    if (format !== 'csv') {
      return NextResponse.json({ error: 'Only CSV format is supported' }, { status: 400 })
    }

    // Get all events with related data
    const { data: events, error } = await supabase
      .from('events')
      .select('*, campaigns(title), users(email), recipients(email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Convert to CSV
    const headers = ['ID', 'Type', 'Campaign', 'User Email', 'Recipient Email', 'Created At']
    const rows = events?.map((event: any) => [
      event.id,
      event.type,
      event.campaigns?.title || 'N/A',
      event.users?.email || 'Anonymous',
      event.recipients?.email || 'N/A',
      new Date(event.created_at).toISOString(),
    ]) || []

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cybermirror-events-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}

