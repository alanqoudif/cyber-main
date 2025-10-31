import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface EventReportRow {
  id: string
  type: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE'
  campaign?: string | null
  user?: string | null
  recipient?: string | null
  created_at: string
  meta?: Record<string, unknown> | null
}

interface ReportsTableProps {
  events: EventReportRow[]
}

export function ReportsTable({ events }: ReportsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {events.length === 0 ? (
          <p className="text-sm text-muted">No events recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted font-medium">Type</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Campaign</th>
                <th className="text-left py-3 px-4 text-muted font-medium">User</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Recipient</th>
                <th className="text-left py-3 px-4 text-muted font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border/40">
                  <td className="py-3 px-4">
                    <Badge type={event.type}>{event.type}</Badge>
                  </td>
                  <td className="py-3 px-4 text-foreground">{event.campaign || '—'}</td>
                  <td className="py-3 px-4 text-muted">{event.user || 'Anonymous'}</td>
                  <td className="py-3 px-4 text-muted">{event.recipient || '—'}</td>
                  <td className="py-3 px-4 text-muted">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
