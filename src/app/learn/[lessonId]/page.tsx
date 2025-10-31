import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const fallbackLessons: Record<string, any> = {
  'phishing-basics': {
    title: 'Understanding Phishing',
    sections: [
      { type: 'heading', text: 'What is Phishing?' },
      {
        type: 'paragraph',
        text: 'Phishing is a cyber attack method where attackers impersonate legitimate organizations to trick individuals into revealing sensitive information such as passwords, credit card numbers, or personal data.',
      },
      { type: 'heading', text: 'Common Phishing Techniques' },
      {
        type: 'list',
        items: [
          'Email phishing: Fraudulent emails designed to look like they come from trusted sources',
          'Spear phishing: Targeted attacks aimed at specific individuals or organizations',
          'Whaling: Attacks targeting high-profile executives',
          'Smishing: Phishing via SMS text messages',
          'Vishing: Phishing via voice calls',
        ],
      },
      {
        type: 'paragraph',
        text: 'Phishing attacks exploit human psychology. They create urgency, fear, or curiosity to prompt quick actions without careful consideration. Attackers often use social engineering tactics to build trust or create panic.',
      },
    ],
  },
  'red-flags': {
    title: 'Recognizing Red Flags',
    sections: [
      { type: 'heading', text: 'Warning Signs to Look For' },
      {
        type: 'list',
        items: [
          'Urgent language demanding immediate action',
          'Threats or warnings of account suspension',
          'Unexpected attachments or links',
          'Generic greetings instead of your name',
          'Spelling and grammar errors',
          'Suspicious sender email addresses',
          'Requests for sensitive information',
          "URLs that don't match the organization's official domain",
        ],
      },
      {
        type: 'paragraph',
        text: 'Always verify suspicious emails by contacting the organization directly through official channels. Never use contact information provided in the suspicious email itself.',
      },
    ],
  },
}

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const supabase = await createClient()
  const { data: lesson } = await supabase
    .from('lessons')
    .select('title, content')
    .eq('slug', params.lessonId)
    .single()

  const lessonData = lesson || fallbackLessons[params.lessonId]

  if (!lessonData) {
    notFound()
  }

  const rawContent = Array.isArray(lessonData.content)
    ? lessonData.content
    : lessonData.content?.sections || lessonData.sections || []

  const sections = normalizeLessonContent(rawContent)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/learn">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
        </Link>

        <Card>
          <CardContent className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-4">{lessonData.title}</h1>
            </div>

            <div className="prose prose-invert max-w-none space-y-6">
              {sections.map((section: any, index: number) => {
                if (section.type === 'heading') {
                  return (
                    <h2 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                      {section.text}
                    </h2>
                  )
                }
                if (section.type === 'paragraph') {
                  return (
                    <p key={index} className="text-muted leading-relaxed">
                      {section.text}
                    </p>
                  )
                }
                if (section.type === 'list') {
                  return (
                    <ul key={index} className="space-y-2 list-none">
                      {section.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )
                }
                return null
              })}
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/20">
                <Shield className="h-5 w-5 text-accent" />
                <p className="text-sm text-foreground">
                  <strong>Remember:</strong> When in doubt, report suspicious emails to your security team.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link href="/learn">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lessons
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function normalizeLessonContent(content: any[]): any[] {
  if (!Array.isArray(content)) return []
  return content.map((section) => {
    if (typeof section === 'string') {
      return { type: 'paragraph', text: section }
    }
    return section
  })
}
