import React from "react";
import { Link } from "react-router-dom";

function MarketingManagerDashboard() {
  return (
    <div className="role-dashboard marketing-manager-dash">
      {/* ── KPI Summary Grid ────────────────────────────── */}
      <div className="kpi-grid">
        <div className="kpi-card accent-emerald">
          <div className="kpi-header">
            <span className="kpi-icon">📢</span>
            <span className="kpi-trend positive">+22.4% Lift</span>
          </div>
          <span className="kpi-label">Campaign Effectiveness</span>
          <strong className="kpi-value">+18.5% Sales Lift</strong>
          <p className="kpi-sub">Summer Refresh Promo Active</p>
        </div>

        <div className="kpi-card accent-blue">
          <div className="kpi-header">
            <span className="kpi-icon">👁️</span>
            <span className="kpi-trend positive">78.8 Score</span>
          </div>
          <span className="kpi-label">Product Visibility Index</span>
          <strong className="kpi-value">85.4% Line-of-Sight</strong>
          <p className="kpi-sub">Eye-Level exposure rating</p>
        </div>

        <div className="kpi-card accent-gold">
          <div className="kpi-header">
            <span className="kpi-icon">🏷️</span>
            <span className="kpi-trend positive">+15.2% ROI</span>
          </div>
          <span className="kpi-label">Promotional Performance</span>
          <strong className="kpi-value">4.2x ROI Ratio</strong>
          <p className="kpi-sub">Feature endcap conversion rate</p>
        </div>

        <div className="kpi-card accent-purple">
          <div className="kpi-header">
            <span className="kpi-icon">🤝</span>
            <span className="kpi-trend positive">+12.0% ↑</span>
          </div>
          <span className="kpi-label">Customer Engagement</span>
          <strong className="kpi-value">71.5 / 100</strong>
          <p className="kpi-sub">Interactive Promo Touch Rate</p>
        </div>
      </div>

      {/* ── Campaign Effectiveness & Visibility ──────────── */}
      <div className="dash-two-col">
        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>📢 Campaign Effectiveness</h3>
              <p className="muted">Promotional lift and campaign performance analytics</p>
            </div>
            <Link to="/recommendations" className="card-link">Promo Suggestions →</Link>
          </div>

          <div className="campaign-list">
            <div className="campaign-item">
              <div className="camp-info">
                <strong>Summer Refresh Promo</strong>
                <p>Beverage & Dairy Aisle Endcaps</p>
              </div>
              <div className="camp-stat">
                <strong className="positive-text">+22.4% Lift</strong>
                <span className="muted">Active</span>
              </div>
            </div>
            <div className="campaign-item">
              <div className="camp-info">
                <strong>Organic Life Sampling Kiosk</strong>
                <p>Central Feature Island (X=10, Y=7)</p>
              </div>
              <div className="camp-stat">
                <strong className="positive-text">+18.0% Lift</strong>
                <span className="muted">Active</span>
              </div>
            </div>
            <div className="campaign-item">
              <div className="camp-info">
                <strong>Artisan Cheese Cross-Promo</strong>
                <p>Deli & Snack Corridor</p>
              </div>
              <div className="camp-stat">
                <strong className="positive-text">+14.5% Lift</strong>
                <span className="muted">Scheduled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>👁️ Product Visibility Analytics</h3>
              <p className="muted">Line-of-sight rating by shelf tier height</p>
            </div>
            <Link to="/scoring" className="card-link">Visibility Scores →</Link>
          </div>

          <div className="visibility-tiers">
            <div className="tier-row">
              <div className="tier-info">
                <span>Eye-Level Golden Tier</span>
                <span className="tier-mult">1.25x Multiplier</span>
              </div>
              <div className="progress-cell">
                <span>95% Visibility</span>
                <div className="mini-track"><div className="mini-fill" style={{ width: "95%", background: "#2ecc71" }} /></div>
              </div>
            </div>
            <div className="tier-row">
              <div className="tier-info">
                <span>Top Shelf Tier</span>
                <span className="tier-mult">1.0x Multiplier</span>
              </div>
              <div className="progress-cell">
                <span>78% Visibility</span>
                <div className="mini-track"><div className="mini-fill" style={{ width: "78%", background: "#3498db" }} /></div>
              </div>
            </div>
            <div className="tier-row">
              <div className="tier-info">
                <span>Middle Shelf Tier</span>
                <span className="tier-mult">0.9x Multiplier</span>
              </div>
              <div className="progress-cell">
                <span>72% Visibility</span>
                <div className="mini-track"><div className="mini-fill" style={{ width: "72%", background: "#f39c12" }} /></div>
              </div>
            </div>
            <div className="tier-row">
              <div className="tier-info">
                <span>Bottom Shelf Tier</span>
                <span className="tier-mult">0.65x Multiplier</span>
              </div>
              <div className="progress-cell">
                <span>42% Visibility</span>
                <div className="mini-track"><div className="mini-fill" style={{ width: "42%", background: "#e74c3c" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Promotional Performance & Engagement ─────────── */}
      <div className="dash-card">
        <div className="card-header-bar">
          <div>
            <h3>🏷️ Promotional Performance & Engagement Matrix</h3>
            <p className="muted">Endcap feature stand conversions, tag interactions, and promo touch rates</p>
          </div>
          <Link to="/interactions" className="card-link">View Event Logs →</Link>
        </div>

        <div className="table-responsive">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Promotional Zone</th>
                <th>Target SKU</th>
                <th>Attention Capture</th>
                <th>Pickup Conversion</th>
                <th>Promo ROI Lift</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Central Feature Island</strong></td>
                <td>Organic Almond Milk 1L</td>
                <td>98% Density</td>
                <td>87.5% Rate</td>
                <td><strong className="positive-text">+22.4%</strong></td>
                <td><span className="status-badge ok">Active Kiosk</span></td>
              </tr>
              <tr>
                <td><strong>Aisle 2 Endcap Display</strong></td>
                <td>Artisan Cheddar Cheese</td>
                <td>95% Density</td>
                <td>85.2% Rate</td>
                <td><strong className="positive-text">+18.0%</strong></td>
                <td><span className="status-badge ok">Active Endcap</span></td>
              </tr>
              <tr>
                <td><strong>Beverage Clip-Strip Bay</strong></td>
                <td>Dark Chocolate 85%</td>
                <td>75% Density</td>
                <td>75.0% Rate</td>
                <td><strong className="positive-text">+8.8%</strong></td>
                <td><span className="status-badge warn">Needs Re-Tagging</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MarketingManagerDashboard;
