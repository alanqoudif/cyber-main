import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { GameClient } from './GameClient'

export default async function CyberGamePage() {
  const user = await requireAuth()

  if (!user) {
    redirect('/auth/login')
  }

  return <GameClient />
}
