'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, LayoutDashboard, Megaphone, Users, BookOpen, Globe } from 'lucide-react'

interface NavbarProps {
  userRole?: 'ADMIN' | 'USER'
}

export function Navbar({ userRole = 'USER' }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-lg font-semibold text-foreground">CyberMirror</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard') && !pathname?.includes('/admin')
                    ? 'bg-accent/12 text-accent'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted'
                }`}
              >
                Dashboard
              </Link>

              {userRole === 'ADMIN' && (
                <>
                  <Link
                    href="/dashboard/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard/admin')
                        ? 'bg-accent/12 text-accent'
                        : 'text-muted hover:text-foreground hover:bg-surface-muted'
                    }`}
                  >
                    Admin
                  </Link>
                  <Link
                    href="/campaigns"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/campaigns')
                        ? 'bg-accent/12 text-accent'
                        : 'text-muted hover:text-foreground hover:bg-surface-muted'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="h-4 w-4" />
                      Campaigns
                    </div>
                  </Link>
                </>
              )}

              <Link
                href="/learn"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/learn')
                    ? 'bg-accent/12 text-accent'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Learn
                </div>
              </Link>

              <Link
                href="/dashboard/threat-map"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard/threat-map')
                    ? 'bg-accent/12 text-accent'
                    : 'text-muted hover:text-foreground hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  Threat Map
                </div>
              </Link>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

