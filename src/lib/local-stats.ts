"use client"

const STORAGE_KEY = 'cyber_user_activity'

export interface LocalStats {
  // User activity
  pageViews: number
  sessionTime: number
  clicksCount: number
  lastActivity: string | null
  daysActive: number
  
  // Interactions
  interactions: number
  opens: number
  reports: number
  riskyLinks: number
  
  // Phishing
  phishingVisits: number
  phishingLinks: number
  phishingSubmissions: number
  
  // URL Scans
  urlScansStarted: number
  urlScansCompleted: number
  riskyUrlScans: number
  
  // Game
  gameStats: {
    cluesRevealed: number
    decisionsMade: number
    drillsReset: number
    totalInteractions: number
  }
  
  // Risk
  riskLevel: number
  riskScores: number[]
}

export function getLocalStats(): LocalStats {
  if (typeof window === 'undefined') {
    return getDefaultStats()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        pageViews: parsed.pageViews || 0,
        sessionTime: parsed.sessionTime || 0,
        clicksCount: parsed.clicksCount || 0,
        lastActivity: parsed.lastActivity || null,
        daysActive: parsed.daysActive || 0,
        interactions: parsed.interactions || 0,
        opens: parsed.opens || 0,
        reports: parsed.reports || 0,
        riskyLinks: parsed.riskyLinks || 0,
        phishingVisits: parsed.phishingVisits || 0,
        phishingLinks: parsed.phishingLinks || 0,
        phishingSubmissions: parsed.phishingSubmissions || 0,
        urlScansStarted: parsed.urlScansStarted || 0,
        urlScansCompleted: parsed.urlScansCompleted || 0,
        riskyUrlScans: parsed.riskyUrlScans || 0,
        gameStats: parsed.gameStats || {
          cluesRevealed: 0,
          decisionsMade: 0,
          drillsReset: 0,
          totalInteractions: 0,
        },
        riskLevel: parsed.riskLevel || 0,
        riskScores: parsed.riskScores || [],
      }
    }
  } catch (error) {
    console.error('Error reading local stats:', error)
  }

  return getDefaultStats()
}

function getDefaultStats(): LocalStats {
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
}

export function updateLocalStats(updates: Partial<LocalStats>) {
  if (typeof window === 'undefined') return

  try {
    const current = getLocalStats()
    const updated = { ...current, ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('cyber-stats-updated', { 
      detail: updated 
    }))
    
    return updated
  } catch (error) {
    console.error('Error updating local stats:', error)
  }
}

// Helper functions for specific stat updates
export function incrementInteraction(type: 'OPEN' | 'REPORT' | 'CLICK') {
  const current = getLocalStats()
  const updates: Partial<LocalStats> = {
    interactions: current.interactions + 1,
    lastActivity: new Date().toISOString(),
  }
  
  if (type === 'OPEN') {
    updates.opens = current.opens + 1
  } else if (type === 'REPORT') {
    updates.reports = current.reports + 1
  } else if (type === 'CLICK') {
    updates.riskyLinks = current.riskyLinks + 1
  }
  
  return updateLocalStats(updates)
}

export function incrementPhishingVisit() {
  const current = getLocalStats()
  return updateLocalStats({
    phishingVisits: current.phishingVisits + 1,
    lastActivity: new Date().toISOString(),
  })
}

export function incrementUrlScan(status: 'started' | 'completed' | 'risky') {
  const current = getLocalStats()
  const updates: Partial<LocalStats> = {
    lastActivity: new Date().toISOString(),
  }
  
  if (status === 'started') {
    updates.urlScansStarted = current.urlScansStarted + 1
  } else if (status === 'completed') {
    updates.urlScansCompleted = current.urlScansCompleted + 1
  } else if (status === 'risky') {
    updates.riskyUrlScans = current.riskyUrlScans + 1
  }
  
  return updateLocalStats(updates)
}

export function updateRiskLevel(riskLevel: number) {
  const current = getLocalStats()
  const riskScores = [...(current.riskScores || []), riskLevel].slice(-10) // Keep last 10
  
  return updateLocalStats({
    riskLevel,
    riskScores,
  })
}

