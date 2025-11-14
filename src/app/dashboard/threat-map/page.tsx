import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ThreatGlobeContainer } from '@/components/dashboard/ThreatGlobeContainer'
import { ThreatMapStats } from '@/components/dashboard/ThreatMapStats'
import { LiveAttacksList } from '@/components/dashboard/LiveAttacksList'
import type { EventReportRow } from '@/components/admin/ReportsTable'

async function fetchCheckPointThreatData() {
  try {
    // Import the function directly from the API route
    // Since we're in a server component, we can call the function directly
    const { fetchCheckPointThreatData } = await import('@/app/api/threat-map/data/route')
    return await fetchCheckPointThreatData()
  } catch (error) {
    console.error('Error fetching CheckPoint threat data:', error)
    // Return default values on error
    return {
      total: 0,
      attacks: 0,
      malware: 0,
      phishing: 0,
      riskScore: 0,
      lastUpdate: new Date().toISOString(),
    }
  }
}

async function fetchLiveAttacks() {
  try {
    // Import the function directly from the API route
    const { fetchLiveAttacks } = await import('@/app/api/threat-map/attacks/route')
    return await fetchLiveAttacks()
  } catch (error) {
    console.error('Error fetching live attacks:', error)
    return { attacks: [], currentRate: 0 }
  }
}

export default async function ThreatMapPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch data from CheckPoint Threat Map
  const threatData = await fetchCheckPointThreatData()
  const liveAttacksData = await fetchLiveAttacks()

  // Get recent events for Recent Activity list (still from our database)
  const { data: recentEvents } = await supabase
    .from('events')
    .select('id, type, created_at, campaigns(title), users(email), recipients(email)')
    .order('created_at', { ascending: false })
    .limit(100)

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
              <CardTitle>CheckPoint Threat Map</CardTitle>
              <p className="text-sm text-muted mt-1">
                Real-time global threat intelligence visualization
              </p>
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

          <ThreatMapStats initialData={threatData} />
        </div>

        {/* Live Attacks List */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiveAttacksList 
              initialAttacks={liveAttacksData.attacks || []} 
              initialRate={liveAttacksData.currentRate || 0}
            />
          </div>
          <div className="lg:col-span-1">
            {/* Keep Recent Activity from our database here if needed */}
          </div>
        </div>
      </main>
    </div>
  )
}
