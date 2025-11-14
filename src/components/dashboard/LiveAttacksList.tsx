'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

interface Attack {
  id: string
  type: string
  timestamp: string
  source: string
  destination: string
  category: 'malware' | 'phishing' | 'exploit' | 'other'
}

interface LiveAttacksListProps {
  initialAttacks: Attack[]
  initialRate: number
}

export function LiveAttacksList({ initialAttacks, initialRate }: LiveAttacksListProps) {
  const [attacks, setAttacks] = useState<Attack[]>(initialAttacks)
  const [currentRate, setCurrentRate] = useState(initialRate)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const fetchAttacks = async () => {
      setIsRefreshing(true)
      try {
        const response = await fetch('/api/threat-map/attacks', {
          cache: 'no-store', // Always fetch fresh data
        })
        if (response.ok) {
          const data = await response.json()
          setAttacks(data.attacks || [])
          setCurrentRate(data.currentRate || 4)
        }
      } catch (error) {
        console.error('Error fetching attacks:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Refresh immediately on mount
    fetchAttacks()
    
    // Refresh every 500ms (0.5 seconds) for ultra-fast real-time updates
    const interval = setInterval(fetchAttacks, 500)
    return () => clearInterval(interval)
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'phishing':
        return 'bg-purple-500'
      case 'malware':
        return 'bg-red-500'
      case 'exploit':
        return 'bg-orange-500'
      default:
        return 'bg-orange-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ATTACKS</CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetch('/api/threat-map/attacks', { cache: 'no-store' })
                  .then(res => res.json())
                  .then(data => {
                    setAttacks(data.attacks || [])
                    setCurrentRate(data.currentRate || 4)
                  })
                  .catch(console.error)
              }}
              disabled={isRefreshing}
              className="p-1 hover:bg-surface-muted rounded transition-colors"
              aria-label="Refresh attacks"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Current rate</span>
              <span className="font-bold text-red-500 text-lg animate-pulse">{currentRate}</span>
              <span className="text-muted text-xs">/sec</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
          {attacks.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">No attacks detected</p>
          ) : (
            attacks.map((attack, index) => (
              <div
                key={attack.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-muted transition-all duration-200 animate-in fade-in slide-in-from-right"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(attack.category)} mt-1 flex-shrink-0 relative`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(attack.category)} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attack.type}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                    <span>{attack.timestamp}</span>
                    <span>•</span>
                    <span className="truncate">
                      {attack.source} → {attack.destination}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

