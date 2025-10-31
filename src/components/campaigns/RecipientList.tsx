import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export interface RecipientSummary {
  id: string
  email: string
  name?: string | null
  created_at?: string
}

interface RecipientListProps {
  recipients: RecipientSummary[]
}

export function RecipientList({ recipients }: RecipientListProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Users className="h-5 w-5 text-accent" />
        <CardTitle>Recipients</CardTitle>
      </CardHeader>
      <CardContent>
        {recipients.length === 0 ? (
          <p className="text-sm text-muted">No recipients added yet.</p>
        ) : (
          <div className="space-y-3">
            {recipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{recipient.email}</p>
                  {recipient.name && <p className="text-xs text-muted">{recipient.name}</p>}
                </div>
                {recipient.created_at && (
                  <p className="text-[11px] text-muted">
                    Added {new Date(recipient.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
