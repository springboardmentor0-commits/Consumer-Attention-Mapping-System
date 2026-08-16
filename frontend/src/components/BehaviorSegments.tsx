"use client";

import { Card } from "@/components/ui/Card";
import type { AnalyticsSession } from "@/lib/api";

// Labels written by the backend K-Means segmentation
// (app/services/behavior/segmentation.py). Raw session-level metrics stay in
// the analytics table for journey analytics and detailed reports; this panel
// only shows the distribution.
const SEGMENTS = [
  { label: "Explorer", color: "bg-emerald-500" },
  { label: "Quick Buyer", color: "bg-sky-500" },
  { label: "Comparison Shopper", color: "bg-amber-500" },
] as const;

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
    <Card className="mt-6 p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Shopper Behavioral Segments
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          K-Means behavioral classification from completed shopper sessions.
        </p>
      </div>

      {segmented.length === 0 ? (
        <p className="text-sm text-slate-500">
          No behavioral data available yet.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {distribution.map((segment) => (
              <div
                key={segment.label}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full ${segment.color}`}
                  />

                  <p className="text-sm text-slate-500">{segment.label}</p>
                </div>

                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {segment.count}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  shoppers · {segment.share}% of segmented sessions
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
              {distribution.map((segment) =>
                segment.count === 0 ? null : (
                  <div
                    key={segment.label}
                    className={segment.color}
                    style={{ width: `${segment.width}%` }}
                    title={`${segment.label}: ${segment.count} (${segment.share}%)`}
                  />
                )
              )}
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Segment distribution across {segmented.length} segmented
              {segmented.length === 1 ? " session" : " sessions"}.
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
