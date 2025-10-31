import { requireAdmin } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { CampaignForm } from '@/components/campaigns/CampaignForm'

export default async function NewCampaignPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="ADMIN" />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Create New Campaign</h1>
          <p className="mt-2 text-muted">Set up a new phishing simulation campaign</p>
        </div>
        <CampaignForm />
      </main>
    </div>
  )
}

