'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, TrendingUp } from 'lucide-react'

interface ThreatData {
  total: number
  attacks: number
  malware: number
  phishing: number
  riskScore: number
  lastUpdate: string
}

interface ThreatMapStatsProps {
  initialData: ThreatData
}

export function ThreatMapStats({ initialData }: ThreatMapStatsProps) {
  const [data, setData] = useState<ThreatData>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Update immediately on mount
    const updateData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/threat-map/data', {
          cache: 'no-store', // Always fetch fresh data
        })
        if (response.ok) {
          const newData = await response.json()
          setData(newData)
        }
      } catch (error) {
        console.error('Error fetching threat data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    updateData()
    
    // Update every 2 seconds for fast real-time updates
    const interval = setInterval(updateData, 2000)

    return () => clearInterval(interval)
  }, [])

  const stats = {
    total: data.total || 0,
    malware: data.malware || 0,
    phishing: data.phishing || 0,
    attacks: data.attacks || 0,
  }

  const avgRiskScore = data.riskScore || 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Threat Activity</CardTitle>
          <p className="text-xs text-muted mt-1">
            Data from CheckPoint Threat Map
            {isLoading && <span className="ml-2 text-blue-500">(Updating...)</span>}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted">Total Events</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {stats.total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-green-500" />
                <span className="text-sm text-muted">Malware</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {stats.malware.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-yellow-500" />
                <span className="text-sm text-muted">Phishing</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {stats.phishing.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500" />
                <span className="text-sm text-muted">Other Attacks</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {stats.attacks.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Average Risk Score</span>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    avgRiskScore > 70
                      ? 'bg-red-500'
                      : avgRiskScore > 50
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((avgRiskScore / 100) * 100, 100)}%` }}
                />
              </div>
              <p className="text-2xl font-semibold text-foreground mt-2">{avgRiskScore}</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted">
                Global threat risk score based on CheckPoint Threat Map intelligence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

