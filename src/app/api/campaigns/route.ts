import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        recipients(count),
        events(type, id)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform campaigns to include stats
    const transformedCampaigns = (campaigns || []).map((campaign: any) => {
      const recipientsCount = campaign.recipients?.[0]?.count || 0
      const events = campaign.events || []
      
      const openedCount = events.filter((e: any) => e.type === 'OPEN').length
      const clickedCount = events.filter((e: any) => e.type === 'CLICK').length
      const reportedCount = events.filter((e: any) => e.type === 'REPORT').length
      
      // Get sent count from email_logs
      // For now, we'll use recipients count as sent count
      const sentCount = recipientsCount

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        status: 'draft' as const, // You can add status field to campaigns table
        recipients_count: recipientsCount,
        sent_count: sentCount,
        opened_count: openedCount,
        clicked_count: clickedCount,
        reported_count: reportedCount,
        created_at: campaign.created_at,
      }
    })

    return NextResponse.json({ campaigns: transformedCampaigns })
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

