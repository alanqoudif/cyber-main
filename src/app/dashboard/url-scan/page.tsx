import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { LinksTool } from '@/components/user/LinksTool'

export default async function UrlScanPage() {
  const user = await requireAuth()

  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin/url-scan')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={user.role} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <LinksTool />
      </main>
    </div>
  )
}

