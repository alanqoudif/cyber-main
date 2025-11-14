import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data: link, error } = await supabase
      .from('phishing_links')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching phishing link:', {
        error,
        message: error.message,
        code: error.code,
        slug,
      })
      return NextResponse.json({ error: 'Phishing link not found' }, { status: 404 })
    }

    if (!link) {
      return NextResponse.json({ error: 'Phishing link not found' }, { status: 404 })
    }

    // Increment visits counter using function (bypasses RLS)
    const { error: updateError } = await supabase.rpc('increment_phishing_link_visits', {
      p_link_id: link.id,
    })

    if (updateError) {
      console.error('Error updating visits:', updateError)
      // Don't fail the request if visit update fails, just log it
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error('Error in GET /api/phishing/slug/[slug]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

