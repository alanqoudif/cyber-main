'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trackExperienceEvent } from '@/lib/telemetry'
import {
  Eye,
  MailWarning,
  Link2,
  Timer,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Undo2,
  Sparkles,
} from 'lucide-react'

type ClueId = 'sender' | 'link' | 'tone' | 'attachment'
type DecisionId = 'report' | 'open' | 'ignore'

interface Clue {
  id: ClueId
  label: string
  summary: string
  insight: string
  icon: ComponentType<{ className?: string }>
}

const clues: Clue[] = [
  {
    id: 'sender',
    label: 'Expand the sender details',
    summary: 'Display name claims Payroll, but the domain resolves to a throwaway .io tenant.',
    insight: 'Legitimate payroll updates ship from the hr.company.com domain with SPF alignment.',
    icon: Eye,
  },
  {
    id: 'link',
    label: 'Hover over the Update Account link',
    summary: 'The CTA points to accounts-payroll-secure.com, which is not part of your estate.',
    insight: 'Look-alike domains sneak in extra words such as “secure” or “portal” to disarm you.',
    icon: Link2,
  },
  {
    id: 'tone',
    label: 'Assess the language and urgency',
    summary: 'The message threatens payroll suspension within 30 minutes and mis-capitalises HR.',
    insight: 'Threats and formatting glitches usually signal an attacker rushing the copywriting.',
    icon: Timer,
  },
  {
    id: 'attachment',
    label: 'Inspect the attachment badge',
    summary: 'Attachment is a password-protected .zip that payroll never uses for statements.',
    insight: 'Unexpected compressed files often hide loaders or scripts that unpack silently.',
    icon: MailWarning,
  },
]

const decisions: Record<
  DecisionId,
  {
    title: string
    verdict: 'success' | 'warning' | 'failure'
    body: string
  }
> = {
  report: {
    title: 'You reported the phishing attempt',
    verdict: 'success',
    body: 'Security receives the full header set and removes the lure from other inboxes. You broke the kill chain.',
  },
  open: {
    title: 'You opened the fake payroll portal',
    verdict: 'failure',
    body: 'The cloned login captures credentials and pivots to MFA fatigue. Recovery now needs credential resets and incident response.',
  },
  ignore: {
    title: 'You archived the email without reporting',
    verdict: 'warning',
    body: 'You dodged the trap this time but the lure stays live for colleagues. Escalate suspicious messages so the team can neutralise them.',
  },
}

const maxSignals = clues.length

