import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { AIChat } from '@/components/ai/AIChat'

export default async function AIChatPage() {
  const user = await requireAuth()

  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin')
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar userRole={user.role} />
      <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AIChat />
      </main>
    </div>
  )
}

