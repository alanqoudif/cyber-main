import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*, recipients(count), events(count)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ campaigns })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { title, description, recipients } = body

    if (!title || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        title,
        description,
        created_by: user.id,
      })
      .select()
      .single()

    if (campaignError) throw campaignError

    // Create recipients
    if (recipients.length > 0) {
      const validRecipients = recipients.filter((r: any) => r.email?.trim())
      if (validRecipients.length > 0) {
        const { error: recipientsError } = await supabase.from('recipients').insert(
          validRecipients.map((r: any) => ({
            email: r.email.trim(),
            name: r.name?.trim() || null,
            campaign_id: campaign.id,
          }))
        )

        if (recipientsError) throw recipientsError
      }
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}

