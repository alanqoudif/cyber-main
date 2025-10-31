"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  GraduationCap,
  LineChart,
  Headset,
  Inbox,
  Sun,
  Moon,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Theme = "light" | "dark";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type Point = {
  title: string;
  detail: string;
};

const ThreatGlobe = dynamic<{ theme: Theme }>(
  () =>
    import("@/components/threat-globe").then((mod) => ({
      default: mod.ThreatGlobe,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="surface-card flex h-72 w-72 items-center justify-center text-sm text-muted md:h-96 md:w-96">
        Loading the 3D scene…
      </div>
    ),
  }
);

const heroHighlights: Point[] = [
  {
    title: "Launch in minutes",
    detail: "Choose a phishing scenario and target list, then hit send with built-in guardrails.",
  },
  {
    title: "Clarity first",
    detail: "See opens, clicks, and reports in a calm overview that calls out one recommended action.",
  },
  {
    title: "Built for English & Arabic",
    detail: "Works flawlessly across desktop and mobile with full RTL support when you need it.",
  },
];

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Simulation library",
    description: "Real attack lookalikes curated for finance, government, and enterprise teams.",
  },
  {
    icon: LineChart,
    title: "Live risk dial",
    description: "A single trend line showing your click-down and report-up progress each week.",
  },
  {
    icon: GraduationCap,
    title: "Micro-lessons",
    description: "60-second explainers with adaptive quiz questions sent right after each mistake.",
  },
  {
    icon: Inbox,
    title: "Seamless delivery",
    description: "OAuth-based connectors for Microsoft 365 and Google Workspace—no legacy SMTP pain.",
  },
];

const loopSteps: Point[] = [
  {
    title: "Plan & personalize",
    detail: "Pick the threat story, brand it, and segment audiences with a clean drag-and-drop flow.",
  },
  {
    title: "Simulate & observe",
    detail: "We capture intent signals in real time and feed them into the rotating threat globe.",
  },
  {
    title: "Coach & improve",
    detail: "Auto-enroll risky users into short refreshers and surface wins to leadership weekly.",
  },
];

