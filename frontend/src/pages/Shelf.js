import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchShelves } from "../api/api";
import {
  ArrowLeft,
  Activity,
  Eye,
  Clock,
  TrendingUp,
  Sparkles,
  Flame,
  BarChart3,
} from "../components/Icons";

const Shelf = () => {
  const { shelfId } = useParams();
  const navigate = useNavigate();

  const [shelf, setShelf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShelfData = async () => {
      const shelves = await fetchShelves(1);
      const target = shelves.find((s) => s.id === Number(shelfId)) || shelves[0];
      setShelf(target);
      setLoading(false);
    };
    loadShelfData();
  }, [shelfId]);

  if (loading || !shelf) {
    return (
      <div className="main-content" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
        Loading shelf details & calculated parameters...
      </div>
    );
  }

  // Calculated Parameters List (Directly from hand-drawn wireframe: "List of Calculated Parameters and details.")
  const calculatedParameters = [
    {
      id: "P01",
      name: "Average Dwell Duration (ADD)",
      formula: "Σ(Gaze Duration) / Total Visitors",
      value: `${shelf.dwell_time_avg} sec`,
      target: "> 35.0 sec",
      status: "Optimal",
      statusColor: "emerald",
      impact: "+18.4% Conversion Correlation",
    },
    {
      id: "P02",
      name: "Total Spatial Gaze Count",
      formula: "Count(YOLO Eye Vector -> Shelf BBox)",
      value: `${shelf.gaze_count} gazes`,
      target: "> 800 gazes",
      status: "Hot Zone",
      statusColor: "cyan",
      impact: "High Shopper Attraction",
    },
    {
      id: "P03",
      name: "Product Attractiveness Score",
      formula: "0.4(Dwell) + 0.4(Gaze) + 0.2(Touch)",
      value: `${shelf.attractiveness_score} / 100`,
      target: "> 85.0",
      status: "Exceptional",
      statusColor: "purple",
      impact: "Top Performing Display",
    },
    {
      id: "P04",
      name: "Pass-by to Gaze Stop Rate",
      formula: "(Shoppers Stopping / Total Aisle Passers) * 100",
      value: `${shelf.engagement_rate}%`,
      target: "> 65.0%",
      status: "Optimal",
      statusColor: "emerald",
      impact: "Strong Eyecatcher Design",
    },
    {
      id: "P05",
      name: "Gaze-to-Pick Ratio (GPR)",
      formula: "Total Product Touch Events / Total Gazes",
      value: "0.48",
      target: "> 0.35",
      status: "High Attention",
      statusColor: "cyan",
      impact: "Direct Purchase Intent",
    },
    {
      id: "P06",
      name: "Average Facial Orientation Angle",
      formula: "Yaw / Pitch degrees offset from shelf normal",
      value: "4.2° Pitch",
      target: "< 12.0°",
      status: "Aligned",
      statusColor: "emerald",
      impact: "Eye-level Ergonomic Position",
    },
  ];

  return (
    <div className="main-content">
      {/* Page Header: Shelf - No - Name (Exact Wireframe Title Format) */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate(-1)}
            className="glass-btn glass-btn-secondary"
            style={{ padding: "0.5rem" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            {/* Shelf - No - Name */}
            <h1 className="page-title">
              Shelf - {shelf.shelf_number} - {shelf.name}
            </h1>
            <p className="page-subtitle">
              Calculated Parameters, Deep Spatial Metrics & YOLO Attention Analytics
            </p>
          </div>
        </div>

        <div className="glass-badge glass-badge-cyan" style={{ padding: "0.4rem 0.8rem" }}>
          <Flame size={14} />
          <span>Category: {shelf.category}</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.75rem",
        }}
      >
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="glass-label">Average Dwell Time</span>
            <Clock size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: "0.4rem 0 0.2rem 0" }}>
            {shelf.dwell_time_avg}s
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--accent-emerald)" }}>+14.2% vs store baseline</div>
        </div>

        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="glass-label">Total Gaze Count</span>
            <Eye size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: "0.4rem 0 0.2rem 0" }}>
            {shelf.gaze_count}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)" }}>Real-time YOLO Tracked</div>
        </div>

        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="glass-label">Attractiveness Score</span>
            <Sparkles size={18} color="var(--accent-pink)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: "0.4rem 0 0.2rem 0" }}>
            {shelf.attractiveness_score}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--accent-pink)" }}>Rank #1 in Category</div>
        </div>

        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="glass-label">Engagement Rate</span>
            <TrendingUp size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: "0.4rem 0 0.2rem 0" }}>
            {shelf.engagement_rate}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--accent-emerald)" }}>High Shopper Retention</div>
        </div>
      </div>

      {/* Main Calculated Parameters Section (As Wireframe specifies) */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.75rem" }}>
        <div className="wireframe-box-header" style={{ marginBottom: "1.25rem" }}>
          <div className="box-title">
            <Activity size={22} color="var(--accent-cyan)" />
            <span>List of Calculated Parameters and Details</span>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Calculated via Computer Vision & YOLO Inference Pipeline
          </div>
        </div>

        {/* Glassmorphism Table of Calculated Parameters */}
        <div style={{ overflowX: "auto" }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Parameter Name</th>
                <th>Mathematical Calculation Formula</th>
                <th>Calculated Value</th>
                <th>Optimal Target</th>
                <th>Status</th>
                <th>AI Impact & Insight</th>
              </tr>
            </thead>
            <tbody>
              {calculatedParameters.map((param) => (
                <tr key={param.id}>
                  <td style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>{param.id}</td>
                  <td style={{ fontWeight: 700, color: "#fff" }}>{param.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.775rem", color: "var(--text-muted)" }}>
                    {param.formula}
                  </td>
                  <td style={{ fontWeight: 800, color: "#fff", fontSize: "0.95rem" }}>
                    {param.value}
                  </td>
                  <td style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>{param.target}</td>
                  <td>
                    <span className={`glass-badge glass-badge-${param.statusColor}`}>
                      {param.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.825rem", color: "var(--accent-emerald)" }}>
                    {param.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* AI Recommendations */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <span>AI Attention Recommendations</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="glass-card" style={{ background: "rgba(0, 242, 254, 0.05)", borderColor: "rgba(0, 242, 254, 0.2)" }}>
              <strong style={{ color: "#fff", display: "block", marginBottom: "0.2rem" }}>Optimal Product Placement</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Move high-margin wearables to the central 1.4m height zone of Shelf {shelf.shelf_number} to capture 24% higher gaze retention.
              </p>
            </div>
            <div className="glass-card" style={{ background: "rgba(121, 40, 202, 0.05)", borderColor: "rgba(121, 40, 202, 0.2)" }}>
              <strong style={{ color: "#fff", display: "block", marginBottom: "0.2rem" }}>Lighting Contrast Adjustment</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Increase spotlight luminance by +15% to expand visual heatmap radius by 1.2 meters.
              </p>
            </div>
          </div>
        </div>

        {/* Shopper Hourly Trend */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart3 size={18} color="var(--accent-purple)" />
            <span>Hourly Attention Distribution</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              { time: "10:00 AM - 12:00 PM", intensity: 62 },
              { time: "12:00 PM - 03:00 PM", intensity: 88 },
              { time: "03:00 PM - 06:00 PM", intensity: 96 },
              { time: "06:00 PM - 09:00 PM", intensity: 74 },
            ].map((h, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.775rem", color: "var(--text-muted)", width: "130px" }}>{h.time}</span>
                <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${h.intensity}%`,
                      background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", width: "35px" }}>{h.intensity}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shelf;
