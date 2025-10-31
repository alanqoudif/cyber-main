import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

interface PersonalizedTipsProps {
  riskScore: number
  recentClicks: number
  recentReports: number
}

export function PersonalizedTips({ riskScore, recentClicks, recentReports }: PersonalizedTipsProps) {
  const tips = buildTips(riskScore, recentClicks, recentReports)

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-accent" />
        <CardTitle>Personalized Guidance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="rounded-lg bg-surface-muted p-3">
            <p className="text-sm font-medium text-foreground">{tip.title}</p>
            <p className="text-xs text-muted mt-1">{tip.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function buildTips(riskScore: number, recentClicks: number, recentReports: number) {
  const tips: Array<{ title: string; description: string }> = []

  if (recentClicks > 0) {
    tips.push({
      title: 'Double-check links before you click',
      description:
        'Hover over links to reveal the full URL and make sure it matches the sender domain you expect. When unsure, open the site directly in a new tab.',
    })
  }

  if (riskScore > 10) {
    tips.push({
      title: 'Enroll in the phishing refresher lesson',
      description:
        'Revisit the “Recognizing Red Flags” module to reinforce spotting urgent or threatening language commonly used in phishing attempts.',
    })
  }

  if (recentReports === 0) {
    tips.push({
      title: 'Report suspicious emails',
      description:
        'Even if you ignore an email, take a moment to report it. This alerts the security team and helps protect your colleagues.',
    })
  }

  if (tips.length === 0) {
    tips.push({
      title: 'Great job staying vigilant!',
      description:
        'Keep verifying senders, use strong passwords, and continue reporting anything suspicious. Your diligence keeps the organization safe.',
    })
  }

  return tips
}
