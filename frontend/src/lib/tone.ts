// Maps a semantic tone onto the concrete utility classes each shared
// primitive uses. Components pick a tone by meaning ("critical", "ai") and
// never reach for a raw colour, so the accent palette in globals.css stays
// the single place a colour is defined.
//
// Class strings are written out in full rather than composed at runtime —
// Tailwind scans source text, so `bg-${tone}-soft` would not be generated.

export type Tone =
  | "analytics"
  | "healthy"
  | "warning"
  | "critical"
  | "ai"
  | "behavior"
  | "neutral";

export type ToneStyles = {
  /** Tinted square behind an icon. */
  icon: string;
  /** Pill badge: tinted background, readable text. */
  badge: string;
  /** Solid fill for progress bars and rails. */
  bar: string;
  /** Text in the accent colour, for values and trends. */
  text: string;
  /** Left edge accent on a card. */
  edge: string;
};

export const TONES: Record<Tone, ToneStyles> = {
  analytics: {
    icon: "bg-analytics-soft text-analytics-strong",
    badge: "bg-analytics-soft text-analytics-strong",
    bar: "bg-analytics-base",
    text: "text-analytics-strong",
    edge: "bg-analytics-base",
  },

  healthy: {
    icon: "bg-healthy-soft text-healthy-strong",
    badge: "bg-healthy-soft text-healthy-strong",
    bar: "bg-healthy-base",
    text: "text-healthy-strong",
    edge: "bg-healthy-base",
  },

  warning: {
    icon: "bg-warning-soft text-warning-strong",
    badge: "bg-warning-soft text-warning-strong",
    bar: "bg-warning-base",
    text: "text-warning-strong",
    edge: "bg-warning-base",
  },

  critical: {
    icon: "bg-critical-soft text-critical-strong",
    badge: "bg-critical-soft text-critical-strong",
    bar: "bg-critical-base",
    text: "text-critical-strong",
    edge: "bg-critical-base",
  },

  ai: {
    icon: "bg-ai-soft text-ai-strong",
    badge: "bg-ai-soft text-ai-strong",
    bar: "bg-ai-base",
    text: "text-ai-strong",
    edge: "bg-ai-base",
  },

  behavior: {
    icon: "bg-behavior-soft text-behavior-strong",
    badge: "bg-behavior-soft text-behavior-strong",
    bar: "bg-behavior-base",
    text: "text-behavior-strong",
    edge: "bg-behavior-base",
  },

  neutral: {
    icon: "bg-surface-sunken text-ink-muted",
    badge: "bg-surface-sunken text-ink-muted",
    bar: "bg-ink-subtle",
    text: "text-ink-muted",
    edge: "bg-line-strong",
  },
};

export function tone(name: Tone = "neutral"): ToneStyles {
  return TONES[name];
}

// Score-to-tone banding shared by attractiveness cards and any other
// 0-100 figure. Thresholds mirror the rule engine in
// backend/app/services/recommendations.py so the colour agrees with the
// advice shown beside it.
export function scoreTone(score: number): Tone {
  if (score >= 80) return "healthy";
  if (score >= 60) return "analytics";
  if (score >= 40) return "warning";
  return "critical";
}

// Priority as returned by the backend rule engine.
export function priorityTone(priority: string): Tone {
  switch (priority) {
    case "Excellent":
      return "healthy";
    case "Low":
      return "analytics";
    case "Medium":
      return "warning";
    case "High":
      return "critical";
    default:
      return "neutral";
  }
}
