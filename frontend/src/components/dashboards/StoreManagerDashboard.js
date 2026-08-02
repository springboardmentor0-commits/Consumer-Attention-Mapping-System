import React from "react";
import { Link } from "react-router-dom";

function StoreManagerDashboard() {
  return (
    <div className="role-dashboard store-manager-dash">
      {/* ── KPI Summary Grid ────────────────────────────── */}
      <div className="kpi-grid">
        <div className="kpi-card accent-blue">
          <div className="kpi-header">
            <span className="kpi-icon">🚶</span>
            <span className="kpi-trend positive">+14.2% ↑</span>
          </div>
          <span className="kpi-label">Store Traffic Today</span>
          <strong className="kpi-value">1,428</strong>
          <p className="kpi-sub">Peak hour: 17:00 - 18:00 (240/hr)</p>
        </div>

        <div className="kpi-card accent-purple">
          <div className="kpi-header">
            <span className="kpi-icon">🛍️</span>
            <span className="kpi-trend positive">+8.5% ↑</span>
          </div>
          <span className="kpi-label">Product Engagements</span>
          <strong className="kpi-value">842</strong>
          <p className="kpi-sub">High-touch ratio: 62% of views</p>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-header">
            <span className="kpi-icon">📚</span>
            <span className="kpi-trend neutral">94.8% Optimal</span>
          </div>
          <span className="kpi-label">Shelf Performance Index</span>
          <strong className="kpi-value">94.8 / 100</strong>
          <p className="kpi-sub">12 active shelves monitored</p>
        </div>

        <div className="kpi-card accent-gold">
          <div className="kpi-header">
            <span className="kpi-icon">🛒</span>
            <span className="kpi-trend positive">+5.1% ↑</span>
          </div>
          <span className="kpi-label">Conversion Metric</span>
          <strong className="kpi-value">46.8%</strong>
          <p className="kpi-sub">Footfall to Purchase Rate</p>
        </div>
      </div>

      {/* ── Store Traffic & Peak Hours Section ───────────── */}
      <div className="dash-two-col">
        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>🚦 Store Traffic Analytics</h3>
              <p className="muted">Hourly visitor throughput and entrance corridor flow</p>
            </div>
            <span className="live-pill">● Live Feed</span>
          </div>

          <div className="traffic-bars">
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "35%" }} />
              <span>09:00</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "55%" }} />
              <span>11:00</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "45%" }} />
              <span>13:00</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "75%" }} />
              <span>15:00</span>
            </div>
            <div className="bar-col peak">
              <div className="bar-fill" style={{ height: "95%" }} />
              <span>17:00</span>
            </div>
            <div className="bar-col">
              <div className="bar-fill" style={{ height: "60%" }} />
              <span>19:00</span>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>🛍️ Product Engagement Insights</h3>
              <p className="muted">Top high-interaction products on active store shelves</p>
            </div>
            <Link to="/interactions" className="card-link">View All →</Link>
          </div>

          <div className="mini-item-list">
            <div className="mini-item">
              <span className="item-rank">#1</span>
              <div className="item-info">
                <strong>Organic Almond Milk 1L</strong>
                <p>Dairy Aisle 2 — 312 Interactions</p>
              </div>
              <span className="item-badge high">High Touch</span>
            </div>
            <div className="mini-item">
              <span className="item-rank">#2</span>
              <div className="item-info">
                <strong>Artisan Cheddar Cheese 200g</strong>
                <p>Deli Counter — 264 Interactions</p>
              </div>
              <span className="item-badge high">High Touch</span>
            </div>
            <div className="mini-item">
              <span className="item-rank">#3</span>
              <div className="item-info">
                <strong>Greek Yogurt 500g</strong>
                <p>Dairy Aisle 1 — 186 Interactions</p>
              </div>
              <span className="item-badge med">Moderate</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shelf Performance & Replenishment ────────────── */}
      <div className="dash-card">
        <div className="card-header-bar">
          <div>
            <h3>📚 Shelf Performance & Replenishment Signals</h3>
            <p className="muted">Real-time shelf zone utilization, stock alerts, and eye-level performance</p>
          </div>
          <Link to="/shelf" className="card-link">Manage Shelves →</Link>
        </div>

        <div className="table-responsive">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Shelf Zone</th>
                <th>Location</th>
                <th>Eye-Level Utilization</th>
                <th>Gaze Fixations</th>
                <th>Stock Status</th>
                <th>Replenishment Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Dairy Aisle - Zone 1</strong></td>
                <td>North Shelf 2A</td>
                <td>
                  <div className="progress-cell">
                    <span>92%</span>
                    <div className="mini-track"><div className="mini-fill" style={{ width: "92%", background: "#2ecc71" }} /></div>
                  </div>
                </td>
                <td>1,840 ms avg</td>
                <td><span className="status-badge ok">In Stock (84%)</span></td>
                <td><span className="action-text">Optimal</span></td>
              </tr>
              <tr>
                <td><strong>Bakery Fresh Stand</strong></td>
                <td>Center Display 1B</td>
                <td>
                  <div className="progress-cell">
                    <span>88%</span>
                    <div className="mini-track"><div className="mini-fill" style={{ width: "88%", background: "#3498db" }} /></div>
                  </div>
                </td>
                <td>2,150 ms avg</td>
                <td><span className="status-badge warn">Low Stock (22%)</span></td>
                <td><strong className="alert-text">Replenish Now</strong></td>
              </tr>
              <tr>
                <td><strong>Beverage Endcap</strong></td>
                <td>South Gate 3C</td>
                <td>
                  <div className="progress-cell">
                    <span>74%</span>
                    <div className="mini-track"><div className="mini-fill" style={{ width: "74%", background: "#f39c12" }} /></div>
                  </div>
                </td>
                <td>1,120 ms avg</td>
                <td><span className="status-badge ok">In Stock (91%)</span></td>
                <td><span className="action-text">Re-align Facings</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StoreManagerDashboard;
