"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, Check, FlagTriangleRight, Link2, Mail, ShieldCheck, Sparkles } from "lucide-react";

type ToolKey = "email" | "link";

type Tool = {
  key: ToolKey;
  title: string;
  description: string;
  icon: LucideIcon;
};

const tools: Tool[] = [
  {
    key: "email",
    title: "Phishing Drill",
    description: "Step into the simulated inbox, tap the hotspots, and decide how to respond in real time.",
    icon: Mail,
  },
  {
    key: "link",
    title: "Link Sandbox",
    description: "Paste suspicious URLs and watch the sandbox animate each inspection phase.",
    icon: Link2,
  },
];

const toolThemes: Record<
  ToolKey,
  {
    headline: string;
    subcopy: string;
    backdrop: string;
  }
> = {
  email: {
    headline: "Experience a live phishing lure from the first click.",
    subcopy: "Reveal sender details, hover links, and make the call. Feedback appears the moment you act.",
    backdrop:
      "radial-gradient(circle at 20% 30%, rgba(244, 114, 182, 0.28), transparent 60%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.18), transparent 65%)",
  },
  link: {
    headline: "Launch the browser sandbox and trace every signal.",
    subcopy: "Certificates, redirects, payload checks—all rendered as the scan progresses.",
    backdrop:
      "radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.26), transparent 60%), radial-gradient(circle at 78% 28%, rgba(99, 102, 241, 0.18), transparent 65%)",
  },
};

