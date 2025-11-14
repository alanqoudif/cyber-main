'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Megaphone, Globe, Search, Gamepad2, Activity } from 'lucide-react'
import { usePreferences } from '@/context/preferences-context'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LanguageToggle } from '@/components/layout/LanguageToggle'

interface NavbarProps {
  userRole?: 'ADMIN' | 'USER'
}

const copy = {
  en: {
    brand: {
      eyebrow: 'CyberMirror',
      title: 'Command'
    },
    overview: 'Overview',
    admin: 'Admin',
    campaigns: 'Campaigns',
    scanner: 'Scanner',
    threatMap: 'Threat Map',
    cyberGame: 'Cyber Game',
    quickScan: 'Quick Scan',
    signOut: 'Sign out'
  },
  ar: {
    brand: {
      eyebrow: 'سايبر ميرور',
      title: 'لوحة التحكم'
    },
    overview: 'نظرة عامة',
    admin: 'المسؤول',
    campaigns: 'الحملات',
    scanner: 'أداة الفحص',
    threatMap: 'خريطة التهديدات',
    cyberGame: 'لعبة السايبر',
    quickScan: 'فحص سريع',
    signOut: 'تسجيل الخروج'
  }
}

export function Navbar({ userRole = 'USER' }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { locale } = usePreferences()
  const t = copy[locale]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

  const sharedLinkStyles = (path: string) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'border-accent/40 bg-accent/15 text-foreground'
        : 'border-transparent text-muted hover:text-foreground hover:bg-surface-muted/80'
    }`

  return (
    <nav className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-2xl bg-accent/20 p-2">
                <Shield className="h-4 w-4 text-accent" />
              </span>
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.4em] text-muted">{t.brand.eyebrow}</p>
                <p className="text-base font-semibold text-foreground">{t.brand.title}</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard" className={sharedLinkStyles('/dashboard')}>
                {t.overview}
              </Link>
              {userRole === 'ADMIN' && (
                <>
                  <Link href="/dashboard/admin" className={sharedLinkStyles('/dashboard/admin')}>
                    {t.admin}
                  </Link>
                  <Link href="/campaigns" className={sharedLinkStyles('/campaigns')}>
                    <Megaphone className="h-4 w-4" />
                    {t.campaigns}
                  </Link>
                  <Link href="/dashboard/admin/url-scan" className={sharedLinkStyles('/dashboard/admin/url-scan')}>
                    <Search className="h-4 w-4" />
                    {t.scanner}
                  </Link>
                </>
              )}
              <Link href="/dashboard/threat-map" className={sharedLinkStyles('/dashboard/threat-map')}>
                <Globe className="h-4 w-4" />
                {t.threatMap}
              </Link>
              <Link href="/dashboard/cyber-game" className={sharedLinkStyles('/dashboard/cyber-game')}>
                <Gamepad2 className="h-4 w-4" />
                {t.cyberGame}
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <LanguageToggle size="compact" />
            <ThemeToggle variant="icon" />
            <Link
              href={userRole === 'ADMIN' ? '/dashboard/admin/url-scan' : '/dashboard/url-scan'}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/70 px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground"
            >
              <Activity className="h-3.5 w-3.5" />
              {t.quickScan}
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t.signOut}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
