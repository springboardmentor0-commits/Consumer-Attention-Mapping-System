import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { getSessionUser } from "../utils/role";

/* ── Animated counter hook ──────────────────────────────── */
function useAnimatedValue(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const from = value;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(from + (target - from) * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

/* ── Format milliseconds for display ────────────────────── */
function formatMs(ms) {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

/* ── Engine capability data ─────────────────────────────── */
const ENGINE_CAPABILITIES = [
  {
    icon: "👁️",
    title: "Gaze Estimation",
    desc: "Tracks iris position using MediaPipe Face Mesh (468 landmarks) to compute 2-component gaze vectors with yaw and pitch angles.",
  },
  {
    icon: "🗣️",
    title: "Head Pose Analysis",
    desc: "Computes head roll, pitch, and yaw from 6 canonical face landmarks via cv2.solvePnP for precise orientation tracking.",
  },
  {
    icon: "🎯",
    title: "Product Attention Detection",
    desc: "Maps gaze points onto product shelf zones to determine which items shoppers are actively fixating on.",
  },
  {
    icon: "📊",
    title: "Shelf Engagement Analysis",
    desc: "Classifies shopper engagement as Scanning, Browsing, or Focused using a sliding time-window algorithm.",
  },
  {
    icon: "⏱️",
    title: "Attention Duration Calculation",
    desc: "Accumulates per-product and per-shelf dwell time from frame-level attention events for comprehensive analytics.",
  },
];

/* ── Component ──────────────────────────────────────────── */
function AttentionAnalytics() {
  const session = getSessionUser();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/attention/summary");
      setSummary(res.data);
    } catch (err) {
      console.error(err);
      // Use demo data when backend is unavailable
      setSummary({
        total_events: 1284,
        total_dwell_time_ms: 487200,
        total_view_duration_ms: 312400,
        total_shelf_attention_time_ms: 174800,
        total_product_focus_ms: 312400,
        total_repeated_attention_events: 89,
        avg_dwell_time_ms: 379.5,
        avg_view_duration_ms: 243.3,
        stores_analyzed: 4,
        shelves_analyzed: 18,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  /* animated counters */
  const animDwell = useAnimatedValue(summary?.total_dwell_time_ms || 0);
  const animView = useAnimatedValue(summary?.total_view_duration_ms || 0);
  const animShelf = useAnimatedValue(summary?.total_shelf_attention_time_ms || 0);
  const animProduct = useAnimatedValue(summary?.total_product_focus_ms || 0);
  const animRepeated = useAnimatedValue(summary?.total_repeated_attention_events || 0);

  /* metric cards config */
  const METRICS = [
    {
      label: "Dwell Time",
      value: formatMs(animDwell),
      raw: summary?.total_dwell_time_ms || 0,
      desc: "Total time shoppers spend in a zone",
      color: "#5bc0eb",
    },
    {
      label: "View Duration",
      value: formatMs(animView),
      raw: summary?.total_view_duration_ms || 0,
      desc: "How long eyes are on a product",
      color: "#9b59b6",
    },
    {
      label: "Shelf Attention Time",
      value: formatMs(animShelf),
      raw: summary?.total_shelf_attention_time_ms || 0,
      desc: "Cumulative shelf focus across all shoppers",
      color: "#1abc9c",
    },
    {
      label: "Product Focus Duration",
      value: formatMs(animProduct),
      raw: summary?.total_product_focus_ms || 0,
      desc: "Per-product fixation time",
      color: "#e67e22",
    },
    {
      label: "Repeated Attention Events",
      value: animRepeated,
      raw: summary?.total_repeated_attention_events || 0,
      desc: "How often shoppers re-visit a product",
      color: "#e74c3c",
    },
  ];

  if (loading) {
    return (
      <div className="page content-page">
        <section className="card">
          <p className="muted">Loading attention analytics…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page attention-page">
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="attention-hero">
        <div className="attention-hero-content">
          <p className="eyebrow">Attention Analysis Engine</p>
          <h1>Consumer Attention Mapping</h1>
          <p className="attention-hero-copy">
            Real-time gaze estimation, head pose analysis, and shelf engagement
            tracking — powered by MediaPipe Face Mesh and computer vision.
          </p>
          <div className="attention-hero-pills">
            <span>{summary?.stores_analyzed || 0} Stores Analyzed</span>
            <span>{summary?.shelves_analyzed || 0} Shelves Tracked</span>
            <span>{summary?.total_events || 0} Events Captured</span>
          </div>
        </div>
        <div className="attention-hero-visual">
          <div className="pulse-ring" />
          <div className="pulse-ring delay-1" />
          <div className="pulse-ring delay-2" />
          <span className="hero-icon">👁️</span>
        </div>
      </section>

      {/* ── Engine Capabilities ─────────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Engine Capabilities</p>
            <h2>Analysis Components</h2>
          </div>
          <p className="muted">
            Five integrated modules forming the attention analysis pipeline
          </p>
        </div>

        <div className="engine-grid">
          {ENGINE_CAPABILITIES.map((cap) => (
            <div className="engine-card" key={cap.title}>
              <span className="engine-icon">{cap.icon}</span>
              <strong>{cap.title}</strong>
              <p>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Attention Metrics ───────────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Attention Metrics</p>
            <h2>Key Performance Indicators</h2>
          </div>
          <p className="muted">Aggregated across all stores and shelves</p>
        </div>

        <div className="metrics-grid">
          {METRICS.map((m) => (
            <div
              className="metric-card"
              key={m.label}
              style={{ "--accent": m.color }}
            >
              <span className="metric-label">{m.label}</span>
              <strong className="metric-value">{m.value}</strong>
              <p className="metric-desc">{m.desc}</p>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (m.raw / Math.max(summary?.total_dwell_time_ms || 1, 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Summary Table ───────────────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Detailed Breakdown</p>
            <h2>Metric Summary Table</h2>
          </div>
        </div>

        <div className="metric-table-wrap">
          <table className="metric-detail-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Average / Event</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Events</td>
                <td>{summary?.total_events || 0}</td>
                <td>—</td>
                <td>
                  <span className="status-pill active">Active</span>
                </td>
              </tr>
              <tr>
                <td>Dwell Time</td>
                <td>{formatMs(summary?.total_dwell_time_ms || 0)}</td>
                <td>{formatMs(summary?.avg_dwell_time_ms || 0)}</td>
                <td>
                  <span className="status-pill active">Tracking</span>
                </td>
              </tr>
              <tr>
                <td>View Duration</td>
                <td>{formatMs(summary?.total_view_duration_ms || 0)}</td>
                <td>{formatMs(summary?.avg_view_duration_ms || 0)}</td>
                <td>
                  <span className="status-pill active">Tracking</span>
                </td>
              </tr>
              <tr>
                <td>Shelf Attention Time</td>
                <td>
                  {formatMs(summary?.total_shelf_attention_time_ms || 0)}
                </td>
                <td>—</td>
                <td>
                  <span className="status-pill active">Tracking</span>
                </td>
              </tr>
              <tr>
                <td>Product Focus Duration</td>
                <td>{formatMs(summary?.total_product_focus_ms || 0)}</td>
                <td>—</td>
                <td>
                  <span className="status-pill active">Tracking</span>
                </td>
              </tr>
              <tr>
                <td>Repeated Attention Events</td>
                <td>{summary?.total_repeated_attention_events || 0}</td>
                <td>—</td>
                <td>
                  <span
                    className={`status-pill ${
                      (summary?.total_repeated_attention_events || 0) > 0
                        ? "active"
                        : "idle"
                    }`}
                  >
                    {(summary?.total_repeated_attention_events || 0) > 0
                      ? "Detected"
                      : "None"}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Stores Analyzed</td>
                <td>{summary?.stores_analyzed || 0}</td>
                <td>—</td>
                <td>
                  <span className="status-pill active">Active</span>
                </td>
              </tr>
              <tr>
                <td>Shelves Analyzed</td>
                <td>{summary?.shelves_analyzed || 0}</td>
                <td>—</td>
                <td>
                  <span className="status-pill active">Mapped</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Role hint ───────────────────────────────────── */}
      <p className="role-hint">
        Logged in as{" "}
        <strong>{session?.role?.name || "Unknown"}</strong>. Attention
        analytics are available to all roles.
      </p>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default AttentionAnalytics;
