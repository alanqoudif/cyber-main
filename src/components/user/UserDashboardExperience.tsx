"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Check, Link2, MailWarning, Sparkles } from "lucide-react";
import { PhishingTool } from "./PhishingTool";
import { LinksTool } from "./LinksTool";
import { ExperienceFeedbackPrompt } from "./ExperienceFeedbackPrompt";

type ToolKey = "phishing" | "links";

type ToolConfig = {
  key: ToolKey;
  label: string;
  summary: string;
  heroTitle: string;
  heroCopy: string;
  backdrop: string;
  icon: LucideIcon;
  takeaways: string[];
};

const toolConfigs: Record<ToolKey, ToolConfig> = {
  phishing: {
    key: "phishing",
    label: "Phishing Drill",
    summary: "Inspect the inbox, surface every flag, and practice the safest response.",
    heroTitle: "Master the inbox before attackers do.",
    heroCopy:
      "Trigger sender reveals, hover suspicious links, and choose how to react. The drill grades every decision instantly so the learning sticks.",
    backdrop:
      "radial-gradient(circle at 18% 22%, rgba(244, 114, 182, 0.28), transparent 58%), radial-gradient(circle at 78% 18%, rgba(59, 130, 246, 0.16), transparent 62%), radial-gradient(circle at 50% 120%, rgba(14, 23, 52, 0.35), transparent 68%)",
    icon: MailWarning,
    takeaways: [
      "Expose sender metadata without opening the payload.",
      "Spot look-alike URLs and urgency hooks before you click.",
      "Report confidently with a single button when the lure feels wrong.",
    ],
  },
  links: {
    key: "links",
    label: "Link Sandbox",
    summary: "Drop any URL into a sandboxed browser frame and watch each inspection stage.",
    heroTitle: "See what the browser uncovers in seconds.",
    heroCopy:
      "Follow the animated scanning pipeline—protocol checks, reputation intel, and behavioural sandboxing—so you understand exactly why a verdict fires.",
    backdrop:
      "radial-gradient(circle at 22% 24%, rgba(56, 189, 248, 0.26), transparent 58%), radial-gradient(circle at 72% 16%, rgba(129, 140, 248, 0.18), transparent 60%), radial-gradient(circle at 50% 120%, rgba(16, 24, 48, 0.32), transparent 70%)",
    icon: Link2,
    takeaways: [
      "Validate TLS, certificates, and host alignment on the fly.",
      "Visualise redirects, forced downloads, and hidden payloads.",
      "Share the sandbox verdict with your team before acting on the link.",
    ],
  },
};

const toolOrder: ToolKey[] = ["phishing", "links"];

export function UserDashboardExperience() {
  const [activeTool, setActiveTool] = useState<ToolKey>("phishing");
  const activeConfig = toolConfigs[activeTool];

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-border/70 bg-surface/90 px-6 py-8 shadow-xl backdrop-blur md:px-10 md:py-10">
      <motion.div
        key={`${activeTool}-backdrop`}
        className="absolute inset-0 z-0 opacity-70"
        style={{ background: activeConfig.backdrop }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <motion.div
            key={`${activeTool}-hero`}
            className="max-w-2xl space-y-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Active simulation
            </span>
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{activeConfig.heroTitle}</h2>
            <p className="text-sm text-foreground/80 md:text-base">{activeConfig.heroCopy}</p>
          </motion.div>

          <div className="flex flex-col gap-3 md:max-w-xs">
            {toolOrder.map((toolKey) => {
              const tool = toolConfigs[toolKey];
              const Icon = tool.icon;
              const isActive = toolKey === activeTool;

              return (
                <motion.button
                  key={tool.key}
                  type="button"
                  onClick={() => setActiveTool(tool.key)}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
                    isActive
                      ? "border-accent/70 bg-background/95 text-foreground shadow-md"
                      : "border-border/60 bg-surface/70 text-muted hover:text-foreground"
                  }`}
                  aria-pressed={isActive}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className={`inline-flex size-10 items-center justify-center rounded-full ${isActive ? "bg-accent/15 text-accent" : "bg-surface-muted text-muted"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold">{tool.label}</span>
                    <span className="block text-xs leading-5 text-muted">{tool.summary}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`tool-${activeTool}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid gap-4"
          >
            {activeTool === "phishing" ? <PhishingTool /> : <LinksTool />}
          </motion.div>
        </AnimatePresence>

        <motion.ul
          key={`takeaways-${activeTool}`}
          className="grid gap-3 rounded-3xl border border-border/70 bg-background/90 px-4 py-4 text-sm text-foreground/85 md:grid-cols-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {activeConfig.takeaways.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/80 px-4 py-3 text-xs leading-5 md:text-sm">
              <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Check className="h-3 w-3" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </motion.ul>

        <ExperienceFeedbackPrompt activeTool={activeTool} />
      </div>
    </section>
  );
}
