'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EventReportRow } from '@/components/admin/ReportsTable'
import { ExternalLink } from 'lucide-react'

interface ThreatGlobeContainerProps {
  initialEvents: EventReportRow[]
}

interface LiveEvent extends EventReportRow {
  location?: string | null
}

export function ThreatGlobeContainer({ initialEvents }: ThreatGlobeContainerProps) {
  const [events, setEvents] = useState<LiveEvent[]>(() => initialEvents.slice(0, 12))
  const [iframeError, setIframeError] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_REALTIME !== 'true') {
      return
    }

    const supabase = createClient()
    const channel = supabase
      .channel('realtime-threats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        setEvents((prev) => {
          const next = [{
            id: payload.new.id,
            type: payload.new.type,
            created_at: payload.new.created_at,
            campaign: payload.new.campaign_id,
            user: payload.new.user_id,
            recipient: payload.new.recipient_id,
            meta: payload.new.meta,
          }, ...prev]
          return next.slice(0, 12)
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Check if iframe is blocked after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        // If iframe hasn't loaded after 5 seconds, it might be blocked
        // But we'll give it more time before showing error
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [iframeLoaded])

  const formattedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      created_at: event.created_at,
    }))
  }, [events])

  return (
    <div className="space-y-6">
      <div className="relative w-full min-h-[600px] rounded-lg bg-surface-muted overflow-hidden border border-border">
        {iframeError ? (
          <div className="flex flex-col items-center justify-center min-h-[600px] p-8 text-center">
            <p className="text-muted mb-4">
              Unable to load CheckPoint Threat Map in iframe. Please visit the map directly.
            </p>
            <a
              href="https://threatmap.checkpoint.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Open CheckPoint Threat Map
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <>
            <iframe
              src="https://threatmap.checkpoint.com/"
              className="w-full h-full min-h-[600px] border-0 pointer-events-none"
              title="CheckPoint Threat Map"
              allowFullScreen={false}
              loading="lazy"
              style={{ minHeight: '600px', pointerEvents: 'none' }}
              onLoad={() => {
                setIframeLoaded(true)
              }}
              onError={() => {
                setIframeError(true)
              }}
            />
            {/* Overlay to prevent interaction */}
            <div 
              className="absolute inset-0 z-10 cursor-not-allowed"
              style={{ pointerEvents: 'auto' }}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        {formattedEvents.length === 0 ? (
          <p className="text-sm text-muted text-center">No live events yet. Interactions will appear here.</p>
        ) : (
          formattedEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{event.campaign || 'Campaign event'}</p>
                <p className="text-[11px] text-muted">{new Date(event.created_at).toLocaleString()}</p>
              </div>
              <span className="text-xs text-muted">{event.type}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
