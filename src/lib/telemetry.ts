"use client";

type ExperienceEventName =
  | "phishing_clue_revealed"
  | "phishing_decision_made"
  | "phishing_drill_reset"
  | "link_scan_started"
  | "link_scan_completed"
  | "link_phase_transition"
  | "experience_feedback_submitted";

// Save game stats locally
function saveGameStatsLocally(event: ExperienceEventName) {
  if (typeof window === "undefined") return;

  try {
    const { getLocalStats, updateLocalStats } = require('@/lib/local-stats')
    const current = getLocalStats()
    
    // Initialize game stats if not exists
    if (!current.gameStats) {
      current.gameStats = {
        cluesRevealed: 0,
        decisionsMade: 0,
        drillsReset: 0,
        totalInteractions: 0,
      }
    }

    // Update stats based on event type
    if (event === 'phishing_clue_revealed') {
      current.gameStats.cluesRevealed = (current.gameStats.cluesRevealed || 0) + 1
      current.gameStats.totalInteractions = (current.gameStats.totalInteractions || 0) + 1
    } else if (event === 'phishing_decision_made') {
      current.gameStats.decisionsMade = (current.gameStats.decisionsMade || 0) + 1
      current.gameStats.totalInteractions = (current.gameStats.totalInteractions || 0) + 1
    } else if (event === 'phishing_drill_reset') {
      current.gameStats.drillsReset = (current.gameStats.drillsReset || 0) + 1
      current.gameStats.totalInteractions = (current.gameStats.totalInteractions || 0) + 1
    } else if (event === 'link_scan_started') {
      const { incrementUrlScan } = require('@/lib/local-stats')
      incrementUrlScan('started')
    } else if (event === 'link_scan_completed') {
      const { incrementUrlScan } = require('@/lib/local-stats')
      incrementUrlScan('completed')
    }

    updateLocalStats({ gameStats: current.gameStats })
  } catch (error) {
    console.error('Error saving game stats locally:', error)
  }
}

export function trackExperienceEvent(
  event: ExperienceEventName,
  payload?: Record<string, unknown>
) {
  if (typeof window === "undefined") {
    return;
  }

  // Save game events locally
  if (event === 'phishing_clue_revealed' || 
      event === 'phishing_decision_made' || 
      event === 'phishing_drill_reset') {
    saveGameStatsLocally(event)
  }

  const body = JSON.stringify({
    event,
    payload,
    recordedAt: new Date().toISOString(),
  });

  const url = "/api/telemetry";

  try {
    if ("sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }

    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[telemetry] failed to send event", error);
    }
  }
}

export type { ExperienceEventName };
