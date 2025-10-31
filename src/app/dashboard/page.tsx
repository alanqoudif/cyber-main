import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { InteractionHistory, type InteractionEntry } from '@/components/user/InteractionHistory'
import { RiskScoreDisplay, type RiskScoreEntry } from '@/components/user/RiskScoreDisplay'
import { UserDashboardExperience } from '@/components/user/UserDashboardExperience'
import { ChevronDown, History, ShieldCheck } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={user.role} />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        <header className="rounded-3xl border border-border/80 bg-surface/60 px-8 py-8 shadow-sm space-y-5">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-wider text-muted">Interactive security lab</p>
            <h1 className="text-3xl font-semibold text-foreground leading-relaxed max-w-3xl">
              Welcome {user.name || user.email}. Pick your simulation and the interface transforms around it.
            </h1>
            <p className="text-sm text-muted leading-6 max-w-2xl">
              Toggle between the phishing drill and the link sandbox to live through the exact scenario you want to practise. Every motion, prompt, and result updates in real time as you explore.
            </p>
          </div>
        </header>

        <UserDashboardExperience />

        <section className="space-y-4">
          <details className="group rounded-3xl border border-border/80 bg-surface/60 px-6 py-5 transition-colors">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-foreground">
              <span className="inline-flex items-center gap-2">
                <History className="h-4 w-4 text-accent" />
                Latest interactions
              </span>
              <ChevronDown className="h-4 w-4 text-muted transition group-open:rotate-180" />
            </summary>
            <div className="mt-4">
              <InteractionHistory events={events} />
            </div>
          </details>

          <details className="group rounded-3xl border border-border/80 bg-surface/60 px-6 py-5 transition-colors">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Risk score trend
              </span>
              <ChevronDown className="h-4 w-4 text-muted transition group-open:rotate-180" />
            </summary>
            <div className="mt-4">
              <RiskScoreDisplay scores={riskScores} />
            </div>
          </details>
        </section>
      </main>
    </div>
  )
}
