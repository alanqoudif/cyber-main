"use client"

import { useEffect, useState } from 'react'
import { LocaleText } from '@/components/common/LocaleText'
import { Clock, MousePointerClick, Eye, TrendingUp, Calendar } from 'lucide-react'

interface UserActivityStats {
  pageViews: number
  sessionTime: number // in minutes
  clicksCount: number
  lastActivity: string | null
  daysActive: number
  // Interaction stats (local cache)
  interactions: number
  opens: number
  reports: number
  riskyLinks: number
  phishingVisits: number
  riskLevel: number
}

const STORAGE_KEY = 'cyber_user_activity'

function getStoredStats(): UserActivityStats {
  if (typeof window === 'undefined') {
    return {
      pageViews: 0,
      sessionTime: 0,
      clicksCount: 0,
      lastActivity: null,
      daysActive: 0,
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        pageViews: parsed.pageViews || 0,
        sessionTime: parsed.sessionTime || 0,
        clicksCount: parsed.clicksCount || 0,
        lastActivity: parsed.lastActivity || null,
        daysActive: parsed.daysActive || 0,
        interactions: parsed.interactions || 0,
        opens: parsed.opens || 0,
        reports: parsed.reports || 0,
        riskyLinks: parsed.riskyLinks || 0,
        phishingVisits: parsed.phishingVisits || 0,
        riskLevel: parsed.riskLevel || 0,
      }
    }
  } catch (error) {
    console.error('Error reading user activity stats:', error)
  }

  return {
    pageViews: 0,
    sessionTime: 0,
    clicksCount: 0,
    lastActivity: null,
    daysActive: 0,
    interactions: 0,
    opens: 0,
    reports: 0,
    riskyLinks: 0,
    phishingVisits: 0,
    riskLevel: 0,
  }
}

function saveStats(stats: UserActivityStats) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error('Error saving user activity stats:', error)
  }
}

function updateStats(updates: Partial<UserActivityStats>) {
  const current = getStoredStats()
  const updated = { ...current, ...updates }
  saveStats(updated)
  return updated
}

export function UserActivityStats() {
  // Initialize with default values to avoid hydration mismatch
  const [stats, setStats] = useState<UserActivityStats>({
    pageViews: 0,
    sessionTime: 0,
    clicksCount: 0,
    lastActivity: null,
    daysActive: 0,
    interactions: 0,
    opens: 0,
    reports: 0,
    riskyLinks: 0,
    phishingVisits: 0,
    riskLevel: 0,
  })
  const [sessionStartTime] = useState(() => Date.now())
  const [currentSessionMinutes, setCurrentSessionMinutes] = useState(0)

  useEffect(() => {
    // Load stats from localStorage on client side only
    const current = getStoredStats()
    setStats(current)
    
    // Increment page view
    const updated = updateStats({
      pageViews: current.pageViews + 1,
      lastActivity: new Date().toISOString(),
    })
    setStats(updated)

    // Track clicks
    const handleClick = () => {
      const current = getStoredStats()
      const updated = updateStats({
        clicksCount: current.clicksCount + 1,
        lastActivity: new Date().toISOString(),
      })
      setStats(updated)
    }

    // Track days active - check if this is a new day
    const today = new Date().toISOString().split('T')[0]
    const stored = getStoredStats()
    const lastTrackedDate = localStorage.getItem('cyber_last_tracked_date')
    
    if (lastTrackedDate !== today) {
      // New day - increment days active
      const updated = updateStats({
        daysActive: stored.daysActive + 1,
      })
      setStats(updated)
      localStorage.setItem('cyber_last_tracked_date', today)
    } else if (!lastTrackedDate) {
      // First time - set to 1
      const updated = updateStats({
        daysActive: 1,
      })
      setStats(updated)
      localStorage.setItem('cyber_last_tracked_date', today)
    }

    document.addEventListener('click', handleClick)

    // Update session time every 30 seconds (for display)
    const sessionInterval = setInterval(() => {
      const sessionMinutes = (Date.now() - sessionStartTime) / 60000
      setCurrentSessionMinutes(sessionMinutes)
    }, 30000) // Update every 30 seconds for display

    // Save session time on page unload
    const handleBeforeUnload = () => {
      const sessionMinutes = (Date.now() - sessionStartTime) / 60000
      const current = getStoredStats()
      const totalSessionTime = current.sessionTime + sessionMinutes
      saveStats({ ...current, sessionTime: totalSessionTime })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('click', handleClick)
      clearInterval(sessionInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Final save - add this session's time to stored time
      const sessionMinutes = (Date.now() - sessionStartTime) / 60000
      const current = getStoredStats()
      const totalSessionTime = current.sessionTime + sessionMinutes
      saveStats({ ...current, sessionTime: totalSessionTime })
    }
  }, [])

  const formatLastActivity = (isoString: string | null) => {
    if (!isoString) return null
    
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    
    const diffDays = Math.floor(diffHours / 24)
    return `منذ ${diffDays} يوم`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Page Views" ar="مشاهدات الصفحة" />
          </p>
          <p className="text-3xl font-semibold">{stats.pageViews}</p>
          <p className="text-xs text-muted flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <LocaleText en="Total visits" ar="إجمالي الزيارات" />
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Session Time" ar="وقت الجلسة" />
          </p>
          <p className="text-3xl font-semibold">{Math.round(stats.sessionTime + currentSessionMinutes)}</p>
          <p className="text-xs text-muted flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <LocaleText en="Minutes" ar="دقيقة" />
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Clicks" ar="النقرات" />
          </p>
          <p className="text-3xl font-semibold">{stats.clicksCount}</p>
          <p className="text-xs text-muted flex items-center gap-1">
            <MousePointerClick className="h-3 w-3" />
            <LocaleText en="Total clicks" ar="إجمالي النقرات" />
          </p>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Days Active" ar="أيام النشاط" />
          </p>
          <p className="text-3xl font-semibold">{stats.daysActive}</p>
          <p className="text-xs text-muted flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {stats.lastActivity && (
              <span>
                <LocaleText 
                  en={`Last: ${formatLastActivity(stats.lastActivity) || 'Never'}`}
                  ar={`آخر: ${formatLastActivity(stats.lastActivity) || 'أبداً'}`}
                />
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

