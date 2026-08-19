"use client";

import { useEffect, useMemo, useState } from "react";
import { AttractivenessGrid } from "@/components/AttractivenessGrid";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import {
  calculateAttractiveness,
  getRecommendation,
  zoneLabel,
  SHELF_ZONES,
  type AttractivenessResponse,
  type RecommendationResponse,
} from "@/lib/api";

/** Copy overrides so a role dashboard can reframe the same data. */
export type ProductIntelligenceFraming = {
  scoreTitle?: string;
  scoreDescription?: string;
  adviceTitle?: string;
  adviceDescription?: string;
  categories?: Record<string, string>;
};

export function ProductIntelligence({
  token,
  storeId = null,
  framing = {},
  showScores = true,
  showRecommendations = true,
}: {
  token: string;
  /** Scopes scores to one store. Null pools every store's analytics. */
  storeId?: number | null;
  framing?: ProductIntelligenceFraming;
  showScores?: boolean;
  showRecommendations?: boolean;
}) {
  const [scores, setScores] = useState<AttractivenessResponse[]>([]);
  const [recommendations, setRecommendations] = useState<
    RecommendationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Same refresh pattern the other analytics panels use (see HeatmapPanel):
  // fetch once per mount, keyed on the token. Scoring is fully automatic now,
  // so re-entering the dashboard after a video is processed picks up the new
  // attention duration and the score moves with it.
  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    async function loadScores() {
      setLoading(true);
      setError(false);

      try {
        const scored = await Promise.all(
          SHELF_ZONES.map((zone) =>
            calculateAttractiveness(
              { product_name: zoneLabel(zone), zone, store_id: storeId },
              token
            )
          )
        );

        const advice = await Promise.all(
          scored.map((entry) =>
            getRecommendation(
              entry.product_name,
              entry.zone ?? null,
              entry.attractiveness_score,
              token,
              { storeId }
            )
          )
        );

        if (cancelled) return;

        setScores(scored);
        setRecommendations(advice);
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

    loadScores();

    return () => {
      cancelled = true;
    };
  }, [token, storeId]);

  // The recommendation response carries no timestamp of its own. Both panels
  // are built from the same scoring call, so the shelf's analytics timestamp
  // is reused here rather than requesting anything extra.
  const updatedAt = useMemo(() => {
    const byShelf: Record<string, string | null | undefined> = {};

    scores.forEach((entry) => {
      const label = entry.zone ? zoneLabel(entry.zone) : entry.product_name;
      byShelf[label] = entry.analytics_updated_at;
    });

    return byShelf;
  }, [scores]);

  return (
    <>
      {showScores && (
        <AttractivenessGrid
          products={scores}
          loading={loading}
          error={error}
          title={framing.scoreTitle}
          description={framing.scoreDescription}
        />
      )}

      {showRecommendations && (
        <RecommendationsPanel
          results={recommendations}
          title={framing.adviceTitle}
          description={framing.adviceDescription}
          categories={framing.categories}
          updatedAt={updatedAt}
        />
      )}
    </>
  );
}
