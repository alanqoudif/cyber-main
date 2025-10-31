"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { trackExperienceEvent } from "@/lib/telemetry";
import { MessageCircle, Smile, Meh, Frown, Loader2, CheckCircle2 } from "lucide-react";

type FeedbackMood = "positive" | "neutral" | "negative";

const moodOptions: Array<{
  value: FeedbackMood;
  label: string;
  description: string;
  icon: typeof Smile;
}> = [
  {
    value: "positive",
    label: "Helpful",
    description: "Flow feels smooth and instructive.",
    icon: Smile,
  },
  {
    value: "neutral",
    label: "Decent",
    description: "Some friction or missing cues.",
    icon: Meh,
  },
  {
    value: "negative",
    label: "Needs work",
    description: "Hard to follow or confusing.",
    icon: Frown,
  },
];

interface ExperienceFeedbackPromptProps {
  activeTool: "phishing" | "links";
}

export function ExperienceFeedbackPrompt({ activeTool }: ExperienceFeedbackPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<FeedbackMood | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const heading = useMemo(
    () => (activeTool === "phishing" ? "How did the phishing drill land?" : "Does the link sandbox pace feel right?"),
    [activeTool]
  );

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    setStatus("idle");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mood && !notes.trim()) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    trackExperienceEvent("experience_feedback_submitted", {
      tool: activeTool,
      mood,
      notes: notes.trim() || null,
    });
    setStatus("sent");
    setNotes("");
    setMood(null);
    setTimeout(() => {
      setStatus("idle");
      setIsOpen(false);
    }, 2200);
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-surface/85 px-5 py-5 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-foreground transition hover:text-accent"
      >
        <span className="inline-flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-accent" />
          Share quick feedback
        </span>
        <span className="text-xs uppercase tracking-[0.24em] text-muted">{isOpen ? "Close" : "Open"}</span>
      </button>

      {isOpen && (
        <form className="mt-4 grid gap-4 text-sm" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted">{heading}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {moodOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = mood === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(isSelected ? null : option.value)}
                    className={`flex-1 rounded-2xl border px-3 py-3 text-left transition ${
                      isSelected
                        ? "border-accent/60 bg-accent/10 text-foreground shadow-sm"
                        : "border-border/60 bg-surface text-muted hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-accent" : "text-muted"}`} />
                      <span className="text-sm font-semibold">{option.label}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="grid gap-2 text-xs text-muted">
            What would make this flow clearer?
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Timing, copy, or motion cues you would adjust…"
              className="min-h-[96px] rounded-2xl border border-border/60 bg-background/95 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </label>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={status === "sending" || status === "sent"}
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : status === "sent" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Logged
                </>
              ) : (
                "Submit"
              )}
            </Button>

            {status === "error" && <span className="text-xs text-red-600">Pick a mood or add a quick note.</span>}
            {status === "sent" && <span className="text-xs text-muted">Thanks! We will tune the flow.</span>}
          </div>
        </form>
      )}
    </div>
  );
}
