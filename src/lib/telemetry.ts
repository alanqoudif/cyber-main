"use client";

type ExperienceEventName =
  | "phishing_clue_revealed"
  | "phishing_decision_made"
  | "phishing_drill_reset"
  | "link_scan_started"
  | "link_scan_completed"
  | "link_phase_transition"
  | "experience_feedback_submitted";

export function trackExperienceEvent(
  event: ExperienceEventName,
  payload?: Record<string, unknown>
) {
  if (typeof window === "undefined") {
    return;
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
