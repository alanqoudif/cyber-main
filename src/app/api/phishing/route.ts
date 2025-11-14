import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: links, error } = await supabase
      .from('phishing_links')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching phishing links:', error)
      return NextResponse.json({ error: 'Failed to fetch phishing links' }, { status: 500 })
    }

    return NextResponse.json({ links })
  } catch (error) {
    console.error('Error in GET /api/phishing:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const body = await request.json()
    const { name, template_type, slug } = body

    if (!name || !template_type || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug already exists
    const { data: existing, error: existingError } = await supabase
      .from('phishing_links')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing && !existingError) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Verify auth context
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser || authUser.id !== user.id) {
      console.error('Auth mismatch:', { authUserId: authUser?.id, userId: user.id })
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    // Ensure user exists in public.users table (required for foreign key)
    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected if user doesn't exist
      console.error('Error checking user existence:', checkError)
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
    }

    // If user doesn't exist, create them
    if (!existingUser) {
      const userEmail = user.email || authUser.email
      if (!userEmail) {
        console.error('No email available for user:', { userId: user.id, authUserEmail: authUser.email })
        return NextResponse.json({ error: 'User email is required' }, { status: 400 })
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: userEmail,
          name: user.name || authUser.user_metadata?.name || null,
          role: user.role || 'USER',
        })

      if (insertError) {
        console.error('Error creating user in public.users:', {
          error: insertError,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
          userId: user.id,
        })
        return NextResponse.json(
          {
            error: 'Failed to verify user',
            details: insertError.message,
            code: insertError.code,
          },
          { status: 500 }
        )
      }
    }

    const { data: link, error } = await supabase
      .from('phishing_links')
      .insert({
        name,
        slug,
        template_type,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating phishing link:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        user_id: user.id,
        auth_uid: authUser?.id,
      })
      return NextResponse.json(
        { 
          error: 'Failed to create phishing link',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error('Error in POST /api/phishing:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

