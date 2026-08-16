"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { AttractivenessGrid } from "@/components/AttractivenessGrid";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import {
  calculateAttractiveness,
  getRecommendation,
  type AttractivenessResponse,
  type ProductMetrics,
  type RecommendationResponse,
} from "@/lib/api";

// The backend scoring/recommendation endpoints are stateless calculators:
// there is no product table, so the metrics have to be supplied per request.
// Every score and message below comes back from the backend — nothing is
// computed here.
const METRIC_FIELDS = [
  { key: "attention_duration", label: "Attention Duration" },
  { key: "interaction_frequency", label: "Interaction Frequency" },
  { key: "pickup_rate", label: "Pickup Rate" },
  { key: "conversion_rate", label: "Conversion Rate" },
  { key: "repeat_engagement", label: "Repeat Engagement" },
] as const;

type MetricKey = (typeof METRIC_FIELDS)[number]["key"];

const EMPTY_METRICS: Record<MetricKey, string> = {
  attention_duration: "",
  interaction_frequency: "",
  pickup_rate: "",
  conversion_rate: "",
  repeat_engagement: "",
};

export function ProductIntelligence({ token }: { token: string }) {
  const [productName, setProductName] = useState("");
  const [metrics, setMetrics] =
    useState<Record<MetricKey, string>>(EMPTY_METRICS);
  const [scores, setScores] = useState<AttractivenessResponse[]>([]);
  const [recommendations, setRecommendations] = useState<
    RecommendationResponse[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setMetric(key: MetricKey, value: string) {
    setMetrics((current) => ({ ...current, [key]: value }));
  }

  // Replace an existing entry for the same product rather than duplicating it.
  function upsert<T extends { product_name: string }>(
    list: T[],
    entry: T
  ): T[] {
    const index = list.findIndex(
      (item) => item.product_name === entry.product_name
    );

    if (index === -1) {
      return [...list, entry];
    }

    const next = [...list];
    next[index] = entry;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = productName.trim();

    if (!name) {
      setError("Product name is required.");
      return;
    }

    const values = METRIC_FIELDS.map(({ key }) => Number(metrics[key]));

    if (
      values.some(
        (value) => !Number.isFinite(value) || value < 0 || value > 100
      )
    ) {
      setError("Every metric must be a number between 0 and 100.");
      return;
    }

    const payload: ProductMetrics = {
      product_name: name,
      attention_duration: values[0],
      interaction_frequency: values[1],
      pickup_rate: values[2],
      conversion_rate: values[3],
      repeat_engagement: values[4],
    };

    setSubmitting(true);
    setError("");

    try {
      const score = await calculateAttractiveness(payload, token);

      const recommendation = await getRecommendation(
        payload,
        score.attractiveness_score,
        token
      );

      setScores((current) => upsert(current, score));
      setRecommendations((current) => upsert(current, recommendation));

      setProductName("");
      setMetrics(EMPTY_METRICS);
    } catch (err) {
      console.error(err);
      setError("Failed to score product. Check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card className="mt-6 p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Score a Product
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Submit product metrics (0–100) to the backend scoring and
            recommendation engines.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="product_name"
                className="text-sm font-medium text-slate-700"
              >
                Product Name
              </label>

              <input
                id="product_name"
                type="text"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder="e.g. Cereal Box 500g"
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            {METRIC_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="text-sm font-medium text-slate-700"
                >
                  {label}
                </label>

                <input
                  id={key}
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  value={metrics[key]}
                  onChange={(event) => setMetric(key, event.target.value)}
                  placeholder="0–100"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-5">
            {submitting ? "Scoring…" : "Score Product"}
          </Button>
        </form>
      </Card>

      <AttractivenessGrid products={scores} />

      <RecommendationsPanel results={recommendations} />
    </>
  );
}
