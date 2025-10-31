'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { EventReportRow } from '@/components/admin/ReportsTable'

const ThreatGlobe = dynamic(() => import('@/components/threat-globe').then((mod) => ({ default: mod.ThreatGlobe })), {
  ssr: false,
})

interface ThreatGlobeContainerProps {
  initialEvents: EventReportRow[]
}

interface LiveEvent extends EventReportRow {
  location?: string | null
}

export function ThreatGlobeContainer({ initialEvents }: ThreatGlobeContainerProps) {
  const [events, setEvents] = useState<LiveEvent[]>(() => initialEvents.slice(0, 12))

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

  const formattedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      created_at: event.created_at,
    }))
  }, [events])

  return (
    <div className="space-y-6">
      <div className="relative flex items-center justify-center min-h-[400px] rounded-lg bg-surface-muted">
        <ThreatGlobe theme="light" />
      </div>

      <div className="space-y-2">
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
