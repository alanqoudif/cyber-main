import Link from 'next/link'
import type { ComponentType } from 'react'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CampaignList, type AdminCampaignSummary } from '@/components/admin/CampaignList'
import { UserList, type AdminUserSummary } from '@/components/admin/UserList'
import { ReportsTable, type EventReportRow } from '@/components/admin/ReportsTable'
import { CSVExport } from '@/components/admin/CSVExport'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, Mail, AlertTriangle, Plus } from 'lucide-react'

export default async function AdminDashboardPage() {
  const user = await requireAdmin()
  const supabase = await createClient()

  const [{ count: campaignsCount }, { count: usersCount }, { count: eventsCount }, { count: recipientsCount }] =
    await Promise.all([
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('recipients').select('id', { count: 'exact', head: true }),
    ])

  const { data: campaignsRaw } = await supabase
    .from('campaigns')
    .select('id, title, description, created_at, recipients(count), events(count), link_scans(status, risk_label, updated_at)')
    .order('created_at', { ascending: false })
    .limit(6)

  const campaigns: AdminCampaignSummary[] = (campaignsRaw ?? []).map((campaign: any) => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    created_at: campaign.created_at,
    recipients: campaign.recipients?.[0]?.count ?? 0,
    events: campaign.events?.[0]?.count ?? 0,
    last_scan_status: campaign.link_scans?.[0]?.status ?? null,
    last_scan_risk: campaign.link_scans?.[0]?.risk_label ?? null,
  }))

  const { data: eventsRaw } = await supabase
    .from('events')
    .select('id, type, created_at, campaigns(title), users(email), recipients(email)')
    .order('created_at', { ascending: false })
    .limit(20)

  const eventStats = computeEventStats(eventsRaw ?? [])
  const events: EventReportRow[] = (eventsRaw ?? []).map((event: any) => ({
    id: event.id,
    type: event.type,
    created_at: event.created_at,
    campaign: event.campaigns?.title ?? null,
    user: event.users?.email ?? null,
    recipient: event.recipients?.email ?? null,
    meta: event.meta,
  }))

  const { data: usersRaw } = await supabase
    .from('users')
    .select('id, name, email, role')
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: userEvents } = await supabase
    .from('events')
    .select('user_id, created_at, type')
    .order('created_at', { ascending: false })
    .limit(300)

  const { data: riskScores } = await supabase
    .from('risk_scores')
    .select('user_id, score, updated_at')

  const usersSummaries = buildUserSummaries(usersRaw ?? [], userEvents ?? [], riskScores ?? [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={user.role} />
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-muted">
              Monitor campaign performance, user risk, and phishing simulations.
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BarChart3} label="Campaigns" value={campaignsCount ?? 0} accent="text-accent" />
          <StatCard icon={Users} label="Users" value={usersCount ?? 0} accent="text-blue-500" />
          <StatCard icon={Mail} label="Events" value={eventsCount ?? 0} accent="text-green-500" />
          <StatCard icon={AlertTriangle} label="Recipients" value={recipientsCount ?? 0} accent="text-yellow-500" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <CampaignList campaigns={campaigns} />
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Event Breakdown</p>
                  <Badge type="OPEN">Last 20 events</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <StatPill label="Open" value={eventStats.OPEN} tone="blue" />
                  <StatPill label="Click" value={eventStats.CLICK} tone="red" />
                  <StatPill label="Report" value={eventStats.REPORT} tone="green" />
                  <StatPill label="Ignore" value={eventStats.IGNORE} tone="gray" />
                </div>
              </CardContent>
            </Card>
            <UserList users={usersSummaries} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>
            <CSVExport />
          </div>
          <ReportsTable events={events} />
        </section>
      </main>
    </div>
  )
}

function computeEventStats(events: any[]) {
  return events.reduce(
    (acc, event) => {
      if (event.type === 'OPEN') acc.OPEN += 1
      if (event.type === 'CLICK') acc.CLICK += 1
      if (event.type === 'REPORT') acc.REPORT += 1
      if (event.type === 'IGNORE') acc.IGNORE += 1
      return acc
    },
    { OPEN: 0, CLICK: 0, REPORT: 0, IGNORE: 0 }
  )
}

function buildUserSummaries(
  users: any[],
  events: Array<{ user_id: string | null; created_at: string; type: string }>,
  riskScores: Array<{ user_id: string; score: number; updated_at: string }>
): AdminUserSummary[] {
  const eventMap = new Map<string, { count: number; last: string }>()
  for (const event of events) {
    if (!event.user_id) continue
    const current = eventMap.get(event.user_id)
    if (!current) {
      eventMap.set(event.user_id, { count: 1, last: event.created_at })
    } else {
      current.count += 1
      if (new Date(event.created_at) > new Date(current.last)) {
        current.last = event.created_at
      }
    }
  }

  const riskMap = new Map<string, number>()
  for (const risk of riskScores) {
    riskMap.set(risk.user_id, (riskMap.get(risk.user_id) ?? 0) + (risk.score ?? 0))
  }

  return users.map((user) => {
    const eventInfo = eventMap.get(user.id) ?? { count: 0, last: null }
    const totalRisk = riskMap.get(user.id) ?? 0
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      eventCount: eventInfo.count,
      totalRisk,
      lastEventAt: eventInfo.last,
    } as AdminUserSummary
  })
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

interface StatPillProps {
  label: string
  value: number
  tone: 'blue' | 'red' | 'green' | 'gray'
}

function StatPill({ label, value, tone }: StatPillProps) {
  const palette = {
    blue: 'bg-blue-500/10 text-blue-600',
    red: 'bg-red-500/10 text-red-600',
    green: 'bg-green-500/10 text-green-600',
    gray: 'bg-gray-500/10 text-gray-600',
  }[tone]

  return (
    <div className={`rounded-lg px-3 py-2 text-sm font-semibold ${palette}`}>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span>{value}</span>
      </div>
    </div>
  )
}
