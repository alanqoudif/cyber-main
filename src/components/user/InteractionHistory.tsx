import { Badge } from '@/components/ui/badge'
import { Mail, MousePointerClick, Flag, Eye } from 'lucide-react'
import { LocaleText } from '@/components/common/LocaleText'

export interface InteractionEntry {
  id: string
  type: 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE'
  created_at: string
  campaign?: string | null
  meta?: Record<string, unknown> | null
}

interface InteractionHistoryProps {
  events: InteractionEntry[]
}

const typeConfig = {
  OPEN: { icon: Eye, label: { en: 'Opened', ar: 'فتح' }, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  CLICK: { icon: MousePointerClick, label: { en: 'Clicked', ar: 'نقر' }, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  REPORT: { icon: Flag, label: { en: 'Reported', ar: 'إبلاغ' }, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  IGNORE: { icon: Mail, label: { en: 'Ignored', ar: 'تجاهل' }, color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
}

export function InteractionHistory({ events }: InteractionHistoryProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-surface-muted p-4 mb-4">
          <Mail className="h-6 w-6 text-muted" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          <LocaleText en="No interactions yet" ar="لا توجد تفاعلات بعد" />
        </p>
        <p className="text-xs text-muted">
          <LocaleText en="Start using the simulation to see your history here" ar="ابدأ باستخدام المحاكاة لرؤية تفاعلاتك هنا" />
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const config = typeConfig[event.type]
        const Icon = config.icon
        const timeAgo = getTimeAgo(new Date(event.created_at))

        return (
          <div
            key={event.id}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 p-4 hover:bg-surface hover:shadow-sm transition-all"
          >
            <div className={`flex-shrink-0 rounded-lg border p-2 ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {event.campaign || <LocaleText en="Security drill" ar="تدريب أمني" />}
              </p>
              <p className="text-xs text-muted mt-0.5">
                <LocaleText en={timeAgo.en} ar={timeAgo.ar} />
              </p>
            </div>
            <Badge type={event.type} className="flex-shrink-0">
              <LocaleText en={config.label.en} ar={config.label.ar} />
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

type LocalizedTime = { en: string; ar: string }

function getTimeAgo(date: Date): LocalizedTime {
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
