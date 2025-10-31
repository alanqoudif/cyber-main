'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, ArrowRight } from 'lucide-react'

interface Recipient {
  email: string
  name?: string
}

export function CampaignForm({ campaignId, initialData }: { campaignId?: string; initialData?: any }) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [recipients, setRecipients] = useState<Recipient[]>(
    initialData?.recipients || [{ email: '' }]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addRecipient = () => {
    setRecipients([...recipients, { email: '' }])
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients]
    updated[index] = { ...updated[index], [field]: value }
    setRecipients(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const validRecipients = recipients.filter((r) => r.email.trim())
      if (validRecipients.length === 0) {
        throw new Error('At least one recipient is required')
      }

      const response = await fetch(campaignId ? `/api/campaigns/${campaignId}` : '/api/campaigns', {
        method: campaignId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          recipients: validRecipients,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save campaign')
      }

      const data = await response.json()
      router.push(`/campaigns/${data.campaign.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Campaign Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="e.g., Q1 2024 Security Training"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="Describe the purpose of this campaign..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recipients</h3>
              <p className="text-sm text-muted mt-1">Add email addresses for this campaign</p>
            </div>
            <Button type="button" variant="outline" onClick={addRecipient}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    required={index === 0}
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className="px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <input
                    type="text"
                    value={recipient.name || ''}
                    onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    placeholder="Name (optional)"
                    className="px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                {recipients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeRecipient(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : campaignId ? 'Update Campaign' : 'Create Campaign'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  )
}

