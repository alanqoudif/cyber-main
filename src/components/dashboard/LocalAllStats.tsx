"use client"

import { useEffect, useState } from 'react'
import { LocaleText } from '@/components/common/LocaleText'
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Search, Link2 } from 'lucide-react'
import { getLocalStats, updateLocalStats, type LocalStats } from '@/lib/local-stats'
import { getRiskLevel, getRiskColor } from '@/lib/risk-score'

export function LocalAllStats() {
  // Initialize with default values to avoid hydration mismatch
  const [stats, setStats] = useState<LocalStats>(() => {
    // Return default stats on server, will be updated on client
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
      phishingLinks: 0,
      phishingSubmissions: 0,
      urlScansStarted: 0,
      urlScansCompleted: 0,
      riskyUrlScans: 0,
      gameStats: {
        cluesRevealed: 0,
        decisionsMade: 0,
        drillsReset: 0,
        totalInteractions: 0,
      },
      riskLevel: 0,
      riskScores: [],
    }
  })

  useEffect(() => {
    // Load stats from localStorage on client side only
    setStats(getLocalStats())
    
    // Listen for stats updates
    const handleStatsUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setStats(event.detail)
      } else {
        setStats(getLocalStats())
      }
    }

    window.addEventListener('cyber-stats-updated' as any, handleStatsUpdate as EventListener)

    // Update stats from storage periodically
    const updateInterval = setInterval(() => {
      setStats(getLocalStats())
    }, 2000)

    return () => {
      window.removeEventListener('cyber-stats-updated' as any, handleStatsUpdate as EventListener)
      clearInterval(updateInterval)
    }
  }, [])

  const reportRate = stats.interactions > 0 
    ? Math.round((stats.reports / stats.interactions) * 100) 
    : 0

  const clickRate = stats.interactions > 0 
    ? Math.round((stats.riskyLinks / stats.interactions) * 100) 
    : 0

  const averageRisk = stats.riskScores.length > 0
    ? Math.round(stats.riskScores.reduce((sum, score) => sum + score, 0) / stats.riskScores.length)
    : stats.riskLevel

  const riskLevel = getRiskLevel(averageRisk)
  const riskColorClass = getRiskColor(averageRisk)

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Total interactions" ar="إجمالي التفاعلات" />
          </p>
          <p className="text-3xl font-semibold">{stats.interactions + stats.gameStats.totalInteractions}</p>
          {stats.interactions > 0 && (
            <p className="text-xs text-muted flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <LocaleText 
                en={`${stats.opens} opens / ${stats.reports} reports`} 
                ar={`${stats.opens} فتح / ${stats.reports} إبلاغ`} 
              />
            </p>
          )}
          {stats.gameStats.totalInteractions > 0 && (
            <p className="text-xs text-muted flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <LocaleText 
                en={`${stats.gameStats.totalInteractions} game interactions`} 
                ar={`${stats.gameStats.totalInteractions} تفاعل في اللعبة`} 
              />
            </p>
          )}
        </div>
        {stats.interactions > 0 && (
          <div className="relative z-10 mt-4">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                <LocaleText en="Report rate" ar="معدل الإبلاغ" />
              </span>
              <span className="font-semibold text-foreground">{reportRate}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-green-400" style={{ width: `${reportRate}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Confirmed reports" ar="بلاغات موثقة" />
          </p>
          <p className="text-3xl font-semibold">{stats.reports}</p>
          <p className="text-xs text-green-400">
            <LocaleText 
              en={`${reportRate}% of interactions`} 
              ar={`${reportRate}% من كل التفاعلات`} 
            />
          </p>
        </div>
        {stats.reports > 0 && (
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-muted">
            <CheckCircle2 className="h-3 w-3 text-green-400" />
            <LocaleText en="Great early warning" ar="إنذار مبكر ممتاز" />
          </div>
        )}
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/15 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Phishing Pages" ar="صفحات التصيد" />
          </p>
          <p className="text-3xl font-semibold">{stats.phishingLinks}</p>
          <p className="text-xs text-yellow-400">
            <LocaleText 
              en={`${stats.phishingVisits} visits`} 
              ar={`${stats.phishingVisits} زيارة`} 
            />
            {stats.phishingSubmissions > 0 && (
              <span className="block mt-1">
                <LocaleText 
                  en={`${stats.phishingSubmissions} submissions`} 
                  ar={`${stats.phishingSubmissions} إرسال`} 
                />
              </span>
            )}
          </p>
        </div>
        {stats.phishingLinks > 0 && (
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-muted">
            <Link2 className="h-3 w-3 text-yellow-400" />
            <LocaleText 
              en={`${stats.phishingLinks} active pages`} 
              ar={`${stats.phishingLinks} صفحة نشطة`} 
            />
          </div>
        )}
      </div>
      
      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="URL Scans" ar="فحوصات الروابط" />
          </p>
          <p className="text-3xl font-semibold">{stats.urlScansStarted}</p>
          <p className="text-xs text-blue-400">
            <LocaleText 
              en={`${stats.urlScansCompleted} completed`} 
              ar={`${stats.urlScansCompleted} مكتمل`} 
            />
            {stats.riskyUrlScans > 0 && (
              <span className="block mt-1 text-red-400">
                <LocaleText 
                  en={`${stats.riskyUrlScans} risky`} 
                  ar={`${stats.riskyUrlScans} خطير`} 
                />
              </span>
            )}
          </p>
        </div>
        {stats.urlScansStarted > 0 && (
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-muted">
            <Search className="h-3 w-3 text-blue-400" />
            <LocaleText 
              en={`${stats.riskyLinks} links clicked`} 
              ar={`${stats.riskyLinks} رابط تم النقر عليه`} 
            />
          </div>
        )}
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/15 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Links clicked" ar="روابط تم النقر عليها" />
          </p>
          <p className="text-3xl font-semibold">{stats.riskyLinks}</p>
          <p className="text-xs text-yellow-400">
            <LocaleText 
              en={`${clickRate}% of interactions`} 
              ar={`${clickRate}% من كل التفاعلات`} 
            />
          </p>
        </div>
        {stats.riskyLinks > 0 && (
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-muted">
            <AlertTriangle className="h-3 w-3 text-yellow-400" />
            <LocaleText en="Double down on upcoming coaching nudges" ar="ركّز على رسائل التوعية التالية" />
          </div>
        )}
      </div>

      <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            <LocaleText en="Risk level" ar="مستوى المخاطر" />
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold">{averageRisk}</p>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${riskColorClass}`}>
            <ShieldCheck className="h-3 w-3" />
            <LocaleText
              en={riskLevel === 'low' ? 'Low' : riskLevel === 'medium' ? 'Medium' : 'High'}
              ar={riskLevel === 'low' ? 'منخفض' : riskLevel === 'medium' ? 'متوسط' : 'عالي'}
            />
          </span>
        </div>
        {stats.riskScores.length > 0 && (
          <div className="relative z-10 mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft" style={{ width: `${Math.min((averageRisk / 20) * 100, 100)}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}

