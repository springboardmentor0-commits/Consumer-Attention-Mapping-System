import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import VisitorCard from "../components/analytics/VisitorCard";
import ProductRanking from "../components/analytics/ProductRanking";
import HeatMap from "../components/analytics/HeatMap";
import TrafficChart from "../components/analytics/TrafficChart";

import { Button } from "@/components/ui/button";
import "./Analytics.css";

import api from "../services/api";

const POLL_INTERVAL_MS = 15000;

export default function Analytics() {
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState(null);
  const [products, setProducts] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/", { replace: true });
    }
  }, [navigate]);

  const loadAll = useCallback(async () => {
    try {
      const [visitorsRes, productsRes, heatmapRes, trafficRes] = await Promise.all([
        api.get("/analytics/current-visitors").then(res => res.data),
        api.get("/analytics/products").then(res => res.data),
        api.get("/analytics/heatmap").then(res => res.data),
        api.get("/analytics/traffic").then(res => res.data),
      ]);
      setVisitors(visitorsRes.count);
      setProducts(productsRes);
      setHeatmap(heatmapRes);
      setTraffic(trafficRes);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div>
            <h1 className="analytics-title">
            Consumer Attention Mapping
            </h1>
            <p className="analytics-subtitle">Live store analytics</p>
        </div>
        <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
        </Button>
      </header>

      {error && (
        <div className="analytics-error">
          Couldn't refresh dashboard data: {error}
        </div>
      )}

      <div className="analytics-grid-top">
        <VisitorCard count={visitors} />
        <div className="analytics-traffic-wrapper">
          <TrafficChart data={traffic} />
        </div>
      </div>

      <div className="analytics-grid-bottom">
        <ProductRanking products={products} />
        <HeatMap points={heatmap} />
      </div>
    </div>
  );
}
