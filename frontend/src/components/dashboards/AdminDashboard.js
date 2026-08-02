import React, { useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [users] = useState([
    { id: 1, email: "admin@cams.com", role: "Admin", roleId: 1, status: "Active" },
    { id: 2, email: "manager@store1.com", role: "Store Manager", roleId: 2, status: "Active" },
    { id: 3, email: "analyst@retail.com", role: "Retail Analyst", roleId: 3, status: "Active" },
    { id: 4, email: "marketing@cams.com", role: "Marketing Manager", roleId: 4, status: "Active" },
  ]);

  const [cameras] = useState([
    { id: "CAM-01", name: "Entrance Overhead Stream", location: "Main Entrance", fps: 30, status: "Operational", latency: "14ms" },
    { id: "CAM-02", name: "Dairy Aisle 2 Shelf Cam", location: "Aisle 2 - Shelf 4", fps: 30, status: "Operational", latency: "18ms" },
    { id: "CAM-03", name: "Feature Island Kiosk Cam", location: "Central Feature", fps: 28, status: "Operational", latency: "16ms" },
    { id: "CAM-04", name: "Checkout Corridor Stream", location: "South Exit", fps: 30, status: "Operational", latency: "12ms" },
  ]);

  return (
    <div className="role-dashboard admin-dash">
      {/* ── System Status & KPI Summary ──────────────────── */}
      <div className="kpi-grid">
        <div className="kpi-card accent-blue">
          <div className="kpi-header">
            <span className="kpi-icon">⚡</span>
            <span className="kpi-trend positive">99.9% Uptime</span>
          </div>
          <span className="kpi-label">System Monitoring</span>
          <strong className="kpi-value">Healthy</strong>
          <p className="kpi-sub">FastAPI Backend | SQLite Active</p>
        </div>

        <div className="kpi-card accent-purple">
          <div className="kpi-header">
            <span className="kpi-icon">👥</span>
            <span className="kpi-trend positive">4 Registered</span>
          </div>
          <span className="kpi-label">User Management</span>
          <strong className="kpi-value">4 Active Users</strong>
          <p className="kpi-sub">4 Roles Provisioned</p>
        </div>

        <div className="kpi-card accent-emerald">
          <div className="kpi-header">
            <span className="kpi-icon">🎥</span>
            <span className="kpi-trend positive">4 / 4 Live</span>
          </div>
          <span className="kpi-label">Camera Fleet</span>
          <strong className="kpi-value">4 Cameras Online</strong>
          <p className="kpi-sub">MediaPipe / OpenCV Inference OK</p>
        </div>

        <div className="kpi-card accent-gold">
          <div className="kpi-header">
            <span className="kpi-icon">📊</span>
            <span className="kpi-trend positive">+18.2k Events</span>
          </div>
          <span className="kpi-label">Platform Analytics</span>
          <strong className="kpi-value">18,420 Events</strong>
          <p className="kpi-sub">Total Processed Frames</p>
        </div>
      </div>

      {/* ── User Management & System Health ───────────────── */}
      <div className="dash-two-col">
        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>👥 User Management</h3>
              <p className="muted">Registered user accounts, assigned roles, and permission levels</p>
            </div>
            <span className="admin-badge">Admin Controls</span>
          </div>

          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Role</th>
                  <th>Role ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.email}</strong></td>
                    <td>{u.role}</td>
                    <td><span className="code-pill">ID {u.roleId}</span></td>
                    <td><span className="status-badge ok">{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-card">
          <div className="card-header-bar">
            <div>
              <h3>⚡ System Monitoring & Health</h3>
              <p className="muted">Backend server latency, GPU/CPU load, and database pool status</p>
            </div>
            <span className="live-pill">● System Normal</span>
          </div>

          <div className="sys-metrics-grid">
            <div className="sys-metric">
              <span className="metric-name">Inference Latency</span>
              <strong className="metric-val">15.8 ms / frame</strong>
              <div className="mini-track"><div className="mini-fill" style={{ width: "25%", background: "#2ecc71" }} /></div>
            </div>
            <div className="sys-metric">
              <span className="metric-name">CPU Utilization</span>
              <strong className="metric-val">28.4%</strong>
              <div className="mini-track"><div className="mini-fill" style={{ width: "28.4%", background: "#3498db" }} /></div>
            </div>
            <div className="sys-metric">
              <span className="metric-name">Database Query Pool</span>
              <strong className="metric-val">12 Active Conns</strong>
              <div className="mini-track"><div className="mini-fill" style={{ width: "30%", background: "#9b59b6" }} /></div>
            </div>
            <div className="sys-metric">
              <span className="metric-name">REST API Endpoints</span>
              <strong className="metric-val">24 Active Routes</strong>
              <div className="mini-track"><div className="mini-fill" style={{ width: "100%", background: "#2ecc71" }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Camera Fleet Management ──────────────────────── */}
      <div className="dash-card">
        <div className="card-header-bar">
          <div>
            <h3>🎥 Camera Management & Stream Fleet</h3>
            <p className="muted">RTSP / CCTV video streams connected to the detection & attention pipeline</p>
          </div>
          <Link to="/store" className="card-link">Store Locations →</Link>
        </div>

        <div className="table-responsive">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Camera ID</th>
                <th>Stream Name</th>
                <th>Monitored Location</th>
                <th>Framerate (FPS)</th>
                <th>Stream Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cameras.map((c) => (
                <tr key={c.id}>
                  <td><span className="code-pill">{c.id}</span></td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.location}</td>
                  <td>{c.fps} FPS</td>
                  <td>{c.latency}</td>
                  <td><span className="status-badge ok">● {c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
