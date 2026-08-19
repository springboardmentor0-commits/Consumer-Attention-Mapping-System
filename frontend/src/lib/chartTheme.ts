// Recharts styling drawn from the same design tokens as the rest of the app
// (see the @theme block in globals.css). Values are `var(--color-…)` strings
// rather than hex so a palette change lands here too, with no second source
// of colour to keep in sync.

export const CHART_COLORS = {
  analytics: "var(--color-analytics-base)",
  healthy: "var(--color-healthy-base)",
  warning: "var(--color-warning-base)",
  critical: "var(--color-critical-base)",
  ai: "var(--color-ai-base)",
  behavior: "var(--color-behavior-base)",
} as const;

export const CHART_INK = {
  grid: "var(--color-line)",
  axis: "var(--color-line-strong)",
  tick: "var(--color-ink-muted)",
} as const;

/** Shared axis tick styling — 12px, muted, tabular so digits align. */
export const axisTick = {
  fill: CHART_INK.tick,
  fontSize: 12,
} as const;

/** Shared tooltip chrome. Rendered as an HTML div, so tokens resolve here. */
export const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-line)",
  boxShadow: "0 8px 24px -8px rgb(15 23 42 / 0.12)",
  fontSize: 12,
  color: "var(--color-ink)",
  padding: "8px 12px",
} as const;

export const tooltipCursor = {
  fill: "var(--color-surface-sunken)",
} as const;
