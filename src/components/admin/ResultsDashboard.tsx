'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  status: string
  recipients_count: number
  sent_count: number
  opened_count: number
  clicked_count: number
  reported_count: number
  created_at: string
}

interface ResultsDashboardProps {
  campaigns: Campaign[]
}

export function ResultsDashboard({ campaigns }: ResultsDashboardProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId)

  useEffect(() => {
    if (selectedCampaignId) {
      loadCampaignEvents(selectedCampaignId)
    }
  }, [selectedCampaignId])

  const loadCampaignEvents = async (campaignId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/events`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalStats = campaigns.reduce(
    (acc, campaign) => ({
      recipients: acc.recipients + campaign.recipients_count,
      sent: acc.sent + campaign.sent_count,
      opened: acc.opened + campaign.opened_count,
      clicked: acc.clicked + campaign.clicked_count,
      reported: acc.reported + campaign.reported_count,
    }),
    { recipients: 0, sent: 0, opened: 0, clicked: 0, reported: 0 }
  )

  const openRate =
    totalStats.sent > 0 ? ((totalStats.opened / totalStats.sent) * 100).toFixed(1) : '0'
  const clickRate =
    totalStats.sent > 0 ? ((totalStats.clicked / totalStats.sent) * 100).toFixed(1) : '0'
  const reportRate =
    totalStats.sent > 0 ? ((totalStats.reported / totalStats.sent) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Total Recipients</p>
                <p className="text-2xl font-semibold text-foreground">{totalStats.recipients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Emails Sent</p>
                <p className="text-2xl font-semibold text-foreground">{totalStats.sent}</p>
              </div>
              <Mail className="h-8 w-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Opened</p>
                <p className="text-2xl font-semibold text-foreground">
                  {totalStats.opened} <span className="text-sm text-muted">({openRate}%)</span>
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Clicked</p>
                <p className="text-2xl font-semibold text-foreground">
                  {totalStats.clicked} <span className="text-sm text-muted">({clickRate}%)</span>
                </p>
              </div>
              <MousePointerClick className="h-8 w-8 text-orange-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Reported</p>
                <p className="text-2xl font-semibold text-foreground">
                  {totalStats.reported} <span className="text-sm text-muted">({reportRate}%)</span>
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-red-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Results</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted">No campaigns found</div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCampaignId === campaign.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-border/80'
                  }`}
                  onClick={() => setSelectedCampaignId(campaign.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{campaign.title}</h3>
                      <p className="text-sm text-muted">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={campaign.status === 'completed' ? 'default' : 'outline'}>
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted">Recipients:</span>{' '}
                      <span className="font-medium text-foreground">
                        {campaign.recipients_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">Sent:</span>{' '}
                      <span className="font-medium text-foreground">{campaign.sent_count}</span>
                    </div>
                    <div>
                      <span className="text-muted">Opened:</span>{' '}
                      <span className="font-medium text-foreground">{campaign.opened_count}</span>
                    </div>
                    <div>
                      <span className="text-muted">Clicked:</span>{' '}
                      <span className="font-medium text-foreground">{campaign.clicked_count}</span>
                    </div>
                    <div>
                      <span className="text-muted">Reported:</span>{' '}
                      <span className="font-medium text-foreground">{campaign.reported_count}</span>
                    </div>
                  </div>

                  {campaign.sent_count > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted">
                          Open Rate:{' '}
                          {((campaign.opened_count / campaign.sent_count) * 100).toFixed(1)}%
                        </span>
                        <span className="text-muted">
                          Click Rate:{' '}
                          {((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1)}%
                        </span>
                        <span className="text-muted">
                          Report Rate:{' '}
                          {((campaign.reported_count / campaign.sent_count) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Timeline */}
      {selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle>Event Timeline - {selectedCampaign.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted">No events recorded yet</div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-muted"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.type}</p>
                      <p className="text-xs text-muted">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge type={event.type}>{event.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

