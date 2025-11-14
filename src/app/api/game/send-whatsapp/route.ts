import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { phone, message, submittedData } = body

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      )
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
      body: {
        phone,
        message,
        submittedData
      }
    })

    if (error) {
      console.error('Error calling Edge Function:', error)
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in POST /api/game/send-whatsapp:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

