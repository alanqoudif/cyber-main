import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  await requireAdmin()
  const body = await request.json().catch(() => ({}))
  const { userId, campaignId } = body as {
    userId?: string | null
    campaignId?: string | null
  }

  const supabase = createServiceClient()

  try {
    if (userId && campaignId) {
      await supabase.rpc('recalculate_risk_score', {
        p_user_id: userId,
        p_campaign_id: campaignId,
      })
      return NextResponse.json({ success: true, recalculated: 1 })
    }

    if (userId && !campaignId) {
      const { data: campaigns, error } = await supabase
        .from('events')
        .select('campaign_id')
        .eq('user_id', userId)

      if (error) throw error

      const uniqueCampaignIds = new Set<string>()

      let count = 0
      for (const record of campaigns ?? []) {
        if (!record.campaign_id) continue
        if (uniqueCampaignIds.has(record.campaign_id)) continue
        uniqueCampaignIds.add(record.campaign_id)
        await supabase.rpc('recalculate_risk_score', {
          p_user_id: userId,
          p_campaign_id: record.campaign_id,
        })
        count += 1
      }

      return NextResponse.json({ success: true, recalculated: count })
    }

    // Recalculate for all combinations found in risk_scores/events
    const { data: combos, error } = await supabase
      .from('events')
      .select('user_id, campaign_id')

    if (error) throw error

    const seen = new Set<string>()
    let count = 0

    for (const combo of combos ?? []) {
      if (!combo.user_id || !combo.campaign_id) continue
      const key = `${combo.user_id}:${combo.campaign_id}`
      if (seen.has(key)) continue
      seen.add(key)
      await supabase.rpc('recalculate_risk_score', {
        p_user_id: combo.user_id,
        p_campaign_id: combo.campaign_id,
      })
      count += 1
    }

    return NextResponse.json({ success: true, recalculated: count })
  } catch (error) {
    console.error('Risk recalculation failed:', error)
    return NextResponse.json({ error: 'Failed to recalculate risk score' }, { status: 500 })
  }
}
