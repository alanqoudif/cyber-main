import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface InteractionEntry {
  id: string
  type: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE'
  created_at: string
  campaign?: string | null
  meta?: Record<string, unknown> | null
}

interface InteractionHistoryProps {
  events: InteractionEntry[]
}

export function InteractionHistory({ events }: InteractionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Interactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted">No interactions yet.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-1 rounded-lg bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {event.campaign || 'Training'}
                </p>
                <p className="text-xs text-muted">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
              <Badge type={event.type}>{event.type}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
