import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit, Trash2, Mail, Calendar } from 'lucide-react'

export default async function CampaignsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, recipients(count), events(count), link_scans(status, risk_label, updated_at)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="ADMIN" />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Campaigns</h1>
            <p className="mt-2 text-muted">Manage your phishing simulation campaigns</p>
          </div>
          <Link href="/campaigns/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign: any) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <CardTitle>{campaign.title}</CardTitle>
                  <p className="text-sm text-muted mt-1">{campaign.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Recipients</span>
                      <span className="font-medium text-foreground">
                        {campaign.recipients?.[0]?.count || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Events</span>
                      <span className="font-medium text-foreground">
                        {campaign.events?.[0]?.count || 0}
                      </span>
                    </div>
                    {campaign.link_scans?.[0] && (
                      <div className="flex items-center justify-between text-xs rounded-lg bg-surface-muted px-2 py-2">
                        <span className="text-muted">VirusTotal</span>
                        <span className={
                          campaign.link_scans[0].risk_label === 'malicious'
                            ? 'text-red-500 font-semibold'
                            : campaign.link_scans[0].risk_label === 'suspicious'
                              ? 'text-yellow-500 font-semibold'
                              : 'text-foreground'
                        }>
                          {campaign.link_scans[0].status}
                          {campaign.link_scans[0].risk_label ? ` • ${campaign.link_scans[0].risk_label}` : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Calendar className="h-3 w-3" />
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Edit className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted mb-6">Create your first phishing simulation campaign</p>
              <Link href="/campaigns/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
