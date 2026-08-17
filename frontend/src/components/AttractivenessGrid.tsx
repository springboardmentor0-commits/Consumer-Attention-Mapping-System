"use client";

import { Card } from "@/components/ui/Card";
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

export function AttractivenessGrid({
  products,
  loading = false,
  error = false,
}: {
  products: AttractivenessResponse[];
  loading?: boolean;
  error?: boolean;
}) {
  return (
    <Card className="mt-6 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Product Attractiveness Scoring
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Scored automatically from camera analytics. No manual input
            required.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          Live Analytics
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading scores…</p>
      ) : error ? (
        <p className="text-sm text-red-600">
          Failed to load attractiveness scores.
        </p>
      ) : products.length === 0 ? (
        <p className="text-sm text-slate-500">
          No shelf zones available to score yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.zone ?? product.product_name}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-medium text-slate-900">
                  {product.zone
                    ? zoneLabel(product.zone)
                    : product.product_name}
                </p>

                <span className="shrink-0 text-lg font-semibold text-emerald-600">
                  {product.attractiveness_score}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${product.attractiveness_score}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Last updated {lastUpdated(product.analytics_updated_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