export function PhishingTool() {
  const [revealedClues, setRevealedClues] = useState<ClueId[]>([])
  const [activeClue, setActiveClue] = useState<ClueId | null>(null)
  const [decision, setDecision] = useState<DecisionId | null>(null)
  const [showFakePage, setShowFakePage] = useState(false)

  const progress = useMemo(
    () => Math.round((revealedClues.length / maxSignals) * 100),
    [revealedClues.length]
  )

  const handleRevealClue = (clueId: ClueId) => {
    setActiveClue(clueId)
    setDecision(null)
    setShowFakePage(false)
    setRevealedClues((prev) => {
      if (prev.includes(clueId)) {
        return prev
      }
      const next = [...prev, clueId]
      const nextProgress = Math.round((next.length / maxSignals) * 100)
      trackExperienceEvent('phishing_clue_revealed', {
        clueId,
        totalRevealed: next.length,
        progress: nextProgress,
      })
      return next
    })
  }

  const handleDecision = (id: DecisionId) => {
    setDecision(id)
    setActiveClue(null)
    setShowFakePage(id === 'open')
    trackExperienceEvent('phishing_decision_made', {
      decision: id,
      revealedSignals: revealedClues.length,
    })
  }

  const resetScenario = () => {
    trackExperienceEvent('phishing_drill_reset', {
      revealedSignals: revealedClues.length,
      decision: decision ?? 'none',
    })
    setRevealedClues([])
    setActiveClue(null)
    setDecision(null)
    setShowFakePage(false)
  }

  const activeClueData = activeClue ? clues.find((clue) => clue.id === activeClue) ?? null : null
  const decisionData = decision ? decisions[decision] : null

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-2xl font-semibold text-foreground">Phishing drill</CardTitle>
          <Badge className="bg-accent/10 text-accent border border-accent/30">
            Spot {maxSignals} warning signals
          </Badge>
        </div>
        <p className="text-sm text-muted leading-6 max-w-2xl">
          Walk through the exact lure sent to the finance team. Tap the hotspots to reveal every indicator,
          then decide how to respond. Each action gives immediate feedback so the lesson sticks.
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-surface/80 shadow-inner">
            <header className="flex flex-col gap-3 border-b border-border/70 bg-surface-muted/80 px-5 py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex flex-col text-sm text-foreground">
                  <span className="font-semibold">Payroll Update</span>
                  <button
                    type="button"
                    onClick={() => handleRevealClue('sender')}
                    className={`text-left text-xs transition ${
                      revealedClues.includes('sender') ? 'text-accent font-medium' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    payroll-updates@secure-pay.io
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevealClue('attachment')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    revealedClues.includes('attachment')
                      ? 'border-red-500/30 bg-red-500/10 text-red-600'
                      : 'border-border/60 bg-surface text-muted hover:text-foreground'
                  }`}
                >
                  Attachment • Payroll_Update.zip
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>To: finance.team@company.com</span>
                <span className="size-1 rounded-full bg-border" />
                <span>Received 14 minutes ago</span>
              </div>
            </header>

            <div className="space-y-5 px-5 py-6 text-sm leading-6 text-foreground">
              <p>
                Dear team,
                <br />
                <br />
                Our automated payroll system flagged an authentication issue. If you do not confirm your details in the
                next <strong className="text-red-600">30 minutes</strong>, all direct deposits will be paused.
              </p>

              <div className="rounded-2xl border border-border/80 bg-surface-muted/60 px-4 py-3 space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted">Action required</p>
                <button
                  type="button"
                  onClick={() => handleRevealClue('link')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    revealedClues.includes('link')
                      ? 'bg-red-500/10 text-red-600'
                      : 'bg-accent/10 text-accent hover:bg-accent/20'
                  }`}
                >
                  Verify account access
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-xs text-muted">
                  System: Payroll Automation Service • Timestamp: 08:42 AM
                </p>
              </div>

              <p>
                If you have already validated, kindly ignore this reminder. This alert is managed by the Payroll Service
                Desk.
              </p>

              <p className="text-muted text-xs">
                Thank you, <br />
                Payroll Service Desk
              </p>

              <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-700">
                Automatic notice: Failing to respond will result in suspended accounts and manual identity checks.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-muted">Decide your next move</span>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleDecision('report')}
                className="bg-green-500/15 px-3 py-1.5 text-xs text-green-700 hover:bg-green-500/25 border border-green-500/30"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Report to security
              </Button>
              <Button
                onClick={() => handleDecision('open')}
                className="bg-red-500/15 px-3 py-1.5 text-xs text-red-700 hover:bg-red-500/25 border border-red-500/30"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Open the link anyway
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDecision('ignore')}
                className="border-border/70 px-3 py-1.5 text-xs text-muted hover:text-foreground"
              >
                <Undo2 className="mr-2 h-4 w-4" />
                Ignore it
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={resetScenario}
              className="ml-auto px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              Reset drill
            </Button>
          </div>

          {decisionData && (
            <div
              className={`rounded-2xl border px-5 py-4 space-y-2 text-sm leading-6 ${
                decisionData.verdict === 'success'
                  ? 'border-green-500/30 bg-green-500/10 text-green-700'
                  : decisionData.verdict === 'failure'
                    ? 'border-red-500/30 bg-red-500/10 text-red-700'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-700'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-base">
                <Sparkles className="h-4 w-4" />
                {decisionData.title}
              </div>
              <p>{decisionData.body}</p>
            </div>
          )}

          {showFakePage && (
            <div className="rounded-2xl border border-red-500/40 bg-surface/80 px-4 py-4">
              <div className="mb-3 flex items-center justify-between text-xs text-muted">
                <span>accounts-payroll-secure.com/login</span>
                <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Not trusted</Badge>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface-muted/70 px-4 py-5 space-y-3">
                <p className="text-sm font-semibold text-foreground">Payroll Portal</p>
                <input
                  disabled
                  placeholder="Email"
                  className="w-full rounded-lg border border-red-500/30 bg-surface px-3 py-2 text-xs text-muted"
                />
                <input
                  disabled
                  placeholder="Password"
                  className="w-full rounded-lg border border-red-500/30 bg-surface px-3 py-2 text-xs text-muted"
                />
                <Button
                  disabled
                  className="w-full border border-red-500/20 bg-red-500/20 text-red-600 hover:bg-red-500/30"
                >
                  Sign in
                </Button>
                <p className="text-xs text-red-600">
                  This capture page mirrors the real portal but sends credentials to an attacker-controlled server.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-surface/60 px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted">Signals discovered</span>
              <Badge className="bg-surface text-muted border border-border/50">
                {revealedClues.length} / {maxSignals}
              </Badge>
            </div>
            <div className="space-y-3">
              {clues.map((clue) => {
                const Icon = clue.icon
                const isRevealed = revealedClues.includes(clue.id)
                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => handleRevealClue(clue.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      isRevealed
                        ? 'border-accent/40 bg-accent/10 text-foreground'
                        : 'border-border/70 bg-surface text-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isRevealed ? 'text-accent' : 'text-muted'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{clue.label}</p>
                        <p className="text-xs leading-5">{clue.summary}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {activeClueData && (
            <div className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-4 space-y-2 text-sm leading-6 text-accent">
              <p className="font-semibold text-accent-foreground">Insight</p>
              <p className="text-accent-foreground/90">{activeClueData.insight}</p>
            </div>
          )}

          {!decisionData && (
            <div className="rounded-xl border border-border/70 bg-surface px-4 py-4 text-xs leading-6 text-muted">
              Work the evidence first, then choose. Reporting is always a safe default—security wants the signal more than
              you need inbox zero.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
