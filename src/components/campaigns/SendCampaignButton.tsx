'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface SendCampaignButtonProps {
  campaignId: string
}

export function SendCampaignButton({ campaignId }: SendCampaignButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const sendCampaign = () => {
    startTransition(async () => {
      try {
        setStatus('idle')
        setMessage('')
        const response = await fetch(`/api/campaigns/${campaignId}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to send campaign')
        }

        const payload = await response.json()
        setStatus('success')
        setMessage(`Emails dispatched to ${payload.count} recipients`)
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Failed to send campaign')
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button onClick={sendCampaign} disabled={isPending}>
        <Send className="h-4 w-4 mr-2" />
        {isPending ? 'Sending...' : 'Send Campaign'}
      </Button>
      {status !== 'idle' && (
        <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
