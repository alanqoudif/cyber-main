import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Using a free model available on OpenRouter
// Common free models: google/gemma-2-9b-it:free, meta-llama/llama-3.2-3b-instruct:free, qwen/qwen-2.5-7b-instruct:free
// You can override this by setting OPENROUTER_MODEL env variable
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-2-9b-it:free'

// System prompt that includes knowledge about the platform tools
const SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في الأمن السيبراني والوعي الأمني. أنت جزء من منصة CyberMirror التعليمية.

الأدوات المتاحة في المنصة:
1. **URL Scanner (فحص الروابط)**: يمكن للمستخدمين فحص أي رابط للتحقق من سلامته
2. **Threat Map (خريطة التهديدات)**: خريطة ثلاثية الأبعاد تعرض أنماط التهديدات العالمية
3. **Phishing Pages (صفحات التصيد)**: إنشاء صفحات تصيد تعليمية بقوالب واقعية (Instagram, Google, Facebook, LinkedIn, Twitter)
4. **Cyber Game (لعبة السايبر)**: لعبة تفاعلية لتعليم الأمن السيبراني
5. **Campaigns (الحملات)**: إدارة حملات محاكاة التصيد
6. **Risk Scoring (تقييم المخاطر)**: حساب تلقائي لمستوى المخاطر بناءً على تفاعلات المستخدم

دورك:
- تقديم سيناريوهات وتحديات تعليمية حول الأمن السيبراني
- طرح أسئلة مثل "إذا أعطيتك رابط غير آمن، ماذا ستفعل؟"
- توجيه المستخدمين لاستخدام الأدوات المناسبة في المنصة
- تقديم نصائح أمنية عملية
- شرح مفاهيم الأمن السيبراني بطريقة بسيطة

كن ودوداً، تعليمياً، ومفيداً. استخدم اللغة العربية بشكل أساسي ولكن يمكنك استخدام الإنجليزية عند الحاجة.`

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
        max_tokens: 1000
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

