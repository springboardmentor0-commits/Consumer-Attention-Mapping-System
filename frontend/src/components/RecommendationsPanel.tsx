"use client";

import { Card } from "@/components/ui/Card";
import type { RecommendationResponse } from "@/lib/api";

export function RecommendationsPanel({
  results,
}: {
  results: RecommendationResponse[];
}) {
  return (
    <Card className="mt-6 p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Optimization Recommendations
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Automated recommendations generated from product performance.
        </p>
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-slate-500">
          No recommendations available yet. Score a product above to populate
          this section.
        </p>
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.product_name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-medium text-slate-800">
                  {result.product_name}
                </p>

                <span className="shrink-0 text-sm font-medium text-slate-500">
                  Score {result.attractiveness_score}
                </span>
              </div>

              <ul className="mt-2 space-y-1.5">
                {result.recommendations.map((message) => (
                  <li
                    key={message}
                    className="flex gap-2 text-sm text-slate-600"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                    />
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
