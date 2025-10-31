import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { sendCampaignEmails } from '@/lib/email/sender'

type SendEmailBody = {
  campaignId: string
  subject?: string
  recipientIds?: string[]
  previewText?: string
  messageOverride?: string
}

export async function POST(request: NextRequest) {
  await requireAdmin()
  const body = (await request.json()) as SendEmailBody

  const { campaignId, subject, recipientIds, messageOverride } = body
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
  }

  try {
    const results = await sendCampaignEmails({
      campaignId,
      subject,
      recipientIds,
      messageOverride,
    })

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send campaign emails'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
