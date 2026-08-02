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

/* ── Format milliseconds to readable string ────────────── */
function formatMs(ms) {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

/* ── Behavior Engine Capabilities Data ─────────────────── */
const BEHAVIOR_CAPABILITIES = [
  {
    icon: "🛍️",
    title: "Shopping Pattern Analysis",
    desc: "Evaluates visitation pace, dwell time across product categories, and aisle navigation strategy to quantify shopping intent.",
  },
  {
    icon: "⭐",
    title: "Product Preference Analysis",
    desc: "Measures brand affinity, top-performing categories, and gaze-to-purchase ratios to construct shopper preference profiles.",
  },
  {
    icon: "🚶",
    title: "Movement Behavior Analysis",
    desc: "Tracks shopper trajectory speed, path length, backtracking frequency, and stationary pause times across store layout zones.",
  },
  {
    icon: "🧩",
    title: "Consumer Segmentation",
    desc: "Classifies shoppers in real time into 5 distinct behavioral segments using automated heuristic & ML feature scoring.",
  },
  {
    icon: "🗺️",
    title: "Journey Analytics",
    desc: "Maps full store journeys from entrance to checkout, analyzing touchpoint conversion rates and funnel drop-off points.",
  },
];

function ConsumerBehavior() {
  const session = getSessionUser();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/behavior/summary");
      setSummary(res.data);
    } catch (err) {
      console.error(err);
      // Demo fallback data
      setSummary({
        total_shoppers_analyzed: 1420,
        total_explorers: 498,
        total_quick_buyers: 312,
        total_comparison_shoppers: 264,
        total_impulse_buyers: 186,
        total_brand_loyal: 160,
        avg_journey_duration_ms: 245000,
        overall_conversion_rate: 68.4,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  /* Animated values for segment counts */
  const animExplorers = useAnimatedValue(summary?.total_explorers || 0);
  const animQuick = useAnimatedValue(summary?.total_quick_buyers || 0);
  const animComparison = useAnimatedValue(summary?.total_comparison_shoppers || 0);
  const animImpulse = useAnimatedValue(summary?.total_impulse_buyers || 0);
  const animLoyal = useAnimatedValue(summary?.total_brand_loyal || 0);

  const totalShoppers = summary?.total_shoppers_analyzed || 1;

  /* The 5 Required Consumer Segments */
  const SEGMENT_CARDS = [
    {
      label: "Explorers",
      value: animExplorers,
      raw: summary?.total_explorers || 0,
      icon: "🧭",
      desc: "High dwell time & broad category traversal; browsing multiple aisles",
      color: "#8e44ad",
    },
    {
      label: "Quick Buyers",
      value: animQuick,
      raw: summary?.total_quick_buyers || 0,
      icon: "⚡",
      desc: "High movement velocity, targeted direct paths, low dwell time",
      color: "#2980b9",
    },
    {
      label: "Comparison Shoppers",
      value: animComparison,
      raw: summary?.total_comparison_shoppers || 0,
      icon: "⚖️",
      desc: "Side-by-side product handling & multi-brand evaluation",
      color: "#16a085",
    },
    {
      label: "Impulse Buyers",
      value: animImpulse,
      raw: summary?.total_impulse_buyers || 0,
      icon: "🎯",
      desc: "Rapid view-to-pickup transitions & unplanned basket additions",
      color: "#d35400",
    },
    {
      label: "Brand Loyal Customers",
      value: animLoyal,
      raw: summary?.total_brand_loyal || 0,
      icon: "👑",
      desc: "Direct navigation to specific brand clusters & high brand affinity",
      color: "#f39c12",
    },
  ];

  if (loading) {
    return (
      <div className="page content-page">
        <section className="card">
          <p className="muted">Loading behavior intelligence metrics…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page behavior-page">
      {/* ── Hero Banner ───────────────────────────────── */}
      <section className="behavior-hero">
        <div className="behavior-hero-content">
          <p className="eyebrow">Consumer Behavior Intelligence Engine</p>
          <h1>Behavior & Journey Analytics</h1>
          <p className="behavior-hero-copy">
            Understand shopper intent, classify consumer segments, analyze spatial trajectories,
            and optimize retail store journeys in real time.
          </p>
          <div className="behavior-hero-pills">
            <span>{summary?.total_shoppers_analyzed || 0} Shoppers Analyzed</span>
            <span>{formatMs(summary?.avg_journey_duration_ms || 0)} Avg Journey Duration</span>
            <span>{summary?.overall_conversion_rate || 0}% Conversion Rate</span>
          </div>
        </div>
        <div className="behavior-hero-visual">
          <div className="pulse-ring behavior-pulse" />
          <div className="pulse-ring behavior-pulse delay-1" />
          <span className="hero-icon">🧠</span>
        </div>
      </section>

      {/* ── Behavior Engine Capabilities ─────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Engine Capabilities</p>
            <h2>Behavior Analytics Components</h2>
          </div>
          <p className="muted">
            Five core intelligence engines analyzing shopper movement, preferences, and journeys
          </p>
        </div>

        <div className="engine-grid">
          {BEHAVIOR_CAPABILITIES.map((cap) => (
            <div className="engine-card" key={cap.title}>
              <span className="engine-icon">{cap.icon}</span>
              <strong>{cap.title}</strong>
              <p>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Consumer Segments Panel ─────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Consumer Segmentation</p>
            <h2>Consumer Segments Breakdown</h2>
          </div>
          <p className="muted">Categorized shopper profiles classified by behavior intelligence</p>
        </div>

        <div className="metrics-grid">
          {SEGMENT_CARDS.map((seg) => (
            <div
              className="metric-card segment-card"
              key={seg.label}
              style={{ "--accent": seg.color }}
            >
              <div className="event-card-header">
                <span className="event-card-icon">{seg.icon}</span>
                <span className="metric-label">{seg.label}</span>
              </div>
              <strong className="metric-value">{seg.value}</strong>
              <p className="metric-desc">{seg.desc}</p>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min(100, (seg.raw / totalShoppers) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Journey & Segment Table ─────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Journey & Segment Summary</p>
            <h2>Behavior Analytics Breakdown</h2>
          </div>
          <p className="muted">Distribution percentages and key performance indicators</p>
        </div>

        <div className="metric-table-wrap">
          <table className="metric-detail-table">
            <thead>
              <tr>
                <th>Consumer Segment</th>
                <th>Icon</th>
                <th>Shoppers Count</th>
                <th>Share of Footfall</th>
                <th>Typical Pace</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Explorers</td>
                <td>🧭</td>
                <td>{summary?.total_explorers || 0}</td>
                <td>{(((summary?.total_explorers || 0) / totalShoppers) * 100).toFixed(1)}%</td>
                <td>Relaxed / High Dwell</td>
                <td><span className="status-pill active">Segmented</span></td>
              </tr>
              <tr>
                <td>Quick Buyers</td>
                <td>⚡</td>
                <td>{summary?.total_quick_buyers || 0}</td>
                <td>{(((summary?.total_quick_buyers || 0) / totalShoppers) * 100).toFixed(1)}%</td>
                <td>Rapid / Direct</td>
                <td><span className="status-pill active">Segmented</span></td>
              </tr>
              <tr>
                <td>Comparison Shoppers</td>
                <td>⚖️</td>
                <td>{summary?.total_comparison_shoppers || 0}</td>
                <td>{(((summary?.total_comparison_shoppers || 0) / totalShoppers) * 100).toFixed(1)}%</td>
                <td>Moderate / Evaluative</td>
                <td><span className="status-pill active">Segmented</span></td>
              </tr>
              <tr>
                <td>Impulse Buyers</td>
                <td>🎯</td>
                <td>{summary?.total_impulse_buyers || 0}</td>
                <td>{(((summary?.total_impulse_buyers || 0) / totalShoppers) * 100).toFixed(1)}%</td>
                <td>Dynamic / Fast Conversion</td>
                <td><span className="status-pill active">Segmented</span></td>
              </tr>
              <tr>
                <td>Brand Loyal Customers</td>
                <td>👑</td>
                <td>{summary?.total_brand_loyal || 0}</td>
                <td>{(((summary?.total_brand_loyal || 0) / totalShoppers) * 100).toFixed(1)}%</td>
                <td>Targeted / High Affinity</td>
                <td><span className="status-pill active">Segmented</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Role Hint ──────────────────────────────────── */}
      <p className="role-hint">
        Logged in as <strong>{session?.role?.name || "Unknown"}</strong>. Consumer behavior intelligence metrics are available to all roles.
      </p>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default ConsumerBehavior;
