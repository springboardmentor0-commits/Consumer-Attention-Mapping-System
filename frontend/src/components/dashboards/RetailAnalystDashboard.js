import React from "react";
import { Link } from "react-router-dom";

function RetailAnalystDashboard() {
  return (
    <div className="role-dashboard retail-analyst-dash">
      {/* ── KPI Summary Grid ────────────────────────────── */}
      <div className="kpi-grid">
        <div className="kpi-card accent-purple">
          <div className="kpi-header">
            <span className="kpi-icon">🧠</span>
            <span className="kpi-trend positive">5 Segments</span>
          </div>
          <span className="kpi-label">Shopper Segment Distribution</span>
          <strong className="kpi-value">35.1% Explorers</strong>
          <p className="kpi-sub">Quick Buyers: 22.0% | Comparison: 18.6%</p>
        </div>

        <div className="kpi-card accent-crimson">
          <div className="kpi-header">
            <span className="kpi-icon">🔥</span>
            <span className="kpi-trend positive">98% Hotspot</span>
          </div>
          <span className="kpi-label">Peak Attention Hotspot</span>
          <strong className="kpi-value">Central Feature Island</strong>
          <p className="kpi-sub">Grid X=10, Y=7 (2.4s avg gaze)</p>
        </div>

        <div className="kpi-card accent-gold">
          <div className="kpi-header">
            <span className="kpi-icon">🏆</span>
            <span className="kpi-trend positive">Top: 92.4 (A+)</span>
          </div>
          <span className="kpi-label">Avg Attractiveness Score</span>
          <strong className="kpi-value">75.4 / 100</strong>
          <p className="kpi-sub">35/25/20/15/5 Weighted Model</p>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-header">
            <span className="kpi-icon">🗺️</span>
            <span className="kpi-trend positive">68.4% Converted</span>
          </div>
          <span className="kpi-label">Avg Journey Duration</span>
          <strong className="kpi-value">4.1 mins</strong>
          <p className="kpi-sub">Entrance to Checkout Funnel</p>
        </div>
      </div>

      {/* ── Behavior & Heatmaps Split ───────────────────── */}
      <div className="dash-two-col">
        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>🧠 Consumer Behavior Analytics</h3>
              <p className="muted">Spatial velocity, category navigation, and segment classifications</p>
            </div>
            <Link to="/behavior" className="card-link">Behavior Module →</Link>
          </div>

          <div className="segment-distribution-list">
            <div className="seg-row">
              <div className="seg-info">
                <span>🧭 Explorers (35.1%)</span>
                <span className="seg-dwell">4m 0s avg dwell</span>
              </div>
              <div className="mini-track"><div className="mini-fill" style={{ width: "35%", background: "#8e44ad" }} /></div>
            </div>
            <div className="seg-row">
              <div className="seg-info">
                <span>⚡ Quick Buyers (22.0%)</span>
                <span className="seg-dwell">45s avg dwell</span>
              </div>
              <div className="mini-track"><div className="mini-fill" style={{ width: "22%", background: "#2980b9" }} /></div>
            </div>
            <div className="seg-row">
              <div className="seg-info">
                <span>⚖️ Comparison Shoppers (18.6%)</span>
                <span className="seg-dwell">5m 10s avg dwell</span>
              </div>
              <div className="mini-track"><div className="mini-fill" style={{ width: "18.6%", background: "#16a085" }} /></div>
            </div>
            <div className="seg-row">
              <div className="seg-info">
                <span>🎯 Impulse Buyers (13.1%)</span>
                <span className="seg-dwell">1m 25s avg dwell</span>
              </div>
              <div className="mini-track"><div className="mini-fill" style={{ width: "13.1%", background: "#d35400" }} /></div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>🔥 Attention Heatmap Snapshot</h3>
              <p className="muted">2D Kernel Density Estimation (KDE) intensity preview</p>
            </div>
            <Link to="/heatmap" className="card-link">Full Visualizer →</Link>
          </div>

          <div className="mini-heatmap-preview">
            <div className="preview-cell cold" />
            <div className="preview-cell low" />
            <div className="preview-cell med" />
            <div className="preview-cell high" />
            <div className="preview-cell hotspot" />
            <div className="preview-cell med" />
            <div className="preview-cell low" />
            <div className="preview-cell cold" />
            <div className="preview-cell high" />
            <div className="preview-cell hotspot" />
            <div className="preview-cell high" />
            <div className="preview-cell med" />
          </div>
          <div className="preview-caption">
            <span>🔥 Peak Hotspot: X=10, Y=7</span>
            <span>❄️ Cold Zone: X=2, Y=13</span>
          </div>
        </div>
      </div>

      {/* ── Product Attractiveness & Journey Funnel ─────── */}
      <div className="dash-two-col">
        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>🏆 Product Attractiveness Reports</h3>
              <p className="muted">Top scored items using 35/25/20/15/5 weighted model</p>
            </div>
            <Link to="/scoring" className="card-link">Scoring Engine →</Link>
          </div>

          <div className="mini-item-list">
            <div className="mini-item">
              <span className="item-rank grade-a-plus">A+</span>
              <div className="item-info">
                <strong>Organic Almond Milk 1L</strong>
                <p>Attention: 95.8 | Pickup: 91.4</p>
              </div>
              <span className="item-score">92.4 / 100</span>
            </div>
            <div className="mini-item">
              <span className="item-rank grade-a">A</span>
              <div className="item-info">
                <strong>Artisan Cheddar Cheese 200g</strong>
                <p>Attention: 90.2 | Pickup: 85.0</p>
              </div>
              <span className="item-score">88.6 / 100</span>
            </div>
            <div className="mini-item">
              <span className="item-rank grade-b">B</span>
              <div className="item-info">
                <strong>Dark Chocolate 85% 100g</strong>
                <p>Attention: 79.1 | Pickup: 75.0</p>
              </div>
              <span className="item-score">79.2 / 100</span>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>🗺️ Customer Journey Analytics</h3>
              <p className="muted">Store entrance to checkout conversion funnel</p>
            </div>
            <Link to="/recommendations" className="card-link">AI Recommendations →</Link>
          </div>

          <div className="funnel-steps">
            <div className="funnel-step">
              <span className="step-num">1</span>
              <div className="step-info">
                <strong>Store Entrance</strong>
                <p>1,420 Tracked Shoppers</p>
              </div>
              <span className="step-pct">100%</span>
            </div>
            <div className="funnel-step">
              <span className="step-num">2</span>
              <div className="step-info">
                <strong>Aisle Engagement</strong>
                <p>1,136 Handled/Gazed Items</p>
              </div>
              <span className="step-pct">80%</span>
            </div>
            <div className="funnel-step">
              <span className="step-num">3</span>
              <div className="step-info">
                <strong>Checkout Converted</strong>
                <p>971 Purchased Items</p>
              </div>
              <span className="step-pct">68.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailAnalystDashboard;
