"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react'
import { LocaleText } from '@/components/common/LocaleText'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/context/preferences-context'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Scenario {
  id: string
  title: { en: string; ar: string }
  description: { en: string; ar: string }
  prompt: { en: string; ar: string }
}

const scenarios: Scenario[] = [
  {
    id: 'suspicious-link',
    title: {
      en: 'Suspicious Link Challenge',
      ar: 'تحدي رابط مشبوه'
    },
    description: {
      en: 'Learn how to handle suspicious links safely',
      ar: 'تعلم كيفية التعامل مع الروابط المشبوهة بأمان'
    },
    prompt: {
      en: 'I received an email with a link that looks suspicious. The URL is "http://bank-security-update.com/login". What should I do?',
      ar: 'تلقيت رسالة بريد إلكتروني تحتوي على رابط يبدو مشبوهاً. الرابط هو "http://bank-security-update.com/login". ماذا يجب أن أفعل؟'
    }
  },
  {
    id: 'phishing-email',
    title: {
      en: 'Phishing Email Detection',
      ar: 'كشف رسائل التصيد'
    },
    description: {
      en: 'Identify signs of phishing emails',
      ar: 'تعرف على علامات رسائل التصيد'
    },
    prompt: {
      en: 'I got an email claiming to be from my bank asking me to verify my account immediately. How can I tell if it\'s a phishing attempt?',
      ar: 'تلقيت رسالة بريد إلكتروني تدعي أنها من البنك تطلب مني التحقق من حسابي فوراً. كيف يمكنني معرفة ما إذا كانت محاولة تصيد؟'
    }
  },
  {
    id: 'password-security',
    title: {
      en: 'Password Security',
      ar: 'أمان كلمات المرور'
    },
    description: {
      en: 'Best practices for password management',
      ar: 'أفضل الممارسات لإدارة كلمات المرور'
    },
    prompt: {
      en: 'What makes a strong password and how should I manage multiple passwords securely?',
      ar: 'ما الذي يجعل كلمة المرور قوية وكيف يجب أن أدير عدة كلمات مرور بشكل آمن؟'
    }
  },
  {
    id: 'risk-assessment',
    title: {
      en: 'Risk Assessment',
      ar: 'تقييم المخاطر'
    },
    description: {
      en: 'Evaluate security risks in different scenarios',
      ar: 'تقييم المخاطر الأمنية في سيناريوهات مختلفة'
    },
    prompt: {
      en: 'I clicked on a link in an email from an unknown sender. What are the potential risks and what should I do now?',
      ar: 'نقرت على رابط في رسالة بريد إلكتروني من مرسل مجهول. ما هي المخاطر المحتملة وماذا يجب أن أفعل الآن؟'
    }
  },
  {
    id: 'social-engineering',
    title: {
      en: 'Social Engineering',
      ar: 'الهندسة الاجتماعية'
    },
    description: {
      en: 'Recognize and defend against social engineering attacks',
      ar: 'تعرف على هجمات الهندسة الاجتماعية وكيفية الدفاع عنها'
    },
    prompt: {
      en: 'Someone called me claiming to be from IT support and asked for my password to fix an issue. Is this legitimate?',
      ar: 'اتصل بي شخص يدعي أنه من دعم تقنية المعلومات وطلب مني كلمة المرور لإصلاح مشكلة. هل هذا شرعي؟'
    }
  }
]

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { locale } = usePreferences()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string, scenario?: Scenario) => {
    if (!content.trim() && !scenario) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: scenario ? (scenario.prompt[locale] || scenario.prompt.en) : content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setSelectedScenario(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: userMessage.content
            }
          ],
          scenario: scenario ? scenario.title[locale] || scenario.title.en : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || `Failed to get AI response (${response.status})`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      // Create user-friendly error message
      let userFriendlyMsg = ''
      if (errorMsg.includes('API key') || errorMsg.includes('not configured')) {
        userFriendlyMsg = locale === 'ar' 
          ? '⚠️ مفتاح API غير موجود.\n\nيرجى إضافة OPENROUTER_API_KEY في ملف .env.local:\n\nOPENROUTER_API_KEY=your_api_key_here\n\nيمكنك الحصول على المفتاح من: https://openrouter.ai/keys'
          : '⚠️ API key not found.\n\nPlease add OPENROUTER_API_KEY to .env.local:\n\nOPENROUTER_API_KEY=your_api_key_here\n\nGet your key from: https://openrouter.ai/keys'
      } else if (errorMsg.includes('Model') || errorMsg.includes('model') || errorMsg.includes('not found')) {
        userFriendlyMsg = locale === 'ar'
          ? '⚠️ النموذج غير متاح.\n\nيرجى التحقق من OPENROUTER_MODEL في ملف .env.local أو استخدم نموذجاً آخر مثل:\n\nOPENROUTER_MODEL=google/gemma-2-27b-it:free'
          : '⚠️ Model not available.\n\nPlease check OPENROUTER_MODEL in .env.local or use a different model:\n\nOPENROUTER_MODEL=google/gemma-2-27b-it:free'
      } else {
        userFriendlyMsg = locale === 'ar'
          ? `عذراً، حدث خطأ: ${errorMsg}\n\nيرجى التحقق من:\n1. إضافة OPENROUTER_API_KEY في .env.local\n2. إعادة تشغيل الخادم بعد إضافة المتغيرات`
          : `Sorry, an error occurred: ${errorMsg}\n\nPlease check:\n1. Add OPENROUTER_API_KEY to .env.local\n2. Restart the server after adding variables`
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: userFriendlyMsg,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
    }
  }

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    sendMessage('', scenario)
  }

  const clearChat = () => {
    setMessages([])
    setSelectedScenario(null)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-3xl border border-border/50 bg-surface/80 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-purple-500/15 p-2 text-purple-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              <LocaleText en="AI Security Assistant" ar="مساعد الأمن الذكي" />
            </h2>
            <p className="text-xs text-muted">
              <LocaleText 
                en="Ask questions and practice security scenarios" 
                ar="اطرح الأسئلة وتدرب على سيناريوهات الأمن" 
              />
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="rounded-full"
          >
            <RefreshCw className="h-4 w-4" />
            <LocaleText en="Clear" ar="مسح" />
          </Button>
        )}
      </div>

      {/* Scenarios Section */}
      {messages.length === 0 && (
        <div className="border-b border-border/50 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            <LocaleText en="Practice Scenarios" ar="سيناريوهات التدريب" />
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => startScenario(scenario)}
                className="rounded-2xl border border-border/50 bg-surface/70 p-4 text-left transition hover:border-accent/40 hover:bg-surface"
              >
                <h4 className="mb-2 text-sm font-semibold">
                  {scenario.title[locale] || scenario.title.en}
                </h4>
                <p className="text-xs text-muted">
                  {scenario.description[locale] || scenario.description.en}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !selectedScenario && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto h-12 w-12 text-muted mb-4" />
              <p className="text-sm text-muted">
                <LocaleText
                  en="Select a scenario to start practicing, or ask me anything about cybersecurity!"
                  ar="اختر سيناريو للبدء في التدريب، أو اسألني أي شيء عن الأمن السيبراني!"
                />
              </p>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-accent/20 text-foreground'
                  : 'bg-surface/70 text-foreground border border-border/50'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
              <p className="mt-2 text-xs text-muted">
                {message.timestamp.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-300">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-surface/70 border border-border/50 px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border/50 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={locale === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
            className="flex-1 rounded-full border border-border/50 bg-surface/70 px-4 py-2 text-sm focus:border-accent/40 focus:outline-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted text-center">
          <LocaleText
            en="AI can make mistakes. Always verify important security information."
            ar="الذكاء الاصطناعي قد يخطئ. تحقق دائماً من المعلومات الأمنية المهمة."
          />
        </p>
      </form>
    </div>
  )
}

