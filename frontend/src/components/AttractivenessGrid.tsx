"use client";

import { Sparkles } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { scoreTone, tone } from "@/lib/tone";
import { zoneLabel, type AttractivenessResponse } from "@/lib/api";

function lastUpdated(value: string | null | undefined) {
  if (!value) {
    return "Awaiting analytics";
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.valueOf())
    ? "Awaiting analytics"
    : parsed.toLocaleString();
}

// Display band for a 0-100 score. Presentation only — the score itself is
// whatever the backend scoring engine returned.
function scoreBand(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Moderate";
  return "Needs attention";
}

export function AttractivenessGrid({
  products,
  loading = false,
  error = false,
  title = "Product Attractiveness Scoring",
  description = "Scored automatically from camera analytics. No manual input required.",
}: {
  products: AttractivenessResponse[];
  loading?: boolean;
  error?: boolean;
  /** Headline copy, so a role dashboard can reframe the same data. */
  title?: string;
  description?: string;
}) {
  return (
    <Card className="mt-6 animate-fade-in p-6">
      <CardHeader
        icon={<AccentIcon icon={Sparkles} variant="ai" />}
        title={title}
        description={description}
        action={
          <StatusBadge variant="ai">Camera analytics</StatusBadge>
        }
      />

      {loading ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50">
          <p className="text-sm text-ink-muted">Loading scores…</p>
        </div>
      ) : error ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-critical-soft bg-critical-soft/40 px-6">
          <p className="text-center text-sm text-critical-strong">
            Failed to load attractiveness scores.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50 px-6">
          <p className="text-center text-sm text-ink-muted">
            No shelf zones available to score yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => {
            const score = product.attractiveness_score;
            const variant = scoreTone(score);

            return (
              <div
                key={product.zone ?? product.product_name}
                className="rounded-xl border border-line p-5 transition-colors duration-200 hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {product.zone
                        ? zoneLabel(product.zone)
                        : product.product_name}
                    </p>

                    <p className="mt-0.5 text-xs text-ink-subtle">
                      Attractiveness score
                    </p>
                  </div>

                  <StatusBadge variant={variant}>
                    {scoreBand(score)}
                  </StatusBadge>
                </div>

                <p
                  className={`mt-3 text-3xl font-semibold tracking-tight tabular-nums ${tone(variant).text}`}
                >
                  {score}
                  <span className="ml-1 text-sm font-normal text-ink-subtle">
                    / 100
                  </span>
                </p>

                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-surface-sunken"
                  role="progressbar"
                  aria-valuenow={score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Attractiveness score"
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ease-out ${tone(variant).bar}`}
                    style={{ width: `${score}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-ink-subtle">
                  Last updated {lastUpdated(product.analytics_updated_at)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
