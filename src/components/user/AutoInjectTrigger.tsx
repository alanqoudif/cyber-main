'use client'

import { useEffect } from 'react'

// Component that triggers auto-injection when user visits the page
// This runs silently in the background
export function AutoInjectTrigger() {
  useEffect(() => {
    // Wait a bit before checking (to make it feel natural)
    const timer = setTimeout(() => {
      checkAndInject()
    }, 5000) // Wait 5 seconds after page load

    return () => clearTimeout(timer)
  }, [])

  const checkAndInject = async () => {
    try {
      // Check if user has any pending injections
      const res = await fetch('/api/vulnerability/inject?status=PENDING')
      const data = await res.json()
      
      // If no pending injections, trigger auto-injection with low probability
      if (!data.injections || data.injections.length === 0) {
        // 30% chance to inject on each page visit
        if (Math.random() < 0.3) {
          // Trigger auto-injection (this will be handled by a background job or API)
          // For now, we'll just inject directly with a delay
          setTimeout(() => {
            fetch('/api/vulnerability/inject', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            }).catch(err => {
              // Silently fail - don't alert user
              console.debug('Auto-injection skipped:', err)
            })
          }, 10000) // Wait 10 seconds before injecting
        }
      }
    } catch (error) {
      // Silently fail - don't alert user
      console.debug('Auto-injection check failed:', error)
    }
  }

  return null // This component doesn't render anything
}

