import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { CampaignForm } from '@/components/campaigns/CampaignForm'

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, recipients(*)')
    .eq('id', params.id)
    .single()

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userRole="ADMIN" />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Campaign not found</h2>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="ADMIN" />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Edit Campaign</h1>
          <p className="mt-2 text-muted">Update campaign details and recipients</p>
        </div>
        <CampaignForm campaignId={params.id} initialData={campaign} />
      </main>
    </div>
  )
}

