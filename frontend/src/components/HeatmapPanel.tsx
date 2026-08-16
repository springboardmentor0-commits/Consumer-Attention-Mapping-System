"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { fetchStoreHeatmap, type HeatmapResult } from "@/lib/api";

export function HeatmapPanel({ token }: { token: string }) {
  const [result, setResult] = useState<HeatmapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    async function loadHeatmap() {
      setLoading(true);
      setError(false);

      try {
        const heatmap = await fetchStoreHeatmap(token);

        if (cancelled) {
          // Nothing will render this blob, so release it immediately.
          if (heatmap.status === "ready") {
            URL.revokeObjectURL(heatmap.imageUrl);
          }
          return;
        }

        if (heatmap.status === "ready") {
          objectUrl = heatmap.imageUrl;
        }

        setResult(heatmap);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHeatmap();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [token]);

  return (
    <Card className="mt-6 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Store Traffic Heatmap
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Shopper movement hotspots from the latest video stream.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          Live Analytics
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading heatmap…</p>
      ) : error ? (
        <p className="text-sm text-red-600">Failed to load heatmap.</p>
      ) : result?.status === "pending" ? (
        <p className="text-sm text-slate-500">{result.message}</p>
      ) : result?.status === "ready" ? (
        <div className="flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
          {/* Capped height keeps the panel compact; w-auto/max-w-full let the
              browser preserve the source aspect ratio and avoid upscaling the
              backend-generated image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.imageUrl}
            alt="Store traffic heatmap"
            className="h-auto max-h-[480px] w-auto max-w-full object-contain"
          />
        </div>
      ) : null}
    </Card>
  );
}
