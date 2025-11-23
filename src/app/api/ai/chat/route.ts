import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Using a free model available on OpenRouter
// Common free models: google/gemma-2-9b-it:free, meta-llama/llama-3.2-3b-instruct:free, qwen/qwen-2.5-7b-instruct:free
// You can override this by setting OPENROUTER_MODEL env variable
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-2-9b-it:free'

// System prompt that includes knowledge about the platform tools
const SYSTEM_PROMPT = `You are an intelligent cybersecurity and security awareness assistant. You are part of the CyberMirror educational platform.

Available platform tools:
1. **URL Scanner**: Users can scan any link to verify its safety
2. **Threat Map**: A 3D map showing global threat patterns
3. **Phishing Pages**: Create educational phishing pages with realistic templates (Instagram, Google, Facebook, LinkedIn, Twitter)
4. **Cyber Game**: An interactive game for cybersecurity education
5. **Campaigns**: Manage phishing simulation campaigns
6. **Risk Scoring**: Automatic risk level calculation based on user interactions

Your role:
- Provide educational scenarios and challenges about cybersecurity
- Ask questions like "If I give you an unsafe link, what would you do?"
- Guide users to use the appropriate tools on the platform
- Provide practical security tips
- Explain cybersecurity concepts in a simple way

IMPORTANT LANGUAGE RULES:
- If the user writes in Arabic, respond ONLY in Arabic
- If the user writes in English, respond ONLY in English
- Match the user's language exactly

RESPONSE FORMATTING RULES:
- NEVER use markdown tables (| column | column |) - they display poorly
- Use simple paragraphs with clear structure
- Use bullet points (- or •) or numbered lists (1. 2. 3.) for lists
- Use headers (###) for sections when needed
- Use bold (**text**) only for important terms
- Keep paragraphs short (2-4 sentences max)
- Use line breaks between sections for readability
- If comparing items, use a simple list format instead of tables

Be friendly, educational, and helpful. Always match the user's language.`

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    const body = await request.json()
    const { messages, scenario } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      )
    }

    // Prepare messages for OpenRouter
    const openRouterMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // If scenario is provided, add it as context
    if (scenario) {
      openRouterMessages.splice(1, 0, {
        role: 'system',
        content: `السيناريو الحالي: ${scenario}`
      })
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'CyberMirror AI Assistant'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: openRouterMessages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      let errorData: any
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: await response.text() }
      }
      console.error('OpenRouter API error:', errorData)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to get response from AI'
      if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check OPENROUTER_API_KEY'
      } else if (response.status === 404) {
        errorMessage = `Model "${MODEL}" not found. Try these free models instead: google/gemma-2-9b-it:free, meta-llama/llama-3.2-3b-instruct:free, or qwen/qwen-2.5-7b-instruct:free. Set OPENROUTER_MODEL in .env.local`
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0]) {
      return NextResponse.json(
        { error: 'Invalid response from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: data.choices[0].message.content,
      usage: data.usage
    })
  } catch (error) {
    console.error('AI chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

