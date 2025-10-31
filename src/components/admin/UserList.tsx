import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeCheck, TrendingUp, Users } from 'lucide-react'
import { getRiskColor, getRiskLevel } from '@/lib/risk-score'

export interface AdminUserSummary {
  id: string
  name?: string | null
  email: string
  role: 'ADMIN' | 'USER'
  eventCount: number
  totalRisk: number
  lastEventAt?: string | null
}

interface UserListProps {
  users: AdminUserSummary[]
}

export function UserList({ users }: UserListProps) {
  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted">
          No users have interacted with campaigns yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>People Overview</CardTitle>
        <Link href="/dashboard">
          <span className="text-xs text-accent hover:underline">View as user</span>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-3 rounded-lg border border-border/60 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {user.name || user.email}
                </p>
                {user.role === 'ADMIN' && (
                  <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                )}
              </div>
              <p className="text-xs text-muted">{user.email}</p>
              {user.lastEventAt && (
                <p className="text-[11px] text-muted mt-1">
                  Last event {new Date(user.lastEventAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-surface-muted px-3 py-2">
                <p className="text-[11px] uppercase text-muted tracking-wide flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Events
                </p>
                <p className="text-lg font-semibold text-foreground">{user.eventCount}</p>
              </div>
              <div className="rounded-lg px-3 py-2 text-sm font-semibold">
                <div className="flex items-center gap-1 text-xs text-muted uppercase tracking-wide">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Risk
                </div>
                <p className={`inline-flex items-center gap-2 mt-1 px-2 py-1 rounded-full text-xs ${getRiskColor(user.totalRisk)}`}>
                  <span className="font-semibold text-foreground">{user.totalRisk}</span>
                  <span className="capitalize">{getRiskLevel(user.totalRisk)}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
