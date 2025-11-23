'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackLocalInteraction } from '@/components/dashboard/LocalInteractionStats'

export default function LandingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const campaignId = params.cid as string
  const recipientId = searchParams?.get('rid') ?? null
  const [hasInteracted, setHasInteracted] = useState(false)
  const [interactionType, setInteractionType] = useState<'REPORT' | 'IGNORE' | null>(null)

  const trackEvent = async (type: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE', meta?: Record<string, unknown>) => {
    if (!campaignId) return
    
    try {
      await fetch('/api/events/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          campaignId,
          recipientId,
          meta: {
            ...meta,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            recipientId,
          },
        }),
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  useEffect(() => {
    if (campaignId) {
      // Track page open automatically
      trackEvent('OPEN')
      // Also track locally
      trackLocalInteraction('OPEN')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  const handleReport = async () => {
    await trackEvent('REPORT')
    trackLocalInteraction('REPORT')
    setHasInteracted(true)
    setInteractionType('REPORT')
  }

  const handleIgnore = async () => {
    await trackEvent('IGNORE')
    setHasInteracted(true)
    setInteractionType('IGNORE')
  }

  const handleLinkClick = () => {
    trackEvent('CLICK', { clickedElement: 'verify_button' })
    trackLocalInteraction('CLICK')
  }

  if (hasInteracted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-lg w-full surface-card p-8 space-y-6 text-center">
          {interactionType === 'REPORT' ? (
            <>
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-500/10 text-green-600 mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Great Job! ✓
                </h1>
                <p className="text-muted">
                  You correctly identified this as a phishing attempt. Your vigilance helps protect
                  your organization.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium text-foreground">What you did right:</p>
                <ul className="text-sm text-muted space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You reported the suspicious email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You didn't click on the link or provide information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You followed security best practices</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-yellow-500/10 text-yellow-600 mx-auto">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  Stay Alert! ⚠️
                </h1>
                <p className="text-muted">
                  This was a simulated phishing email. In a real scenario, clicking suspicious links
                  could compromise your security.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Tips for the future:</p>
                <ul className="text-sm text-muted space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Verify sender email addresses carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Look for spelling errors and suspicious URLs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>When in doubt, report to your security team</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          <div className="pt-4">
            <Link href="/auth/login">
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Launch Interactive Training
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-50 px-6">
      <div className="max-w-lg w-full surface-card p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-yellow-500/10 text-yellow-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Educational Warning ⚠️
          </h1>
          <p className="text-muted">
            This is a simulated phishing page created for security awareness training. You should
            stop and verify before providing any information.
          </p>
          {recipientId && (
            <p className="mt-2 text-xs text-muted">
              Personalized training link for recipient ID ending with {recipientId.slice(0, 8)}
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-foreground">
            <strong>Red flags you should notice:</strong>
          </p>
          <ul className="text-sm text-muted mt-2 space-y-1 list-disc list-inside">
            <li>Urgent language demanding immediate action</li>
            <li>Requesting sensitive information via email</li>
            <li>Unusual sender or domain</li>
            <li>Suspicious links or attachments</li>
          </ul>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button onClick={handleReport} className="flex-1 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Report as Phishing
          </Button>
          <Button onClick={handleIgnore} variant="outline" className="flex-1">
            Ignore
          </Button>
        </div>

        <p className="text-xs text-center text-muted">
          This is part of CyberMirror's security awareness training program
        </p>
      </div>
    </main>
  )
}
