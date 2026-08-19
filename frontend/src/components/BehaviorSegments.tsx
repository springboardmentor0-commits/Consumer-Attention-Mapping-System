"use client";

import { Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { tone, type Tone } from "@/lib/tone";
import type { AnalyticsSession } from "@/lib/api";

// Labels written by the backend K-Means segmentation
// (app/services/behavior/segmentation.py). Each is given a semantic tone
// rather than a raw colour so the palette stays in one place.
const SEGMENTS: { label: string; variant: Tone }[] = [
  { label: "Explorer", variant: "behavior" },
  { label: "Quick Buyer", variant: "analytics" },
  { label: "Comparison Shopper", variant: "warning" },
];

export function BehaviorSegments({
  sessions,
}: {
  sessions: AnalyticsSession[];
}) {
  const segmented = sessions.filter((session) => session.segment !== null);

  const distribution = SEGMENTS.map((segment) => {
    const count = segmented.filter(
      (session) => session.segment === segment.label
    ).length;

    const ratio = segmented.length === 0 ? 0 : count / segmented.length;

    return {
      ...segment,
      count,
      // Exact ratio drives the bar so rounding can't overflow the track;
      // the rounded value is only used for display.
      width: ratio * 100,
      share: Math.round(ratio * 100),
    };
  });

  return (
    <Card className="mt-6 animate-fade-in p-6">
      <CardHeader
        icon={<AccentIcon icon={Users} variant="behavior" />}
        title="Shopper Behavioral Segments"
        description="K-Means behavioral classification from completed shopper sessions."
        action={
          <StatusBadge variant={segmented.length > 0 ? "behavior" : "neutral"}>
            {segmented.length} segmented
          </StatusBadge>
        }
      />

      {segmented.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50">
          <p className="text-sm text-ink-muted">
            No behavioral data available yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {distribution.map((segment) => (
              <div
                key={segment.label}
                className="rounded-xl border border-line p-5 transition-colors duration-200 hover:border-line-strong"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full ${tone(segment.variant).bar}`}
                  />

                  <p className="truncate text-sm text-ink-muted">
                    {segment.label}
                  </p>
                </div>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
                  {segment.count}
                </p>

                <p className="mt-1 text-xs text-ink-subtle">
                  shoppers · {segment.share}% of segmented sessions
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-sunken">
              {distribution.map((segment) =>
                segment.count === 0 ? null : (
                  <div
                    key={segment.label}
                    className={`${tone(segment.variant).bar} transition-[width] duration-500 ease-out`}
                    style={{ width: `${segment.width}%` }}
                    title={`${segment.label}: ${segment.count} (${segment.share}%)`}
                  />
                )
              )}
            </div>

            <p className="mt-3 text-xs text-ink-subtle">
              Segment distribution across {segmented.length} segmented
              {segmented.length === 1 ? " session" : " sessions"}.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
