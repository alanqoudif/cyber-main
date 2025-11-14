'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Globe,
  Send,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Settings,
} from 'lucide-react'
import { EmailTemplateBuilder } from './EmailTemplateBuilder'
import { LandingPageBuilder } from './LandingPageBuilder'
import { CampaignWizard } from './CampaignWizard'
import { ResultsDashboard } from './ResultsDashboard'

type TabType = 'templates' | 'landing-pages' | 'campaigns' | 'results'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  created_at: string
}

interface LandingPage {
  id: string
  name: string
  html: string
  created_at: string
}

interface Campaign {
  id: string
  title: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed'
  email_template_id?: string
  landing_page_id?: string
  recipients_count: number
  sent_count: number
  opened_count: number
  clicked_count: number
  reported_count: number
  created_at: string
}

export function GophishSimulator() {
  const [activeTab, setActiveTab] = useState<TabType>('campaigns')
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false)
  const [showLandingPageBuilder, setShowLandingPageBuilder] = useState(false)
  const [showCampaignWizard, setShowCampaignWizard] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [editingLandingPage, setEditingLandingPage] = useState<LandingPage | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load templates, landing pages, and campaigns
      const [templatesRes, landingPagesRes, campaignsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/landing-pages'),
        fetch('/api/campaigns'),
      ])

      if (templatesRes.ok) {
        const data = await templatesRes.json()
        setTemplates(data.templates || [])
      }

      if (landingPagesRes.ok) {
        const data = await landingPagesRes.json()
        setLandingPages(data.landingPages || [])
      }

      if (campaignsRes.ok) {
        const data = await campaignsRes.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'templates' as TabType, label: 'Email Templates', icon: Mail },
    { id: 'landing-pages' as TabType, label: 'Landing Pages', icon: Globe },
    { id: 'campaigns' as TabType, label: 'Campaigns', icon: Send },
    { id: 'results' as TabType, label: 'Results', icon: BarChart3 },
  ]

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleDeleteLandingPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return

    try {
      const res = await fetch(`/api/landing-pages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLandingPages(landingPages.filter((lp) => lp.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete landing page:', error)
    }
  }

  if (showTemplateBuilder) {
    return (
      <EmailTemplateBuilder
        template={editingTemplate}
        onSave={() => {
          setShowTemplateBuilder(false)
          setEditingTemplate(null)
          loadData()
        }}
        onCancel={() => {
          setShowTemplateBuilder(false)
          setEditingTemplate(null)
        }}
      />
    )
  }

  if (showLandingPageBuilder) {
    return (
      <LandingPageBuilder
        landingPage={editingLandingPage}
        onSave={() => {
          setShowLandingPageBuilder(false)
          setEditingLandingPage(null)
          loadData()
        }}
        onCancel={() => {
          setShowLandingPageBuilder(false)
          setEditingLandingPage(null)
        }}
      />
    )
  }

  if (showCampaignWizard) {
    return (
      <CampaignWizard
        templates={templates}
        landingPages={landingPages}
        onSave={() => {
          setShowCampaignWizard(false)
          loadData()
        }}
        onCancel={() => setShowCampaignWizard(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Simplified Tabs with Action Button */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-transparent text-muted hover:text-foreground hover:bg-surface-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
        {activeTab === 'campaigns' && (
          <Button onClick={() => setShowCampaignWizard(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        )}
        {activeTab === 'templates' && (
          <Button onClick={() => setShowTemplateBuilder(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        )}
        {activeTab === 'landing-pages' && (
          <Button onClick={() => setShowLandingPageBuilder(true)} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Landing Page
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : (
          <>
            {activeTab === 'templates' && (
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Mail className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No templates yet</h3>
                      <p className="text-muted mb-6">Create your first email template</p>
                      <Button onClick={() => setShowTemplateBuilder(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <p className="text-sm text-muted mt-1 line-clamp-2">{template.subject}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted">
                              <Clock className="h-3 w-3" />
                              {new Date(template.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingTemplate(template)
                                  setShowTemplateBuilder(true)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'landing-pages' && (
              <div className="space-y-4">
                {landingPages.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Globe className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No landing pages yet</h3>
                      <p className="text-muted mb-6">Create your first landing page</p>
                      <Button onClick={() => setShowLandingPageBuilder(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Landing Page
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {landingPages.map((lp) => (
                      <Card key={lp.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-base">{lp.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted">
                              <Clock className="h-3 w-3" />
                              {new Date(lp.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingLandingPage(lp)
                                  setShowLandingPageBuilder(true)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLandingPage(lp.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Send className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
                      <p className="text-muted mb-6">Create your first phishing simulation campaign</p>
                      <Button onClick={() => setShowCampaignWizard(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{campaign.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant={
                                    campaign.status === 'completed'
                                      ? 'default'
                                      : campaign.status === 'sending'
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                >
                                  {campaign.status}
                                </Badge>
                                <span className="text-xs text-muted">
                                  {new Date(campaign.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            <div className="text-center p-2 rounded bg-surface-muted">
                              <div className="text-lg font-semibold text-foreground">
                                {campaign.recipients_count}
                              </div>
                              <div className="text-xs text-muted">Recipients</div>
                            </div>
                            <div className="text-center p-2 rounded bg-surface-muted">
                              <div className="text-lg font-semibold text-foreground">
                                {campaign.sent_count}
                              </div>
                              <div className="text-xs text-muted">Sent</div>
                            </div>
                            <div className="text-center p-2 rounded bg-surface-muted">
                              <div className="text-lg font-semibold text-foreground">
                                {campaign.opened_count}
                              </div>
                              <div className="text-xs text-muted">Opened</div>
                            </div>
                            <div className="text-center p-2 rounded bg-surface-muted">
                              <div className="text-lg font-semibold text-foreground">
                                {campaign.clicked_count}
                              </div>
                              <div className="text-xs text-muted">Clicked</div>
                            </div>
                            <div className="text-center p-2 rounded bg-surface-muted">
                              <div className="text-lg font-semibold text-foreground">
                                {campaign.reported_count}
                              </div>
                              <div className="text-xs text-muted">Reported</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {campaign.status === 'draft' && (
                              <Button size="sm" className="flex-1">
                                <Send className="h-3 w-3 mr-1" />
                                Launch
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'results' && <ResultsDashboard campaigns={campaigns} />}
          </>
        )}
      </div>
    </div>
  )
}

