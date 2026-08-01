import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchSummary,
  fetchProductRankings,
  fetchHeatmap,
  fetchTraffic,
  fetchRecommendations,
  fetchAttentionData,
} from "../api/analyticsApi";

import { Button } from "@/components/ui/button";
import StatisticsCard from "../components/analytics/StatisticsCard";
import ProductRanking from "../components/analytics/ProductRanking";
import TrafficChart from "../components/analytics/TrafficChart";
import HeatMap from "../components/analytics/HeatMap";
import RecommendationCard from "../components/analytics/RecommendationCard";
import ShelfAttentionChart from "../components/analytics/ShelfAttentionChart";

import "./AnalyticsDashboard.css";

const POLL_INTERVAL_MS = 15000;

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [attention, setAttention] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, productsRes, heatmapRes, trafficRes, recommendationsRes, attentionRes] = await Promise.all([
        fetchSummary(),
        fetchProductRankings(),
        fetchHeatmap(),
        fetchTraffic(),
        fetchRecommendations(),
        fetchAttentionData().catch(() => []),
      ]);

      setSummary(summaryRes);
      setProducts(productsRes);
      setHeatmap(heatmapRes);
      setTraffic(trafficRes);
      setRecommendations(recommendationsRes);
      setAttention(attentionRes);
      setError(null);
    } catch (err) {
      setError(err.message || "Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Store Analytics</h1>
          <p className="dashboard-subtitle">Real-time consumer behavior insights</p>
        </div>
        <Button onClick={() => navigate("/dashboard")}>Back</Button>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-grid summary-grid">
        <StatisticsCard
          title="Current Visitors"
          value={summary?.current_visitors ?? "—"}
          subtitle="People in store now"
        />
        <StatisticsCard
          title="Total Visitors"
          value={summary?.total_visitors ?? "—"}
          subtitle="In the last 24 hours"
        />
        <StatisticsCard
          title="Average Dwell"
          value={summary?.average_dwell_time ? `${summary.average_dwell_time}s` : "—"}
          subtitle="Avg time per zone"
        />
        <StatisticsCard
          title="Top Product"
          value={summary?.top_product ?? "—"}
          subtitle={summary?.peak_hour ? `Peak: ${summary.peak_hour}` : ""}
        />
      </section>

      <section className="dashboard-grid chart-grid mb-6">
        <TrafficChart data={traffic} />
        <ShelfAttentionChart data={attention} />
      </section>

      <section className="dashboard-grid chart-grid">
        <div className="dashboard-flex-column col-span-2">
          <ProductRanking products={products} />
          <HeatMap points={heatmap} />
        </div>
      </section>


      <section className="dashboard-grid recs-grid">
        {recommendations.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-500">
            No recommendations available yet.
          </div>
        ) : (
          recommendations.map((item, index) => (
            <RecommendationCard
              key={`${item.priority}-${index}`}
              priority={item.priority}
              message={item.message}
            />
          ))
        )}
      </section>

      {loading && <div className="dashboard-loading">Loading analytics...</div>}
    </div>
  );
}
