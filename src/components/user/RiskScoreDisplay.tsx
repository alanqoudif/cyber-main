import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getRiskColor, getRiskLevel } from '@/lib/risk-score'
import { TrendingUp } from 'lucide-react'

export interface RiskScoreEntry {
  id: string
  campaign?: string | null
  score: number
  updated_at: string
}

interface RiskScoreDisplayProps {
  scores: RiskScoreEntry[]
}

export function RiskScoreDisplay({ scores }: RiskScoreDisplayProps) {
  const total = scores.reduce((sum, score) => sum + score.score, 0)
  const average = scores.length > 0 ? Math.round(total / scores.length) : 0
  const palette = getRiskColor(average)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`rounded-lg px-4 py-3 ${palette}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Average Score</p>
              <p className="text-2xl font-semibold text-foreground">{average}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-foreground/70" />
          </div>
          <p className="text-xs mt-2 text-muted">
            {average === 0
              ? 'No risk detected. Keep practicing secure habits!'
              : average > 10
                ? 'High risk detected. Review the guidance below.'
                : 'Moderate risk. Stay vigilant and keep reporting suspicious emails.'}
          </p>
        </div>

        <div className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">
                  {score.campaign || 'Campaign'}
                </p>
                <p className="text-xs text-muted">
                  Updated {new Date(score.updated_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getRiskColor(score.score)}`}>
                {score.score}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
