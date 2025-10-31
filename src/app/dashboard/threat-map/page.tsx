import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, TrendingUp } from 'lucide-react'
import { ThreatGlobeContainer } from '@/components/dashboard/ThreatGlobeContainer'
import type { EventReportRow } from '@/components/admin/ReportsTable'

export default async function ThreatMapPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get recent events for statistics
  const { data: recentEvents } = await supabase
    .from('events')
    .select('id, type, created_at, campaigns(title), users(email), recipients(email)')
    .order('created_at', { ascending: false })
    .limit(100)

  // Calculate statistics
  const stats = {
    total: recentEvents?.length || 0,
    opens: recentEvents?.filter((e) => e.type === 'OPEN').length || 0,
    clicks: recentEvents?.filter((e) => e.type === 'CLICK').length || 0,
    reports: recentEvents?.filter((e) => e.type === 'REPORT').length || 0,
  }

  // Get risk scores
  const { data: riskScores } = await supabase
    .from('risk_scores')
    .select('score')
    .order('updated_at', { ascending: false })
    .limit(50)

  const avgRiskScore =
    riskScores && riskScores.length > 0
      ? Math.round(
          riskScores.reduce((sum, rs) => sum + (rs.score || 0), 0) / riskScores.length
        )
      : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={user.role} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-semibold text-foreground">Threat Map</h1>
          <p className="mt-2 text-muted">
            Visual representation of security events and threat patterns
          </p>
          {process.env.NEXT_PUBLIC_ENABLE_REALTIME !== 'true' && (
            <p className="text-xs text-muted">
              Enable realtime updates by setting <code className="font-mono">NEXT_PUBLIC_ENABLE_REALTIME=true</code>.
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Threat Globe</CardTitle>
            </CardHeader>
            <CardContent>
              <ThreatGlobeContainer initialEvents={(recentEvents ?? []).map((event: any) => ({
                id: event.id,
                type: event.type,
                created_at: event.created_at,
                campaign: event.campaigns?.title ?? null,
                user: event.users?.email ?? null,
                recipient: event.recipients?.email ?? null,
                meta: event.meta,
              })) as EventReportRow[]} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted">Total Events</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <span className="text-sm text-muted">Opens</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{stats.opens}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-500" />
                      <span className="text-sm text-muted">Clicks</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{stats.clicks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-500" />
                      <span className="text-sm text-muted">Reports</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{stats.reports}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted">Average Risk Score</span>
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          avgRiskScore > 10
                            ? 'bg-red-500'
                            : avgRiskScore > 5
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((avgRiskScore / 20) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-2xl font-semibold text-foreground mt-2">{avgRiskScore}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted">
                      Risk scores are calculated based on user interactions with simulated phishing
                      campaigns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
