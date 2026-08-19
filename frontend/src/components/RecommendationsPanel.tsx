"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { priorityTone } from "@/lib/tone";
import type { RecommendationResponse } from "@/lib/api";

// The backend returns { product, shelf, score, priority, recommendations } —
// there is no category field on the response. The category shown here is a
// display label derived from the priority the rule engine already returned,
// so no new data is invented and no extra request is made.
export const DEFAULT_CATEGORIES: Record<string, string> = {
  High: "Immediate action",
  Medium: "Optimization",
  Low: "Monitoring",
  Excellent: "Maintain",
};

function formatTimestamp(value: string | null | undefined) {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.valueOf()) ? null : parsed.toLocaleString();
}

export function RecommendationsPanel({
  results,
  title = "Optimization Recommendations",
  description = "Automated recommendations generated from product performance.",
  categories = DEFAULT_CATEGORIES,
  updatedAt,
}: {
  results: RecommendationResponse[];
  /** Headline copy, so a role dashboard can reframe the same data. */
  title?: string;
  description?: string;
  /** Priority to category label, overridable per role framing. */
  categories?: Record<string, string>;
  /** Shelf zone to analytics timestamp, sourced from the scoring response. */
  updatedAt?: Record<string, string | null | undefined>;
}) {
  return (
    <Card className="mt-6 animate-fade-in p-6">
      <CardHeader
        icon={<AccentIcon icon={Lightbulb} variant="ai" />}
        title={title}
        description={description}
        action={
          results.length > 0 ? (
            <StatusBadge variant="ai">
              {results.length} {results.length === 1 ? "shelf" : "shelves"}
            </StatusBadge>
          ) : undefined
        }
      />

      {results.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50 px-6">
          <p className="text-center text-sm text-ink-muted">
            No recommendations available yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const variant = priorityTone(result.priority);
            const category = categories[result.priority] ?? result.priority;
            const timestamp = formatTimestamp(updatedAt?.[result.shelf]);

            return (
              <div
                key={result.shelf}
                className="rounded-xl border border-line bg-surface-sunken/50 p-4 transition-colors duration-200 hover:border-line-strong"
              >
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {result.shelf}
                    </p>

                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {category}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge variant={variant}>
                      {result.priority} priority
                    </StatusBadge>

                    <span className="text-sm font-medium tabular-nums text-ink-muted">
                      Score {result.score}
                    </span>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {result.recommendations.map((message) => (
                    <li
                      key={message}
                      className="flex gap-2 text-sm text-ink-muted"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          variant === "neutral" ? "bg-ink-subtle" : "bg-ai-base"
                        }`}
                      />
                      {message}
                    </li>
                  ))}
                </ul>

                {timestamp && (
                  <p className="mt-3 border-t border-line pt-2.5 text-xs text-ink-subtle">
                    Based on analytics from {timestamp}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
