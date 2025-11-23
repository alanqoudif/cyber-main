"use client"

import { useEffect, useState } from 'react'
import { LocaleText } from '@/components/common/LocaleText'
import { Eye, Clock, MousePointerClick } from 'lucide-react'
import { incrementInteraction } from '@/lib/local-stats'

interface UserActivityStats {
  pageViews: number
  sessionTime: number
  clicksCount: number
  lastActivity: string | null
  daysActive: number
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
  }
}

export function LocalInteractionStats() {
  // Initialize with default values to avoid hydration mismatch
  const [stats, setStats] = useState<UserActivityStats>({
    pageViews: 0,
    sessionTime: 0,
    clicksCount: 0,
    lastActivity: null,
    daysActive: 0,
  })
  const [sessionStartTime] = useState(() => Date.now())
  const [currentSessionMinutes, setCurrentSessionMinutes] = useState(0)

  useEffect(() => {
    // Load stats from localStorage on client side only
    setStats(getStoredStats())
    
    // Listen for stats updates
    const handleStatsUpdate = () => {
      setStats(getStoredStats())
    }

    window.addEventListener('cyber-stats-updated' as any, handleStatsUpdate)

    // Update session time every 30 seconds (for display)
    const sessionInterval = setInterval(() => {
      const sessionMinutes = (Date.now() - sessionStartTime) / 60000
      setCurrentSessionMinutes(sessionMinutes)
    }, 30000)

    // Update stats from storage periodically
    const updateInterval = setInterval(() => {
      setStats(getStoredStats())
    }, 2000)

    return () => {
      window.removeEventListener('cyber-stats-updated' as any, handleStatsUpdate)
      clearInterval(sessionInterval)
      clearInterval(updateInterval)
    }
  }, [])

  return (
    <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-xl">
      <div className="rounded-2xl border border-border/50 bg-surface/70 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">
          <LocaleText en="Page Views" ar="مشاهدات الصفحة" />
        </p>
        <p className="mt-2 text-3xl font-semibold">{stats.pageViews}</p>
        <p className="text-xs text-muted flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <LocaleText en="Total visits" ar="إجمالي الزيارات" />
        </p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-surface/70 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">
          <LocaleText en="Session Time" ar="وقت الجلسة" />
        </p>
        <p className="mt-2 text-3xl font-semibold">{Math.round(stats.sessionTime + currentSessionMinutes)}</p>
        <p className="text-xs text-muted flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <LocaleText en="Minutes" ar="دقيقة" />
        </p>
      </div>
      <div className="rounded-2xl border border-border/50 bg-surface/70 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">
          <LocaleText en="Clicks" ar="النقرات" />
        </p>
        <p className="mt-2 text-3xl font-semibold">{stats.clicksCount}</p>
        <p className="text-xs text-muted flex items-center gap-1">
          <MousePointerClick className="h-3 w-3" />
          <LocaleText en="Total clicks" ar="إجمالي النقرات" />
        </p>
      </div>
    </div>
  )
}

// Helper functions to trigger events from other components
export function trackLocalInteraction(type: 'OPEN' | 'REPORT' | 'CLICK' | 'PHISHING_VISIT') {
  if (typeof window !== 'undefined') {
    if (type === 'PHISHING_VISIT') {
      const { incrementPhishingVisit } = require('@/lib/local-stats')
      incrementPhishingVisit()
    } else {
      incrementInteraction(type as 'OPEN' | 'REPORT' | 'CLICK')
    }
  }
}

export function updateLocalRiskLevel(riskLevel: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cyber-risk-update', { detail: { riskLevel } }))
  }
}