export function ExperienceLab() {
  const [activeTool, setActiveTool] = useState<ToolKey>("email");
  const activeTheme = toolThemes[activeTool];

  return (
    <div className="lab-surface relative overflow-hidden rounded-[28px] border border-border/60 bg-surface/95 p-6 shadow-xl backdrop-blur md:p-8">
      <div className="lab-gradient" aria-hidden />
      <div className="lab-constellation" aria-hidden />
      <motion.div
        key={activeTool}
        className="absolute inset-0 z-0 opacity-60"
        style={{ background: activeTheme.backdrop }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        aria-hidden
      />
      <div className="grid gap-6 md:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] md:items-start relative z-10">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <motion.p
              key={`headline-${activeTool}`}
              className="text-sm font-semibold text-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTheme.headline}
            </motion.p>
            <motion.p
              key={`subcopy-${activeTool}`}
              className="text-xs text-muted leading-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {activeTheme.subcopy}
            </motion.p>
          </div>
          <div className="flex flex-col gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.key === activeTool;

              return (
                <motion.button
                  key={tool.key}
                  type="button"
                  onClick={() => setActiveTool(tool.key)}
                  className={`flex flex-col gap-2 rounded-2xl border border-transparent bg-transparent p-4 text-left transition-all ${
                    isActive
                      ? "bg-surface-muted/80 text-foreground shadow-sm ring-2 ring-accent/50"
                      : "hover:bg-surface-muted/60 hover:text-foreground/90 text-muted"
                  }`}
                  aria-pressed={isActive}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ translateX: isActive ? 0 : 4 }}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="h-4 w-4 text-accent" />
                    {tool.title}
                  </span>
                  <span className="text-xs text-muted">{tool.description}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/92 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTool === "email" && <EmailExperience />}
              {activeTool === "link" && <LinkExperience />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

type EmailSegment = {
  text: string;
  highlight?: boolean;
};

type EmailScenario = {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  body: EmailSegment[][];
  cues: {
    title: string;
    detail: string;
  }[];
  metric: {
    label: string;
    value: string;
  };
};

const emailScenarios: EmailScenario[] = [
  {
    id: "payroll",
    subject: "Payroll credentials expire tonight",
    sender: "Payroll Desk <hr-payroll@secure-payments.support>",
    preview: "We could not sync your banking details. Renew access inside the payroll portal before midnight.",
    body: [
      [
        { text: "Hey Jordan,\n\n" },
        {
          text: "Our overnight payroll run failed to verify your account information. ",
        },
        {
          text: "Re-authorise your credentials in the secure portal within 60 minutes ",
          highlight: true,
        },
        {
          text: "to avoid a paycheck delay.",
        },
      ],
      [
        { text: "Portal: " },
        { text: "https://payroll-fastlane.com/hr-update\n", highlight: true },
      ],
      [
        {
          text: "Failure to act pauses your compensation until the next cycle.",
          highlight: true,
        },
      ],
      [{ text: "\nPayroll Desk" }],
    ],
    cues: [
      {
        title: "Brand mismatch",
        detail: "secure-payments.support is not a payroll partner you use internally.",
      },
      {
        title: "Pressure language",
        detail: "Deadlines plus delayed pay are a classic emotional trigger.",
      },
      {
        title: "Lookalike URL",
        detail: "payroll-fastlane.com is unrelated to your corporate domain.",
      },
    ],
    metric: {
      label: "Reported in",
      value: "04:12",
    },
  },
  {
    id: "onedrive",
    subject: "Invoice adjustment shared for approval",
    sender: "Finance Automation <notify@microsofts-onedrive.com>",
    preview: "Finance sent adjustments to Q2 invoices. Approve before 4 PM to prevent late fees.",
    body: [
      [{ text: "Hello Jordan,\n\n" }],
      [
        { text: "We've uploaded " },
        { text: "Invoice_Adjustment_Q2.pdf", highlight: true },
        { text: " to your shared drive. Approve before 4 PM." },
      ],
      [
        { text: "Open shared drive: " },
        { text: "http://onedrive-team-files.net/login\n", highlight: true },
      ],
      [{ text: "Need help? Reply to this email." }],
    ],
    cues: [
      {
        title: "Typosquatted sender",
        detail: "microsofts-onedrive.com swaps the letter order to appear trustworthy.",
      },
      {
        title: "Downgraded security",
        detail: "The login link uses plain http:// which strips encryption.",
      },
    ],
    metric: {
      label: "Average click time",
      value: "47s",
    },
  },
  {
    id: "vpn",
    subject: "VPN certificate renewal confirmation",
    sender: "Security Team <alerts@security-it.team>",
    preview: "Remote access cert expires tonight. Confirm on the corporate panel to stay connected.",
    body: [
      [{ text: "Team,\n\n" }],
      [
        {
          text: "Your remote access certificate expires tonight. Renew via the corporate VPN panel.",
        },
      ],
      [
        { text: "Renew access: " },
        { text: "https://vpn.cybermirror.io/update\n", highlight: false },
      ],
      [
        {
          text: "If you miss the renewal, remote work will be interrupted.",
          highlight: true,
        },
      ],
    ],
    cues: [
      {
        title: "Trusted domain",
        detail: "vpn.cybermirror.io is allow-listed internally—safe to continue after verifying the sender.",
      },
      {
        title: "Verify pressure claims",
        detail: "Even with urgent wording, confirm via Slack or phone before acting.",
      },
    ],
    metric: {
      label: "Safe completion",
      value: "92%",
    },
  },
];

function EmailExperience() {
  const [activeId, setActiveId] = useState<string>(emailScenarios[0]?.id ?? "");
  const [showCues, setShowCues] = useState<boolean>(false);
  const [hoveredCueIndex, setHoveredCueIndex] = useState<number | null>(null);

  const scenario = useMemo(() => emailScenarios.find((item) => item.id === activeId) ?? emailScenarios[0], [activeId]);

  return (
    <div className="grid gap-5">
      <header className="rounded-2xl border border-border/60 bg-surface px-4 py-4 md:px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted">Inbox replay</p>
            <h3 className="text-lg font-semibold text-foreground">{scenario.subject}</h3>
            <p className="text-sm text-muted">{scenario.sender}</p>
          </div>
          <motion.button
            type="button"
            onClick={() => setShowCues((state) => !state)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              showCues ? "border-accent bg-accent text-white shadow-sm" : "border-border text-muted hover:bg-surface-muted"
            }`}
            whileTap={{ scale: 0.96 }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {showCues ? "Hide flags" : "Reveal flags"}
          </motion.button>
        </div>
        <p className="mt-3 text-xs text-muted">{scenario.preview}</p>
      </header>
      <div className="browser-shell relative overflow-hidden rounded-2xl border border-border/60 bg-surface-muted">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 text-xs text-muted">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="truncate font-medium text-foreground/80">{scenario.subject}</span>
        </div>
        <motion.div
          className="grid gap-4 px-5 py-6 text-sm leading-relaxed text-foreground/90"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {scenario.body.map((paragraph, index) => (
            <p key={`${scenario.id}-paragraph-${index}`} className="whitespace-pre-wrap">
              {paragraph.map((segment, segmentIndex) => {
                const highlighted = segment.highlight && (showCues || hoveredCueIndex !== null);
                return (
                  <motion.span
                    key={`${scenario.id}-segment-${segmentIndex}`}
                    className={highlighted ? "rounded-md bg-amber-100 px-1 text-amber-900 ring-1 ring-amber-200" : ""}
                    layout
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  >
                    {segment.text}
                  </motion.span>
                );
              })}
            </p>
          ))}
        </motion.div>
        <motion.div
          className={`scan-sweep ${showCues ? "opacity-100" : "opacity-0"}`}
          aria-hidden
          animate={{ opacity: showCues ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="grid gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 font-semibold text-foreground/80">
            <FlagTriangleRight className="h-3.5 w-3.5 text-accent" />
            {scenario.metric.label}: {scenario.metric.value}
          </span>
          <span>Rotate scenarios to feel how the tone, links, and urgency change.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {emailScenarios.map((item) => {
            const selected = item.id === activeId;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveId(item.id);
                  setShowCues(false);
                  setHoveredCueIndex(null);
                }}
                className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selected
                    ? "border-accent/70 bg-accent text-white shadow-sm"
                    : "border-border text-muted hover:border-accent/60 hover:text-foreground"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100" />
                {item.subject.slice(0, 26)}
                {item.subject.length > 26 ? "…" : ""}
              </motion.button>
            );
          })}
        </div>
        {showCues && (
          <motion.ul
            className="grid gap-2 text-xs text-foreground/85"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {scenario.cues.map((cue, index) => (
              <li
                key={cue.title}
                className="flex gap-2 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-2"
                onMouseEnter={() => setHoveredCueIndex(index)}
                onMouseLeave={() => setHoveredCueIndex(null)}
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                <div>
                  <p className="font-semibold">{cue.title}</p>
                  <p className="text-muted">{cue.detail}</p>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}

type LinkFinding = {
  text: string;
  severity: "high" | "medium" | "info";
};

type LinkVerdict = {
  verdict: "High risk" | "Suspicious" | "Likely safe";
  tone: "danger" | "warn" | "safe";
  reasons: LinkFinding[];
  displayUrl: string;
};

const linkSamples = [
  {
    label: "Spoofed Microsoft login",
    url: "http://login-verification.microsoft-secure-center.com/session",
  },
  {
    label: "Corporate intranet (safe)",
    url: "https://portal.cybermirror.io/home",
  },
  {
    label: "Parcel tracking lure",
    url: "https://fast-delivery-updates.click/parcel?id=883216",
  },
];

const trustedRoots = ["cybermirror.io", "microsoft.com", "google.com"];

function evaluateLink(rawUrl: string): LinkVerdict {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return {
      verdict: "Suspicious",
      tone: "warn",
      reasons: [
        {
          text: "No URL provided. Always grab the link exactly as it appeared in the message.",
          severity: "medium",
        },
      ],
      displayUrl: "—",
    };
  }

  let url: URL | null = null;
  let assumedProtocol = false;

  try {
    url = new URL(trimmed);
  } catch (_error) {
    try {
      url = new URL(`https://${trimmed}`);
      assumedProtocol = true;
    } catch (_error2) {
      return {
        verdict: "High risk",
        tone: "danger",
        reasons: [
          {
            text: "Malformed link. Attack kits break URLs to bypass quick filters.",
            severity: "high",
          },
        ],
        displayUrl: trimmed,
      };
    }
  }

  if (!url) {
    return {
      verdict: "High risk",
      tone: "danger",
      reasons: [{ text: "Unable to inspect the link destination.", severity: "high" }],
      displayUrl: trimmed,
    };
  }

  const reasons: LinkFinding[] = [];
  let score = 0;
  const hostname = url.hostname.toLowerCase();
  const path = `${url.pathname}${url.search}`;
  const tld = hostname.split(".").pop() ?? "";
  const suspiciousTlds = ["zip", "xyz", "top", "ru", "click", "country", "gq", "quest"];

  if (url.protocol === "http:") {
    reasons.push({
      text: "Uses unsecured HTTP. Legitimate services default to HTTPS.",
      severity: "high",
    });
    score += 2;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    reasons.push({
      text: "Direct IP address detected. Phishing kits often hide behind raw IPs.",
      severity: "high",
    });
    score += 3;
  }

  if (trimmed.includes("@")) {
    reasons.push({
      text: "Contains the @ symbol which hides the actual destination.",
      severity: "high",
    });
    score += 3;
  }

  if (suspiciousTlds.includes(tld)) {
    reasons.push({
      text: `Ends with rarely-used top-level domain .${tld}. Double-check legitimacy.`,
      severity: "medium",
    });
    score += 2;
  }

  if (hostname.split(".").length > 4) {
    reasons.push({
      text: "Highly nested subdomain. Attackers stack words to mimic trusted brands.",
      severity: "medium",
    });
    score += 1;
  }

  if (/login|verify|invoice|reset|update|secure/i.test(path)) {
    reasons.push({
      text: "Path pushes for sensitive action (login / verify / update).",
      severity: "medium",
    });
    score += 2;
  }

  if (hostname.includes("-secure") || hostname.includes("account-") || hostname.includes("support-")) {
    reasons.push({
      text: "Stuffed with trust words (secure/account/support) inside the host name.",
      severity: "medium",
    });
    score += 1;
  }

  if (path.length > 80) {
    reasons.push({
      text: "Very long path. Phishing kits pad URLs to hide redirects.",
      severity: "info",
    });
    score += 1;
  }

  if (assumedProtocol) {
    reasons.push({
      text: "Protocol missing. We assumed HTTPS—validate the sender before proceeding.",
      severity: "info",
    });
    score += 1;
  }

  const trusted = trustedRoots.some((root) => hostname === root || hostname.endsWith(`.${root}`));
  if (trusted) {
    reasons.push({
      text: "Matches a trusted allowlist. Still confirm context before signing in.",
      severity: "info",
    });
    score = Math.max(0, score - 2);
  }

  let verdict: LinkVerdict["verdict"];
  let tone: LinkVerdict["tone"];

  if (score >= 5) {
    verdict = "High risk";
    tone = "danger";
  } else if (score >= 3) {
    verdict = "Suspicious";
    tone = "warn";
  } else {
    verdict = "Likely safe";
    tone = "safe";
  }

  return {
    verdict,
    tone,
    reasons,
    displayUrl: url.href,
  };
}

function LinkExperience() {
  const [inputValue, setInputValue] = useState<string>(linkSamples[0]?.url ?? "");
  const [activeLabel, setActiveLabel] = useState<string>(linkSamples[0]?.label ?? "Sample");
  const [result, setResult] = useState<LinkVerdict>(() => evaluateLink(linkSamples[0]?.url ?? ""));
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const progressTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
      }
    };
  }, []);

  const stopTimers = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  const runScan = (url: string, label?: string) => {
    const trimmed = url.trim();
    stopTimers();
    setInputValue(trimmed);
    setActiveLabel(label ?? "Custom URL");

    if (!trimmed) {
      setResult(evaluateLink(trimmed));
      setScanProgress(0);
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    progressTimerRef.current = window.setInterval(() => {
      setScanProgress((prev) => {
        const increment = Math.random() * 22;
        const next = Math.min(prev + increment, 92);
        return next;
      });
    }, 220);

    finishTimerRef.current = window.setTimeout(() => {
      stopTimers();
      const evaluation = evaluateLink(trimmed);
      setResult(evaluation);
      setScanProgress(100);
      setIsScanning(false);
    }, 1500);
  };

  const verdictTone =
    result.tone === "danger"
      ? "text-red-600 border-red-500/40 bg-red-500/10"
      : result.tone === "warn"
        ? "text-amber-600 border-amber-500/40 bg-amber-500/10"
        : "text-emerald-600 border-emerald-500/40 bg-emerald-500/10";

  const displayHost = useMemo(() => {
    try {
      if (!result.displayUrl || result.displayUrl === "—") {
        return "Host unknown";
      }
      return new URL(result.displayUrl).hostname;
    } catch (_error) {
      return "Host unknown";
    }
  }, [result.displayUrl]);

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-muted">Link sandbox</p>
          <h3 className="text-lg font-semibold text-foreground">Drop a URL and watch the forensic sweep.</h3>
        </div>
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface px-3 py-1.5 text-xs text-muted"
          animate={{ opacity: isScanning ? 1 : 0.85 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          {isScanning ? "Simulating browser sandbox…" : "Runs locally. Nothing leaves your device."}
        </motion.div>
      </header>

      <div className="rounded-2xl border border-border/70 bg-surface/95 p-4 shadow-inner space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <input
            type="url"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="https://example.com/login?secure-update"
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed"
            disabled={isScanning}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                runScan(inputValue, "Custom URL");
              }
            }}
          />
          <motion.button
            type="button"
            onClick={() => runScan(inputValue, "Custom URL")}
            disabled={isScanning}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:-translate-y-[15%] disabled:translate-y-0 disabled:opacity-70"
            whileTap={{ scale: 0.95 }}
          >
            {isScanning ? (
              <>
                <motion.span
                  className="size-2 rounded-full bg-background"
                  animate={{ scale: [1, 0.6, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                />
                Scanning…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Run scan
              </>
            )}
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {linkSamples.map((sample) => {
            const selected = sample.label === activeLabel;
            return (
              <motion.button
                key={sample.label}
                type="button"
                onClick={() => runScan(sample.url, sample.label)}
                className={`rounded-full border px-3 py-1.5 transition ${
                  selected ? "border-accent bg-accent text-white" : "border-border text-muted hover:text-foreground"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {sample.label}
              </motion.button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/70 bg-surface-muted p-4 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Sandbox playback</span>
            <span>{displayHost}</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-accent"
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted">
            {isScanning ? "Inspecting certificates, host reputation, and path intent…" : "Scan complete. Review the signals below."}
          </p>
        </div>
      </div>

      <motion.div
        className={`rounded-2xl border px-5 py-5 space-y-4 ${verdictTone}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/70">Guided verdict</p>
            <h3 className="text-lg font-semibold text-foreground">{result.verdict}</h3>
          </div>
          <span className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs text-foreground/80 backdrop-blur">
            {result.displayUrl}
          </span>
        </div>
        <ul className="grid gap-2">
          {result.reasons.map((reason, index) => {
            const iconClass =
              reason.severity === "high"
                ? "text-red-500"
                : reason.severity === "medium"
                  ? "text-amber-500"
                  : "text-accent";
            return (
              <li
                key={`${reason.text}-${index}`}
                className="flex gap-2 rounded-xl border border-border/60 bg-surface px-3 py-2 text-xs text-foreground/85"
              >
                <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 ${iconClass}`} />
                <span>{reason.text}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-foreground/70">
          Still unsure? Open your secure chat with IT, paste the link, and confirm the sender before you sign in.
        </p>
      </motion.div>
    </div>
  );
}

