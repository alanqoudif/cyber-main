import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecipientList } from '@/components/campaigns/RecipientList'
import { SendCampaignButton } from '@/components/campaigns/SendCampaignButton'
import { Button } from '@/components/ui/button'
import { Edit, AlertTriangle, ShieldAlert } from 'lucide-react'

interface CampaignViewProps {
  params: { id: string }
}

export default async function CampaignDetailPage({ params }: CampaignViewProps) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, description, created_at, recipients(id, email, name, created_at), events(id, type, created_at, users(email)), link_scans(status, risk_label, updated_at)')
    .eq('id', params.id)
    .single()

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userRole="ADMIN" />
        <main className="mx-auto max-w-4xl px-6 py-16">
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Campaign not found</h2>
              <p className="text-sm text-muted">The campaign you are looking for may have been removed.</p>
              <Link href="/campaigns">
                <Button variant="outline">Back to campaigns</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const sortedEvents = [...(campaign.events ?? [])].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const stats = computeCampaignStats(sortedEvents)
  const scanStatus = campaign.link_scans?.[0]

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="ADMIN" />
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{campaign.title}</h1>
            <p className="mt-2 text-muted max-w-2xl">
              {campaign.description || 'No description provided for this campaign.'}
            </p>
            {scanStatus && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1 text-xs">
                <ShieldAlert className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">VirusTotal status: {scanStatus.status}</span>
                {scanStatus.risk_label && (
                  <span
                    className={`uppercase tracking-wide ${scanStatus.risk_label === 'malicious' ? 'text-red-500' : scanStatus.risk_label === 'suspicious' ? 'text-yellow-500' : 'text-muted'}`}
                  >
                    {scanStatus.risk_label}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SendCampaignButton campaignId={campaign.id} />
            <Link href={`/campaigns/${campaign.id}/edit`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit Campaign
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Recipients" value={campaign.recipients?.length ?? 0} tone="blue" />
          <MetricCard label="Opens" value={stats.OPEN} tone="green" />
          <MetricCard label="Clicks" value={stats.CLICK} tone="yellow" />
          <MetricCard label="Reports" value={stats.REPORT} tone="red" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <RecipientList recipients={(campaign.recipients ?? []).map((recipient: any) => ({
            id: recipient.id,
            email: recipient.email,
            name: recipient.name,
            created_at: recipient.created_at,
          }))} />

          <Card>
            <CardHeader className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedEvents.length > 0 ? (
                sortedEvents.slice(0, 12).map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.users?.email || 'Anonymous user'}</p>
                      <p className="text-xs text-muted">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge type={event.type}>{event.type}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">No events recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

function computeCampaignStats(events: Array<{ type: string }>) {
  return events.reduce(
    (acc, event) => {
      if (event.type === 'OPEN') acc.OPEN += 1
      if (event.type === 'CLICK') acc.CLICK += 1
      if (event.type === 'REPORT') acc.REPORT += 1
      return acc
    },
    { OPEN: 0, CLICK: 0, REPORT: 0 }
  )
}

interface MetricCardProps {
  label: string
  value: number
  tone: 'blue' | 'green' | 'yellow' | 'red'
}

function MetricCard({ label, value, tone }: MetricCardProps) {
  const palette = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-green-500/10 text-green-600',
    yellow: 'bg-yellow-500/10 text-yellow-600',
    red: 'bg-red-500/10 text-red-600',
  }[tone]

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted mb-2">{label}</p>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${palette}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
