"use client";

import { useEffect, useState } from "react";
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

export function ProductIntelligence({ token }: { token: string }) {
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
              { product_name: zoneLabel(zone), zone },
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
              token
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
  }, [token]);

  return (
    <>
      <AttractivenessGrid
        products={scores}
        loading={loading}
        error={error}
      />

      <RecommendationsPanel results={recommendations} />
    </>
  );
}
