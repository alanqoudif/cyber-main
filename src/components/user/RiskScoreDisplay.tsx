import { getRiskColor, getRiskLevel } from '@/lib/risk-score'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LocaleText } from '@/components/common/LocaleText'

export interface RiskScoreEntry {
  id: string
  campaign?: string | null
  score: number
  updated_at: string
}

interface RiskScoreDisplayProps {
  scores: RiskScoreEntry[]
}

type LocalizedValue = { en: string; ar: string }

export function RiskScoreDisplay({ scores }: RiskScoreDisplayProps) {
  const total = scores.reduce((sum, score) => sum + score.score, 0)
  const average = scores.length > 0 ? Math.round(total / scores.length) : 0
  const palette = getRiskColor(average)
  const riskLevel = getRiskLevel(average)

  const getRiskMessage = (level: 'low' | 'medium' | 'high'): LocalizedValue => {
    switch (level) {
      case 'low':
        return {
          en: 'Great job! You are keeping your activity secure.',
          ar: 'ممتاز! أنت تقوم بعمل رائع في الحفاظ على أمانك.',
        }
      case 'medium':
        return {
          en: 'Stay alert. Keep reporting suspicious notes.',
          ar: 'كن حذراً. استمر في الإبلاغ عن الرسائل المشبوهة.',
        }
      case 'high':
        return {
          en: 'High risk. Revisit the guidance below and tighten your habits.',
          ar: 'مستوى خطر عالي. راجع الإرشادات أدناه وتحسن من عاداتك الأمنية.',
        }
    }
  }

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <TrendingDown className="h-5 w-5" />
      case 'medium':
        return <Minus className="h-5 w-5" />
      case 'high':
        return <TrendingUp className="h-5 w-5" />
    }
  }

  if (scores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-surface-muted p-4 mb-4">
          <TrendingUp className="h-6 w-6 text-muted" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          <LocaleText en="No risk data yet" ar="لا توجد بيانات مخاطر بعد" />
        </p>
        <p className="text-xs text-muted">
          <LocaleText en="Results will appear after you interact with the simulations" ar="ستظهر نتائج تقييم المخاطر هنا بعد التفاعل مع المحاكاة" />
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Average Risk Card */}
      <div className={`relative overflow-hidden rounded-xl border px-5 py-4 ${palette}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted mb-1">
              <LocaleText en="Average risk level" ar="متوسط مستوى المخاطر" />
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{average}</p>
              <span className="text-xs font-medium capitalize">
                <LocaleText
                  en={riskLevel === 'low' ? 'low' : riskLevel === 'medium' ? 'medium' : 'high'}
                  ar={riskLevel === 'low' ? 'منخفض' : riskLevel === 'medium' ? 'متوسط' : 'عالي'}
                />
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {getRiskIcon(riskLevel)}
          </div>
        </div>
        <div className="w-full bg-surface-muted/50 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${palette}`}
            style={{ width: `${Math.min((average / 20) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted leading-relaxed">
          {(() => {
            const msg = getRiskMessage(riskLevel)
            return <LocaleText en={msg.en} ar={msg.ar} />
          })()}
        </p>
      </div>

      {/* Individual Scores */}
      <div className="space-y-2">
        {scores.map((score, index) => {
          const scoreLevel = getRiskLevel(score.score)
          const scoreColor = getRiskColor(score.score)
          const timeAgo = getTimeAgo(new Date(score.updated_at))
          
          // Extract colors from the palette string
          const colorParts = scoreColor.split(' ')
          const bgColor = colorParts[0] || 'bg-gray-500/10'
          const textColor = colorParts[1] || 'text-gray-600'

          return (
            <div
              key={score.id}
              className="group flex items-center justify-between rounded-xl border border-border/60 bg-surface/60 p-4 hover:bg-surface hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted">#{index + 1}</span>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {score.campaign || <LocaleText en="Training campaign" ar="حملة تدريبية" />}
                  </p>
                </div>
                <p className="text-xs text-muted">
                  <LocaleText en={timeAgo.en} ar={timeAgo.ar} />
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-lg font-bold ${textColor}`}>
                    {score.score}
                  </p>
                  <p className="text-xs text-muted capitalize">
                    <LocaleText
                      en={scoreLevel === 'low' ? 'low' : scoreLevel === 'medium' ? 'medium' : 'high'}
                      ar={scoreLevel === 'low' ? 'منخفض' : scoreLevel === 'medium' ? 'متوسط' : 'عالي'}
                    />
                  </p>
                </div>
                <div className={`w-1 h-12 rounded-full ${bgColor}`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): LocalizedValue {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return { en: 'now', ar: 'الآن' }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return { en: `${minutes} min ago`, ar: `منذ ${minutes} دقيقة` }
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return { en: `${hours}h ago`, ar: `منذ ${hours} ساعة` }
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return { en: `${days}d ago`, ar: `منذ ${days} يوم` }
  }
  
  return {
    en: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    ar: date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }),
  }
}
