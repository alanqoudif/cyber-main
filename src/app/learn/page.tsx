import Link from 'next/link'
import type { ComponentType } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, CheckCircle2, Link2, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  mail: Mail,
  alert: AlertTriangle,
  shield: Shield,
  link: Link2,
  lock: Lock,
  check: CheckCircle2,
}

const fallbackLessons = [
  {
    id: 'phishing-basics',
    title: 'Understanding Phishing',
    description: 'Learn what phishing is and how attackers use it to steal information',
    icon: 'mail',
    duration: 5,
    topics: ['What is phishing?', 'Common phishing techniques', 'Real-world examples'],
  },
  {
    id: 'red-flags',
    title: 'Recognizing Red Flags',
    description: 'Identify warning signs in suspicious emails and messages',
    icon: 'alert',
    duration: 7,
    topics: ['Urgent language', 'Suspicious URLs', 'Unexpected attachments', 'Spelling errors'],
  },
]

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('id, slug, title, description, content, duration')
    .order('created_at', { ascending: true })

  const lessons = (lessonsData && lessonsData.length > 0 ? lessonsData : fallbackLessons).map((lesson: any) => ({
    id: lesson.slug || lesson.id,
    title: lesson.title,
    description: lesson.description,
    duration: typeof lesson.duration === 'number' ? `${lesson.duration} min` : lesson.duration || '5 min',
    icon: iconMap[(lesson.icon || 'shield').toString()] || Shield,
    topics: Array.isArray(lesson.content?.topics) ? lesson.content.topics : (lesson.topics || []),
  }))
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-accent/12 text-accent mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-4">
            Security Awareness Training
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Learn how to identify and protect yourself from phishing attacks and other security
            threats. Each lesson is designed to be quick, practical, and easy to understand.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const Icon = lesson.icon
            return (
              <Link key={lesson.id} href={`/learn/${lesson.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="inline-flex items-center justify-center size-12 rounded-full bg-accent/12 text-accent">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs text-muted bg-surface-muted px-2 py-1 rounded">
                        {lesson.duration}
                      </span>
                    </div>
                    <CardTitle>{lesson.title}</CardTitle>
                    <p className="text-sm text-muted mt-2">{lesson.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {lesson.topics.map((topic, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted">
                          <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 surface-card p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Stay Vigilant, Stay Safe
          </h2>
          <p className="text-muted max-w-2xl mx-auto mb-6">
            Security is everyone's responsibility. By staying informed and practicing good security
            habits, you can help protect yourself and your organization from cyber threats.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-sm text-muted">Remember:</span>
            <span className="text-sm font-medium text-foreground">When in doubt, report it!</span>
            <span className="text-sm font-medium text-foreground">Verify before you trust</span>
            <span className="text-sm font-medium text-foreground">Think before you click</span>
          </div>
        </div>
      </main>
    </div>
  )
}
