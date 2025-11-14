'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePreferences } from '@/context/preferences-context'

interface VulnerabilityInjection {
  id: string
  injection_type: string
  template_name: string
  subject?: string | null
  content: string
  url?: string | null
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  injected_at: string
  expires_at?: string | null
  status: string
  meta?: {
    redFlags?: string[]
    description?: string
  }
}

interface StealthAdInjectionProps {
  position?: 'top' | 'bottom' | 'sidebar' | 'popup'
}

export function StealthAdInjection({ position = 'bottom' }: StealthAdInjectionProps) {
  const [injection, setInjection] = useState<VulnerabilityInjection | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [clicked, setClicked] = useState(false)
  const { locale } = usePreferences()

  const copy = {
    en: {
      defaultSubject: 'Sponsored alert',
      close: 'Close',
      showMore: 'View more',
      button: {
        prize: 'Claim reward',
        upgrade: 'Upgrade now',
        offer: 'Unlock offer',
        default: 'Learn more'
      }
    },
    ar: {
      defaultSubject: 'إعلان',
      close: 'إغلاق',
      showMore: 'عرض المزيد',
      button: {
        prize: 'استلم الجائزة',
        upgrade: 'ترقية الآن',
        offer: 'احصل على العرض',
        default: 'عرض المزيد'
      }
    }
  }[locale]

  useEffect(() => {
    fetchPendingAdInjection()
  }, [])

  const fetchPendingAdInjection = async () => {
    try {
      const res = await fetch('/api/vulnerability/inject?status=PENDING&type=AD')
      const data = await res.json()
      if (data.injections && data.injections.length > 0) {
        // Filter by position if needed
        let adInjection = data.injections.find((inj: VulnerabilityInjection) => {
          if (position === 'popup' && inj.injection_type === 'AD_POPUP') return true
          if (position === 'bottom' && inj.injection_type === 'AD_BANNER') return true
          if (position === 'sidebar' && inj.injection_type === 'AD_SIDEBAR') return true
          return false
        })
        
        // If no specific match, get any ad injection
        if (!adInjection) {
          adInjection = data.injections.find((inj: VulnerabilityInjection) => 
            inj.injection_type.startsWith('AD_')
          )
        }
        
        if (adInjection) {
          setInjection(adInjection)
        }
      }
    } catch (error) {
      console.error('Error fetching ad injection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async () => {
    if (!injection || clicked) return

    setClicked(true)
    try {
      await fetch('/api/vulnerability/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          injectionId: injection.id,
          response: 'CLICKED',
        }),
      })
      
      // Navigate to the phishing page
      if (injection.url) {
        window.location.href = injection.url
      }
    } catch (error) {
      console.error('Error responding to injection:', error)
    }
  }

  const handleDismiss = async () => {
    if (!injection) return

    setDismissed(true)
    try {
      await fetch('/api/vulnerability/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          injectionId: injection.id,
          response: 'IGNORED',
        }),
      })
    } catch (error) {
      console.error('Error dismissing injection:', error)
    }
  }

  if (loading || !injection || dismissed) {
    return null
  }

  // Check if expired
  if (injection.expires_at && new Date(injection.expires_at) < new Date()) {
    return null
  }

  // Determine position class
  const positionClasses = {
    top: 'fixed top-0 left-0 right-0 z-50',
    bottom: 'fixed bottom-0 left-0 right-0 z-50',
    sidebar: 'sticky top-4',
    popup: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
  }

  // Render based on injection type
  if (injection.injection_type === 'AD_POPUP') {
    return (
      <div className={positionClasses.popup}>
        <Card className="max-w-md w-full mx-4 border-2 border-border/60 bg-surface/95 p-6 shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">
              {injection.subject || copy.defaultSubject}
            </h3>
            <button
              onClick={handleDismiss}
              className="text-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-sm text-foreground mb-4 whitespace-pre-wrap">
            {injection.content}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClick}
              className="flex-1 bg-accent hover:bg-accent-soft text-white"
            >
              <ExternalLink className="h-4 w-4 ml-2" />
              {(() => {
                if (injection.url?.includes('winner')) return copy.button.prize
                if (injection.url?.includes('upgrade')) return copy.button.upgrade
                if (injection.url?.includes('offer')) return copy.button.offer
                return copy.button.default
              })()}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="px-4"
            >
              {copy.close}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (injection.injection_type === 'AD_BANNER') {
    return (
      <div className={positionClasses[position]}>
        <Card className="border-t-2 border-accent/30 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                {injection.subject || copy.defaultSubject}
              </h4>
              <p className="text-sm text-muted line-clamp-1">
                {injection.content.replace(/\n/g, ' ').substring(0, 100)}...
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleClick}
                className="bg-accent hover:bg-accent-soft text-white"
              >
                {copy.showMore}
                <ExternalLink className="h-3 w-3 mr-1" />
              </Button>
              <button
                onClick={handleDismiss}
                className="text-muted hover:text-foreground transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (injection.injection_type === 'AD_SIDEBAR') {
    return (
      <Card className="border-2 border-border/60 bg-gradient-to-br from-surface to-surface-muted/50 p-5 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs text-muted mb-1">إعلان</div>
            <h4 className="font-semibold text-foreground mb-2">
              {injection.subject || 'إعلان'}
            </h4>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-foreground mb-4 line-clamp-3">
          {injection.content}
        </p>
        <Button
          onClick={handleClick}
          className="w-full bg-accent hover:bg-accent-soft text-white"
          size="sm"
        >
          عرض المزيد
          <ExternalLink className="h-4 w-4 mr-2" />
        </Button>
      </Card>
    )
  }

  return null
}
