'use client'

import { useState, type ComponentType } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MailWarning, Link2, FileWarning, AlarmClock, ShieldQuestion, ArrowUpRight, Sparkles } from 'lucide-react'

type CueId = 'sender' | 'link' | 'attachment' | 'urgency'

const cues: Record<
  CueId,
  {
    label: string
    description: string
    detail: string
    icon: ComponentType<{ className?: string }>
  }
> = {
  sender: {
    label: 'Sender address',
    description:
      'The display name looks correct but the domain micros0ft-secure.com swaps the letter "o" for a zero. That typo is deliberate.',
    detail: 'Attackers hijack brand trust by editing a single character inside the email domain.',
    icon: MailWarning,
  },
  link: {
    label: 'Hidden link',
    description:
      'The visible text says “Reset password now” yet the actual destination is login-secure-reset.net. That domain has no relation to Microsoft.',
    detail: 'Hover (desktop) or long-press (mobile) before clicking to expose the real URL.',
    icon: Link2,
  },
  attachment: {
    label: 'Attachment decoy',
    description:
      'UpdateInstructions.pdf is masquerading as a PDF, but the download reveals a .exe payload bundled in a ZIP file.',
    detail: 'Unexpected executable files should always be escalated to security before opening.',
    icon: FileWarning,
  },
  urgency: {
    label: 'Urgency trigger',
    description:
      '“Your account will be suspended in 30 minutes” is engineered panic. Real support teams do not lock accounts by SMS-style deadlines.',
    detail: 'Taking two minutes to verify through official support kills the attacker’s leverage.',
    icon: AlarmClock,
  },
}

const actions = [
  'Validate the sender through a trusted directory or Slack before you click anything.',
  'Capture and share suspicious messages. Collective memory builds stronger instincts.',
  'Run the link through the sandbox scanner before entering credentials.',
  'Report immediately. Early escalation reduces dwell time dramatically.',
]

export function EmailThreatExplorer() {
  const [activeCue, setActiveCue] = useState<CueId>('sender')
  const ActiveIcon = cues[activeCue].icon

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold text-foreground">
          Explore the phishing email like a responder
        </CardTitle>
        <p className="text-sm text-muted leading-6">
          Inspect the lure exactly as it lands in your inbox. Tap each flag to see what the attacker is doing and the
          safest response in that moment.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="rounded-2xl border border-border/70 bg-surface/80 shadow-sm overflow-hidden">
          <div className="border-b border-border/60 bg-surface-muted px-4 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted">From</p>
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                  activeCue === 'sender' ? 'bg-red-500/10 text-red-600' : 'text-foreground'
                }`}
              >
                <MailWarning className="h-4 w-4" />
                <span>Microsoft Security Center &lt;support@micros0ft-secure.com&gt;</span>
              </div>
            </div>
            <Badge
              className={`border ${
                activeCue === 'urgency'
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-600'
                  : 'border-border/60 text-muted'
              }`}
            >
              High priority
            </Badge>
          </div>
          <div className="px-5 py-6 space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs text-muted">Subject</p>
              <h3 className="text-lg font-semibold text-foreground">
                Security alert: your account will be suspended in 30 minutes
              </h3>
            </div>
            <div className="rounded-xl border border-border/70 bg-surface/60 px-4 py-5 text-sm leading-6 text-muted space-y-4">
              <p>Hello,</p>
              <p>
                We detected unusual activity on your Microsoft account. To keep your data safe, you must reset your
                password within the next 30 minutes or the account will be temporarily locked.
              </p>
              <div
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  activeCue === 'link'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-600'
                    : 'border-border/80 text-accent'
                }`}
              >
                <Link2 className="inline h-4 w-4 align-middle mr-2" />
                Reset password now
                <ArrowUpRight className="inline h-4 w-4 align-middle ml-2" />
              </div>
              <p>If no action is taken, synchronisation with OneDrive will be interrupted.</p>
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                  activeCue === 'attachment'
                    ? 'border-red-500/40 bg-red-500/10 text-red-600'
                    : 'border-border/80 text-muted'
                }`}
              >
                <FileWarning className="h-4 w-4" />
                UpdateInstructions.pdf.zip (42 KB)
              </div>
              <p>
                Microsoft Security Team
                <br />
                © 2024 Microsoft Corporation
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border/80 bg-surface/90 px-5 py-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ActiveIcon className="h-5 w-5 text-accent" />
              <span>{cues[activeCue].label}</span>
            </div>
            <p className="text-sm leading-6 text-muted">{cues[activeCue].description}</p>
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-3 text-xs text-accent leading-6">
              {cues[activeCue].detail}
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(cues) as CueId[]).map((cueId) => {
                const cue = cues[cueId]
                return (
                  <button
                    key={cueId}
                    type="button"
                    onClick={() => setActiveCue(cueId)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      activeCue === cueId
                        ? 'border-accent bg-accent text-accent-foreground shadow'
                        : 'border-border bg-surface text-muted hover:text-foreground'
                    }`}
                  >
                    {cue.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <ShieldQuestion className="h-5 w-5" />
              <span>Playbook moves</span>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-emerald-700">
              {actions.map((action) => (
                <li key={action} className="flex gap-2">
                  <Sparkles className="mt-1 h-4 w-4 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
