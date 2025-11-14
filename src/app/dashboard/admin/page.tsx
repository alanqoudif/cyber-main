import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { GophishSimulator } from '@/components/admin/GophishSimulator'
import { BarChart3, Users } from 'lucide-react'

export default async function AdminDashboardPage() {
  const user = await requireAdmin()
  const supabase = await createClient()

  const [{ count: campaignsCount }, { count: usersCount }] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={user.role} />
      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Simplified Header with Quick Stats */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Phishing Simulator</h1>
            <p className="mt-1 text-sm text-muted">
              Create and manage phishing simulation campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted" />
                <span className="text-foreground font-medium">{campaignsCount ?? 0}</span>
                <span className="text-muted">Campaigns</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted" />
                <span className="text-foreground font-medium">{usersCount ?? 0}</span>
                <span className="text-muted">Users</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Simulator - Now the primary focus */}
        <GophishSimulator />
      </main>
    </div>
  )
}

