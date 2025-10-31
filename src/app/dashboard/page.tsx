import { redirect } from 'next/navigation'
import type { ComponentType } from 'react'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { InteractionHistory, type InteractionEntry } from '@/components/user/InteractionHistory'
import { RiskScoreDisplay, type RiskScoreEntry } from '@/components/user/RiskScoreDisplay'
import { MicroLessons, type MicroLesson } from '@/components/user/MicroLessons'
import { PersonalizedTips } from '@/components/user/PersonalizedTips'
import { Activity, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const user = await requireAuth()

  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin')
  }

  const supabase = await createClient()

  const { data: eventsRaw } = await supabase
    .from('events')
    .select('id, type, created_at, campaigns(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: riskScoresRaw } = await supabase
    .from('risk_scores')
    .select('id, score, updated_at, campaigns(title)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  const { data: lessonsRaw } = await supabase
    .from('lessons')
    .select('id, slug, title, description, duration')
    .order('created_at', { ascending: true })
    .limit(6)

  const events: InteractionEntry[] = (eventsRaw ?? []).map((event) => ({
    id: event.id,
    type: event.type,
    created_at: event.created_at,
    campaign: event.campaigns?.title ?? null,
  }))

  const riskScores: RiskScoreEntry[] = (riskScoresRaw ?? []).map((score) => ({
    id: score.id,
    score: score.score,
    updated_at: score.updated_at,
    campaign: score.campaigns?.title ?? null,
  }))

  const lessons: MicroLesson[] = (lessonsRaw ?? fallbackLessons).map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
  }))

  const stats = computeStats(events)
  const totalRisk = riskScores.reduce((sum, score) => sum + score.score, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={user.role} />
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-foreground">Welcome back, {user.name || user.email}</h1>
          <p className="mt-2 text-muted">
            Track your training progress, review recent interactions, and get tailored coaching tips.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Activity} label="Interactions" value={stats.total} accent="text-accent" />
          <StatCard icon={AlertTriangle} label="Clicks" value={stats.clicks} accent="text-yellow-500" />
          <StatCard icon={CheckCircle2} label="Reports" value={stats.reports} accent="text-green-500" />
          <StatCard icon={TrendingUp} label="Total Risk" value={totalRisk} accent="text-red-500" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <InteractionHistory events={events} />
          <RiskScoreDisplay scores={riskScores} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <MicroLessons lessons={lessons} />
          <PersonalizedTips
            riskScore={totalRisk}
            recentClicks={stats.clicks}
            recentReports={stats.reports}
          />
        </section>
      </main>
    </div>
  )
}

const fallbackLessons = [
  {
    id: 'phishing-basics',
    slug: 'phishing-basics',
    title: 'Understanding Phishing',
    description: 'Learn what phishing is and how attackers craft convincing messages.',
    duration: 5,
  },
  {
    id: 'link-safety',
    slug: 'link-security',
    title: 'Link Safety Basics',
    description: 'Practice hovering, verifying domains, and spotting shortened URLs.',
    duration: 4,
  },
]

function computeStats(events: InteractionEntry[]) {
  return events.reduce(
    (acc, event) => {
      acc.total += 1
      if (event.type === 'CLICK') acc.clicks += 1
      if (event.type === 'REPORT') acc.reports += 1
      return acc
    },
    { total: 0, clicks: 0, reports: 0 }
  )
}

interface StatCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: number
  accent: string
}

function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted mb-1">{label}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
          <Icon className={`h-8 w-8 opacity-60 ${accent}`} />
        </div>
      </CardContent>
    </Card>
  )
}
