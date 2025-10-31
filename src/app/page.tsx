"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Headset,
  Layers,
  Moon,
  Sparkles,
  Sun,
  Target,
  Wand2,
  Workflow,
} from "lucide-react";
import { ExperienceLab } from "@/components/landing/experience-lab";

type Theme = "light" | "dark";

type Highlight = {
  icon: LucideIcon;
  title: string;
  detail: string;
};

type FlowPoint = {
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

const heroHighlights: Highlight[] = [
  {
    icon: Sparkles,
    title: "Immersive from the first click",
    detail: "Visitors land inside live labs with animations that react to every decision.",
  },
  {
    icon: Target,
    title: "English-only journeys",
    detail: "All story scripts, prompts, and tooltips stay in one clear language so teams stay focused.",
  },
  {
    icon: Globe2,
    title: "Role-based storylines",
    detail: "Pick CFO, HR, or frontline experiences and launch them with one toggle.",
  },
];

const toolHighlights: Highlight[] = [
  {
    icon: Layers,
    title: "Scenario stack",
    detail: "Phishing, smishing, USB drops, and executive whaling templates ready to deploy.",
  },
  {
    icon: Wand2,
    title: "Adaptive coaching",
    detail: "Micro-lessons trigger right after a risky click with motion that mirrors the attack.",
  },
  {
    icon: Workflow,
    title: "Playable analytics",
    detail: "Live risk dial, story timelines, and colour-safe dashboards designed for workshops.",
  },
];

const flowSteps: FlowPoint[] = [
  {
    title: "Curate the narrative",
    detail:
      "Choose the social-engineering storyline, drop your brand voice in, and preload supporting assets for the facilitator.",
  },
  {
    title: "Activate the playground",
    detail:
      "Launch email, link, and SMS labs together. Participants explore, trigger animations, and submit reports in real time.",
  },
  {
    title: "Debrief with clarity",
    detail: "Generate a single-slide recap and full incident timeline to brief leadership within minutes.",
  },
];

const supportPoints: FlowPoint[] = [
  {
    title: "Launch-day producer",
    detail: "Our facilitator hosts the first interactive session, tunes pacing, and keeps the energy high.",
  },
  {
    title: "Animation studio access",
    detail: "Use our motion library—browser scans, inbox reveals, globe pulses—to match each storyline.",
  },
  {
    title: "Executive-ready briefs",
    detail: "Receive Friday summaries with behaviour shifts, highlights, and the next experiment to run.",
  },
];

export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

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
      const nextTheme: Theme =
        "matches" in event ? (event.matches ? "dark" : "light") : mq.matches ? "dark" : "light";
      setTheme(nextTheme);
      document.body.dataset.theme = nextTheme;
      window.localStorage.setItem("cm-theme", nextTheme);
    };

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
            <p className="eyebrow">Immersive cyber awareness lab</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              The only training site that feels like a real attack—fully interactive, fully in English.
            </h1>
            <p className="text-lg text-muted md:text-xl">
              Let people experience phishing emails, suspicious links, and response drills inside one playground. Every
              motion, prompt, and coaching script is crafted to be clicked, tested, and retold.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#experience"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Explore the Experiences
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {heroHighlights.map((item) => (
              <div key={item.title} className="surface-card flex flex-col gap-3 p-5">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent/12 text-accent">
                  <item.icon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-6 md:items-end">
          <ThreatGlobe theme={theme} />
          <div className="surface-card w-full max-w-[18rem] border border-border/60 p-5 text-left text-xs text-muted">
            <p className="font-semibold text-foreground">Live engagement pulse</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-3xl font-semibold text-accent-soft">86%</span>
              <span className="mb-1 text-[0.8rem] uppercase tracking-[0.3em] text-muted">reporting rate</span>
            </div>
            <p className="mt-3 leading-relaxed">
              As teams play through the labs, the globe lights up with clicks, reports, and successful escalations.
            </p>
          </div>
        </div>
      </header>

      <section id="experience" className="grid gap-10 md:grid-cols-[0.85fr_1fr] md:items-start">
        <div className="grid gap-4">
          <p className="eyebrow">Experience hub</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Launch simulations, scan links, and practice the debrief—in one connected flow.
          </h2>
          <p className="text-base text-muted">
            Each tool below is ready to demo during workshops. Switch between phishing emails, link inspector, and
            incident response scripts without leaving the page.
          </p>
        </div>
        <ExperienceLab />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {toolHighlights.map((card) => (
          <article key={card.title} className="surface-card flex flex-col gap-4 p-6">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent/12 text-accent">
              <card.icon className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
            <p className="text-sm text-muted">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="surface-card grid gap-10 p-10">
        <div className="grid gap-3">
          <p className="eyebrow">How the story runs</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Guide your team from curiosity to confident reporting in three beats.
          </h2>
          <p className="text-base text-muted">
            No generic slides. Every beat unlocks an action inside the experience hub so people learn by doing.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {flowSteps.map((step, index) => (
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
          <h2 className="text-2xl font-semibold text-foreground">Support that keeps the session alive.</h2>
          <p className="text-sm text-muted">
            We pair your facilitator with our producers, supply the animations, and make sure every experiment ends with
            a clear action for leadership.
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
            <p className="text-base font-semibold text-foreground">Talk to a specialist</p>
          </div>
          <p>
            Dedicated Slack channel or WhatsApp for Business. We respond inside four working hours with motion tweaks,
            storyline suggestions, and risk summaries.
          </p>
          <p>
            Prefer live coaching? Book a monthly Zoom session with our incident strategist to refine the next interactive
            lab.
          </p>
        </aside>
      </section>

      <section
        id="contact"
        className="surface-card grid gap-6 p-8 text-center md:grid-cols-[minmax(0,1.1fr)_0.9fr] md:items-center md:text-left"
      >
        <div className="grid gap-4">
          <p className="eyebrow">Get Started</p>
          <h2 className="text-3xl font-semibold text-foreground">Ready to host a live cyber awareness lab?</h2>
          <p className="text-sm text-muted">
            Spin up your first simulation, invite the team, and walk through the link inspector and response drill within
            minutes.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-left">
          <Link href="/auth/signup">
            <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted">
              Sign In
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
