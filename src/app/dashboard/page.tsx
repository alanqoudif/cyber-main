import { redirect } from 'next/navigation'
import type { ComponentType } from 'react'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { InteractionHistory, type InteractionEntry } from '@/components/user/InteractionHistory'
import { RiskScoreDisplay, type RiskScoreEntry } from '@/components/user/RiskScoreDisplay'
import { PhishingTool } from '@/components/user/PhishingTool'
import { LinksTool } from '@/components/user/LinksTool'
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

  const events: InteractionEntry[] = (eventsRaw ?? []).map((event) => {
    const campaignRelation =
      event.campaigns as { title?: string | null }[] | { title?: string | null } | null | undefined
    const campaignTitle = Array.isArray(campaignRelation)
      ? campaignRelation[0]?.title ?? null
      : campaignRelation?.title ?? null
    return {
      id: event.id,
      type: event.type,
      created_at: event.created_at,
      campaign: campaignTitle,
    }
  })

  const riskScores: RiskScoreEntry[] = (riskScoresRaw ?? []).map((score) => {
    const campaignRelation =
      score.campaigns as { title?: string | null }[] | { title?: string | null } | null | undefined
    const campaignTitle = Array.isArray(campaignRelation)
      ? campaignRelation[0]?.title ?? null
      : campaignRelation?.title ?? null
    return {
      id: score.id,
      score: score.score,
      updated_at: score.updated_at,
      campaign: campaignTitle,
    }
  })

  const stats = computeStats(events)
  const totalRisk = riskScores.reduce((sum, score) => sum + score.score, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={user.role} />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        <header className="rounded-3xl border border-border/80 bg-surface/60 px-8 py-8 shadow-sm space-y-4">
          <p className="text-sm uppercase tracking-wider text-muted">
            Interactive security lab
          </p>
          <h1 className="text-3xl font-semibold text-foreground leading-relaxed max-w-3xl">
            Welcome {user.name || user.email}. Train on the live phishing drill and the sandbox link scanner without leaving this page.
          </h1>
          <p className="text-sm text-muted leading-6 max-w-2xl">
            Start with the phishing email to practice decision-making, then pivot to the link scanner to understand how each signal shapes the verdict.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Activity} label="Interactions" value={stats.total} accent="text-accent" />
          <StatCard icon={AlertTriangle} label="Clicks" value={stats.clicks} accent="text-yellow-500" />
          <StatCard icon={CheckCircle2} label="Reports" value={stats.reports} accent="text-green-500" />
          <StatCard icon={TrendingUp} label="Total Risk" value={totalRisk} accent="text-red-500" />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <PhishingTool />
          <LinksTool />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <InteractionHistory events={events} />
          <RiskScoreDisplay scores={riskScores} />
        </section>
      </main>
    </div>
  )
}

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
