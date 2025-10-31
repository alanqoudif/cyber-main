import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ShieldAlert, Mail } from 'lucide-react'

export interface AdminCampaignSummary {
  id: string
  title: string
  description?: string | null
  created_at: string
  recipients: number
  events: number
  last_scan_status?: string | null
  last_scan_risk?: string | null
}

interface CampaignListProps {
  campaigns: AdminCampaignSummary[]
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Mail className="h-10 w-10 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
          <p className="text-sm text-muted mb-4">
            Launch your first phishing simulation to start collecting insights.
          </p>
          <Link href="/campaigns/new">
            <Button>
              Create Campaign
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{campaign.title}</CardTitle>
              <Link href={`/campaigns/${campaign.id}`}>
                <Button variant="ghost" className="text-xs">
                  View
                </Button>
              </Link>
            </div>
            {campaign.description && (
              <p className="text-sm text-muted line-clamp-2">{campaign.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-surface-muted p-3">
                <p className="text-muted text-xs uppercase tracking-wide">Recipients</p>
                <p className="text-lg font-semibold text-foreground">{campaign.recipients}</p>
              </div>
              <div className="rounded-lg bg-surface-muted p-3">
                <p className="text-muted text-xs uppercase tracking-wide">Events</p>
                <p className="text-lg font-semibold text-foreground">{campaign.events}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(campaign.created_at).toLocaleDateString()}
            </div>

            {campaign.last_scan_status && (
              <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                <ShieldAlert className="h-4 w-4 text-accent" />
                <div>
                  <p className="font-medium text-foreground">
                    VirusTotal: {formatScanStatus(campaign.last_scan_status)}
                  </p>
                  {campaign.last_scan_risk && (
                    <p
                      className={`text-[11px] uppercase tracking-wide ${
                        campaign.last_scan_risk === 'malicious'
                          ? 'text-red-500'
                          : campaign.last_scan_risk === 'suspicious'
                            ? 'text-yellow-500'
                            : 'text-muted'
                      }`}
                    >
                      {campaign.last_scan_risk}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatScanStatus(status: string) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'queued':
      return 'Queued'
    case 'error':
      return 'Error'
    default:
      return status
  }
}
