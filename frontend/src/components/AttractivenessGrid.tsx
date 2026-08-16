"use client";

import { Card } from "@/components/ui/Card";
import type { AttractivenessResponse } from "@/lib/api";

export function AttractivenessGrid({
  products,
}: {
  products: AttractivenessResponse[];
}) {
  return (
    <Card className="mt-6 p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Product Attractiveness
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Weighted product performance score from 0 to 100, computed by the
          backend scoring engine.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">
          No product scores available yet. Score a product above to populate
          this section.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.product_name}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-medium text-slate-900">
                  {product.product_name}
                </p>

                <span className="text-lg font-semibold text-emerald-600">
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

              <p className="mt-2 text-xs text-slate-400">
                Attractiveness Score
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
