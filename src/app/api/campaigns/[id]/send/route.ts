import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { sendCampaignEmails } from '@/lib/email/sender'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const body = await request.json().catch(() => ({}))
  const { id } = await context.params

  const { subject, recipientIds, messageOverride } = body as {
    subject?: string
    recipientIds?: string[]
    messageOverride?: string
  }

  try {
    const results = await sendCampaignEmails({
      campaignId: id,
      subject,
      recipientIds,
      messageOverride,
    })

    return NextResponse.json({ success: true, count: results.length, results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send campaign emails'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
