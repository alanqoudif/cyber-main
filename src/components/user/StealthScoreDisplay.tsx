'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingDown, Shield, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePreferences } from '@/context/preferences-context'

interface StealthScoreData {
  totalInjections: number
  clickedCount: number
  openedCount: number
  ignoredCount: number
  reportedCount: number
  pendingCount: number
  stealthScore: number
  stealthPercentage: number
  avgRating: number
  level: 'excellent' | 'good' | 'needs_improvement' | 'poor'
  message: string
  recentActivity: {
    total: number
    clicked: number
    opened: number
  }
  breakdown: {
    clicked: number
    opened: number
    ignored: number
    reported: number
  }
}

export function StealthScoreDisplay() {
  const [data, setData] = useState<StealthScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const { locale } = usePreferences()

  const copy = {
    en: {
      emptyTitle: 'No data yet',
      emptySubtitle: 'Your stealth score will appear after you interact with injections.',
      headerTitle: 'Stealth score',
      headerSubtitle: 'How many traps caught you off guard',
      percentSuffix: 'of injections',
      stats: {
        clicked: 'Clicked',
        opened: 'Opened',
        reported: 'Reported',
        ignored: 'Ignored',
      },
      recentTitle: 'Recent activity (7 days)',
      recentSummary: (count: number) => `${count} fell for traps`,
      recentOf: 'of',
      recentTotal: (total: number) => `${total} injections`,
      totalLabel: 'Total injected threats',
      levels: {
        excellent: 'Excellent',
        good: 'Good',
        needs_improvement: 'Needs improvement',
        poor: 'Weak',
        default: 'N/A',
      },
    },
    ar: {
      emptyTitle: 'لا توجد بيانات بعد',
      emptySubtitle: 'سيظهر سكور "بدون ما تحس" هنا بعد التفاعل مع الثغرات.',
      headerTitle: 'سكور "بدون ما تحس"',
      headerSubtitle: 'كم مرة وقعت في الفخاخ بدون ما تحس',
      percentSuffix: 'من الثغرات',
      stats: {
        clicked: 'نقرت على',
        opened: 'فتحت',
        reported: 'أبلغت',
        ignored: 'تجاهلت',
      },
      recentTitle: 'النشاط الأخير (7 أيام)',
      recentSummary: (count: number) => `${count} وقعت في الفخ`,
      recentOf: 'من',
      recentTotal: (total: number) => `${total} ثغرة`,
      totalLabel: 'إجمالي الثغرات المحقونة',
      levels: {
        excellent: 'ممتاز',
        good: 'جيد',
        needs_improvement: 'يحتاج تحسين',
        poor: 'ضعيف',
        default: 'غير محدد',
      },
    },
  }[locale]

  useEffect(() => {
    fetchStealthScore()
  }, [])

  const fetchStealthScore = async () => {
    try {
      const res = await fetch('/api/vulnerability/stealth-score')
      const scoreData = await res.json()
      setData(scoreData)
    } catch (error) {
      console.error('Error fetching stealth score:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-surface-muted rounded w-1/3"></div>
          <div className="h-8 bg-surface-muted rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (!data || data.totalInjections === 0) {
    return (
      <Card className="p-6 border-2 border-border/60">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-surface-muted p-4 mb-4">
            <EyeOff className="h-6 w-6 text-muted" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">{copy.emptyTitle}</p>
          <p className="text-xs text-muted">{copy.emptySubtitle}</p>
        </div>
      </Card>
    )
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'good':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'needs_improvement':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'poor':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  return (
    <Card className="p-6 border-2 border-border/60 bg-gradient-to-br from-surface to-surface-muted/50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="h-5 w-5 text-muted" />
              <h3 className="text-lg font-bold text-foreground">{copy.headerTitle}</h3>
            </div>
            <p className="text-xs text-muted">{copy.headerSubtitle}</p>
          </div>
          <Badge className={getLevelColor(data.level)}>
            {copy.levels[data.level as keyof typeof copy.levels] ?? copy.levels.default}
          </Badge>
        </div>

        {/* Main Score */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {data.stealthScore}%
            </span>
            <span className="text-sm text-muted">{copy.percentSuffix}</span>
          </div>
          <div className="w-full bg-surface-muted/50 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                data.stealthScore < 15
                  ? 'bg-green-500'
                  : data.stealthScore < 30
                  ? 'bg-blue-500'
                  : data.stealthScore < 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(data.stealthScore, 100)}%` }}
            />
          </div>
          <p className="text-sm text-foreground leading-relaxed">{data.message}</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted">{copy.stats.clicked}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.clickedCount}</p>
            <p className="text-xs text-muted">{data.breakdown.clicked}%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-muted">{copy.stats.opened}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.openedCount}</p>
            <p className="text-xs text-muted">{data.breakdown.opened}%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted">{copy.stats.reported}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.reportedCount}</p>
            <p className="text-xs text-muted">{data.breakdown.reported}%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted">{copy.stats.ignored}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{data.ignoredCount}</p>
            <p className="text-xs text-muted">{data.breakdown.ignored}%</p>
          </div>
        </div>

        {/* Recent Activity */}
        {data.recentActivity.total > 0 && (
          <div className="pt-4 border-t border-border/40">
            <p className="text-xs font-medium text-muted mb-2">{copy.recentTitle}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-foreground">
                {copy.recentSummary(data.recentActivity.clicked + data.recentActivity.opened)}
              </span>
              <span className="text-muted">{copy.recentOf}</span>
              <span className="text-foreground font-semibold">
                {copy.recentTotal(data.recentActivity.total)}
              </span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t border-border/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{copy.totalLabel}</span>
            <span className="font-semibold text-foreground">{data.totalInjections}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
