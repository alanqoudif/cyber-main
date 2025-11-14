'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Save, Mail, Globe, Users, Send } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
}

interface LandingPage {
  id: string
  name: string
}

interface CampaignWizardProps {
  templates: EmailTemplate[]
  landingPages: LandingPage[]
  onSave: () => void
  onCancel: () => void
}

type Step = 'details' | 'template' | 'landing-page' | 'recipients' | 'review'

export function CampaignWizard({ templates, landingPages, onSave, onCancel }: CampaignWizardProps) {
  const [step, setStep] = useState<Step>('details')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedLandingPageId, setSelectedLandingPageId] = useState<string>('')
  const [recipients, setRecipients] = useState<Array<{ email: string; name?: string }>>([
    { email: '' },
  ])
  const [loading, setLoading] = useState(false)

  const steps: Array<{ id: Step; label: string; icon: typeof Mail }> = [
    { id: 'details', label: 'Details', icon: Mail },
    { id: 'template', label: 'Email Template', icon: Mail },
    { id: 'landing-page', label: 'Landing Page', icon: Globe },
    { id: 'recipients', label: 'Recipients', icon: Users },
    { id: 'review', label: 'Review', icon: Send },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  const addRecipient = () => {
    setRecipients([...recipients, { email: '' }])
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipients(updated)
  }

  const handleNext = () => {
    if (step === 'details' && !title.trim()) {
      alert('Please enter a campaign title')
      return
    }
    if (step === 'template' && !selectedTemplateId) {
      alert('Please select an email template')
      return
    }
    if (step === 'landing-page' && !selectedLandingPageId) {
      alert('Please select a landing page')
      return
    }
    if (step === 'recipients') {
      const validRecipients = recipients.filter((r) => r.email.trim())
      if (validRecipients.length === 0) {
        alert('Please add at least one recipient')
        return
      }
    }

    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].id)
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].id)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const validRecipients = recipients.filter((r) => r.email.trim())

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          email_template_id: selectedTemplateId,
          landing_page_id: selectedLandingPageId,
          recipients: validRecipients,
        }),
      })

      if (res.ok) {
        onSave()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
      alert('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
  const selectedLandingPage = landingPages.find((lp) => lp.id === selectedLandingPageId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">New Campaign</h2>
            <p className="text-sm text-muted mt-1">Create a phishing simulation campaign</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((s, index) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isCompleted = currentStepIndex > index
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? 'border-accent bg-accent text-white'
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-border text-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive ? 'text-accent' : isCompleted ? 'text-green-500' : 'text-muted'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-border'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="e.g., Q1 2024 Security Training"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="Describe the purpose of this campaign..."
                />
              </div>
            </div>
          )}

          {step === 'template' && (
            <div className="space-y-4">
              <p className="text-sm text-muted mb-4">Select an email template for this campaign</p>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  <p>No templates available. Please create a template first.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplateId === template.id
                          ? 'border-accent bg-accent/5'
                          : 'hover:border-border'
                      }`}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                        <p className="text-sm text-muted">{template.subject}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'landing-page' && (
            <div className="space-y-4">
              <p className="text-sm text-muted mb-4">Select a landing page for this campaign</p>
              {landingPages.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  <p>No landing pages available. Please create a landing page first.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {landingPages.map((lp) => (
                    <Card
                      key={lp.id}
                      className={`cursor-pointer transition-all ${
                        selectedLandingPageId === lp.id
                          ? 'border-accent bg-accent/5'
                          : 'hover:border-border'
                      }`}
                      onClick={() => setSelectedLandingPageId(lp.id)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground">{lp.name}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'recipients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">Add recipients for this campaign</p>
                <Button type="button" variant="outline" onClick={addRecipient}>
                  Add Recipient
                </Button>
              </div>
              <div className="space-y-3">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="email"
                      required={index === 0}
                      value={recipient.email}
                      onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                    <input
                      type="text"
                      value={recipient.name || ''}
                      onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                      placeholder="Name (optional)"
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                    {recipients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeRecipient(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Campaign Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted">Title:</span> <span className="text-foreground">{title}</span>
                  </div>
                  {description && (
                    <div>
                      <span className="text-muted">Description:</span>{' '}
                      <span className="text-foreground">{description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Email Template</h3>
                <div className="text-sm">
                  <span className="text-muted">Selected:</span>{' '}
                  <span className="text-foreground">{selectedTemplate?.name || 'None'}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Landing Page</h3>
                <div className="text-sm">
                  <span className="text-muted">Selected:</span>{' '}
                  <span className="text-foreground">{selectedLandingPage?.name || 'None'}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Recipients</h3>
                <div className="text-sm">
                  <span className="text-muted">Total:</span>{' '}
                  <span className="text-foreground">
                    {recipients.filter((r) => r.email.trim()).length} recipients
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStepIndex === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        {step === 'review' ? (
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

