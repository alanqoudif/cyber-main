export type EventType = 'OPEN' | 'CLICK' | 'REPORT' | 'IGNORE'

const EVENT_WEIGHTS: Record<EventType, number> = {
  CLICK: 5,
  OPEN: 1,
  REPORT: -4,
  IGNORE: 0,
}

export function computeRiskScore(events: { type: EventType }[]): number {
  return events.reduce((acc, event) => {
    const weight = EVENT_WEIGHTS[event.type] || 0
    return acc + weight
  }, 0)
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 0) return 'low'
  if (score <= 10) return 'medium'
  return 'high'
}

export function getRiskColor(score: number): string {
  const level = getRiskLevel(score)
  switch (level) {
    case 'low':
      return 'bg-green-500/10 text-green-600'
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-600'
    case 'high':
      return 'bg-red-500/10 text-red-600'
  }
}