const supportPoints: Point[] = [
  {
    title: "Launch kit included",
    detail: "Pre-written announcement email, poster, and intranet copy you can ship on day one.",
  },
  {
    title: "Human guidance",
    detail: "A regional security specialist joins your first review call and helps tune templates.",
  },
  {
    title: "Executive-ready briefs",
    detail: "One-page PDF summary every Friday with key deltas and plain-language recommendations.",
  },
];

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Auth redirect is handled by middleware

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem("cm-theme");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const initialTheme: Theme =
      storedTheme === "light" || storedTheme === "dark"
        ? (storedTheme as Theme)
        : mq.matches
          ? "dark"
          : "light";

    setTheme(initialTheme);
    document.body.dataset.theme = initialTheme;
    setMounted(true);

    const mediaListener = (event: MediaQueryListEvent | MediaQueryList) => {
      const nextTheme: Theme = "matches" in event ? (event.matches ? "dark" : "light") : mq.matches ? "dark" : "light";
      setTheme(nextTheme);
      document.body.dataset.theme = nextTheme;
      window.localStorage.setItem("cm-theme", nextTheme);
    };

    // Support older browsers that use addListener.
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", mediaListener as EventListener);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(mediaListener);
    }

    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", mediaListener as EventListener);
      } else if (typeof mq.removeListener === "function") {
        mq.removeListener(mediaListener);
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") {
      return;
    }

    document.body.dataset.theme = theme;
    window.localStorage.setItem("cm-theme", theme);
  }, [mounted, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themeLabel = useMemo(
    () => (theme === "light" ? "Switch to dark mode" : "Switch to light mode"),
    [theme]
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-16 md:gap-28 md:pt-20">
      <header className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] md:items-center">
        <div className="grid gap-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted">
              CyberMirror
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
              aria-label={themeLabel}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>
          </div>

          <div className="grid gap-5 text-balance md:max-w-2xl">
            <p className="eyebrow">Phishing awareness without the noise</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              A calm training platform that blends live simulations with a living threat globe.
            </h1>
            <p className="text-lg text-muted md:text-xl">
              CyberMirror keeps the interface quiet, the guidance specific, and the visuals purposeful. Launch a campaign,
              watch behavior flow across the 3D map, and send targeted coaching with zero clutter.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {heroHighlights.map((item) => (
              <div key={item.title} className="surface-card surface-muted flex flex-col gap-2 p-5">
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-6 md:items-end">
          <ThreatGlobe theme={theme} />
          <div className="surface-card w-full max-w-[17rem] border border-border/60 p-5 text-left text-xs text-muted">
            <p className="font-semibold text-foreground">Live risk pulse</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-3xl font-semibold text-accent-soft">3.2</span>
              <span className="mb-1 text-[0.8rem] uppercase tracking-[0.3em] text-muted">
                posture delta
              </span>
            </div>
            <p className="mt-3 leading-relaxed">
              Signals stream into the globe in real time to highlight locations that still need coaching.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-10 md:grid-cols-[0.9fr_1fr] md:items-center">
        <div className="grid gap-4">
          <p className="eyebrow">Design principles</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Purposeful visuals, fewer panels, and one storyline from send to insight.
          </h2>
        </div>
        <div className="surface-card grid gap-4 p-8 text-sm text-muted">
          <p>
            No more neon dashboards. CyberMirror groups every signal into a single column summary. We pair that tone with
            the 3D globe so you can instantly see where risky clicks originate while the rest of the interface stays calm.
          </p>
          <p>
            The palette uses quiet blues in light mode and deep ink gradients in dark mode. Typography leans on one weight,
            generous spacing, and components that stack cleanly on phones and desktops alike.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="surface-card flex flex-col gap-4 p-6">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent/12 text-accent">
              <feature.icon className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.description}</p>
          </article>
        ))}
      </section>

      <section id="how-it-works" className="surface-card grid gap-10 p-10">
        <div className="grid gap-3">
          <p className="eyebrow">Run the loop</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Three steps to keep your people ahead of attackers.
          </h2>
          <p className="text-base text-muted">
            Everything happens in one interface—no extra tabs, no mystery spreadsheets, and no confusing export workflow.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {loopSteps.map((step, index) => (
            <article key={step.title} className="flex flex-col gap-3 rounded-2xl border border-border p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent/12 text-sm font-semibold text-accent">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_0.55fr]">
        <div className="surface-card grid gap-6 p-8">
          <h2 className="text-2xl font-semibold text-foreground">A support layer that stays human.</h2>
          <p className="text-sm text-muted">
            We are on every review call until you feel comfortable. Need to prove improvement to leadership? We package the
            signal into a simple narrative you can retell.
          </p>
          <ul className="grid gap-4 text-sm text-muted">
            {supportPoints.map((point) => (
              <li key={point.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="font-medium text-foreground">{point.title}</p>
                  <p className="mt-1 leading-relaxed">{point.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <aside className="surface-card grid gap-4 p-6 text-sm text-muted">
          <div className="flex items-center gap-3">
            <Headset className="h-5 w-5 text-accent" />
            <p className="text-base font-semibold text-foreground">One tap to reach us</p>
          </div>
          <p>
            Dedicated Slack channel or WhatsApp for Business. Our response target is under four working hours, including
            playbook advice and quick template reviews.
          </p>
          <p>
            Prefer face time? Book a monthly Zoom session with our incident response strategist to refine the next wave.
          </p>
        </aside>
      </section>

      <section
        id="contact"
        className="surface-card grid gap-6 p-8 text-center md:grid-cols-[minmax(0,1.1fr)_0.9fr] md:items-center md:text-left"
      >
        <div className="grid gap-4">
          <p className="eyebrow">Get Started</p>
          <h2 className="text-3xl font-semibold text-foreground">Ready to improve your security posture?</h2>
          <p className="text-sm text-muted">
            Start your security awareness training journey with CyberMirror today.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-left">
          <Link href="/auth/signup">
            <button className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="w-full inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
