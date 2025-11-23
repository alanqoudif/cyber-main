"use client"

import { useEffect, useState } from 'react'
import { LocaleText } from '@/components/common/LocaleText'
import { Zap, BrainCircuit, Target, RotateCcw } from 'lucide-react'

interface GameStats {
  cluesRevealed: number
  decisionsMade: number
  drillsReset: number
  totalInteractions: number
}

const STORAGE_KEY = 'cyber_user_activity'

function getGameStats(): GameStats {
  if (typeof window === 'undefined') {
    return {
      cluesRevealed: 0,
      decisionsMade: 0,
      drillsReset: 0,
      totalInteractions: 0,
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.gameStats || {
        cluesRevealed: 0,
        decisionsMade: 0,
        drillsReset: 0,
        totalInteractions: 0,
      }
    }
  } catch (error) {
    console.error('Error reading game stats:', error)
  }

  return {
    cluesRevealed: 0,
    decisionsMade: 0,
    drillsReset: 0,
    totalInteractions: 0,
  }
}

export function LocalGameStats() {
  // Initialize with default values to avoid hydration mismatch
  const [stats, setStats] = useState<GameStats>({
    cluesRevealed: 0,
    decisionsMade: 0,
    drillsReset: 0,
    totalInteractions: 0,
  })

  useEffect(() => {
    // Load stats from localStorage on client side only
    setStats(getGameStats())
    
    // Listen for game stats updates
    const handleStatsUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setStats(event.detail)
      } else {
        setStats(getGameStats())
      }
    }

    window.addEventListener('cyber-game-stats-updated' as any, handleStatsUpdate as EventListener)

    // Update stats from storage periodically
    const updateInterval = setInterval(() => {
      setStats(getGameStats())
    }, 2000)

    return () => {
      window.removeEventListener('cyber-game-stats-updated' as any, handleStatsUpdate as EventListener)
      clearInterval(updateInterval)
    }
  }, [])

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative z-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-muted">
          <LocaleText en="Game Activity" ar="نشاط اللعبة" />
        </p>
        <p className="text-3xl font-semibold">{stats.totalInteractions}</p>
        <p className="text-xs text-purple-400">
          <LocaleText 
            en={`${stats.decisionsMade} decisions`} 
            ar={`${stats.decisionsMade} قرار`} 
          />
          {stats.cluesRevealed > 0 && (
            <span className="block mt-1">
              <LocaleText 
                en={`${stats.cluesRevealed} clues revealed`} 
                ar={`${stats.cluesRevealed} دليل تم الكشف عنه`} 
              />
            </span>
          )}
        </p>
      </div>
      {stats.totalInteractions > 0 && (
        <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-muted">
          <Zap className="h-3 w-3 text-purple-400" />
          <LocaleText en="Keep practicing!" ar="استمر في التدريب!" />
        </div>
      )}
    </div>
  )
}

