import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await context.params

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*, recipients(*), events(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ campaign })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()
    const { id } = await context.params

    const { title, description, recipients } = body

    // Update campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .update({ title, description })
      .eq('id', id)
      .select()
      .single()

    if (campaignError) throw campaignError

    // Update recipients (delete old and insert new)
    if (recipients && Array.isArray(recipients)) {
      // Delete existing recipients
      await supabase.from('recipients').delete().eq('campaign_id', id)

      // Insert new recipients
      const validRecipients = recipients.filter((r: any) => r.email?.trim())
      if (validRecipients.length > 0) {
        const { error: recipientsError } = await supabase.from('recipients').insert(
          validRecipients.map((r: any) => ({
            email: r.email.trim(),
            name: r.name?.trim() || null,
            campaign_id: id,
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await context.params

    const { error } = await supabase.from('campaigns').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}
