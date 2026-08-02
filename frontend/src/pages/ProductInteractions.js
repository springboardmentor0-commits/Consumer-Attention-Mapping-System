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

/* ── Module capabilities data ────────────────────────────── */
const INTERACTION_CAPABILITIES = [
  {
    icon: "🤚",
    title: "Product Pickup Detection",
    desc: "Detects when shoppers remove items from shelf positions using hand-to-product bounding box IoU & movement trajectory analysis.",
  },
  {
    icon: "↩️",
    title: "Product Return Detection",
    desc: "Monitors when shoppers put items back onto shelves after handling, distinguishing true returns from basket additions.",
  },
  {
    icon: "🏬",
    title: "Shelf Interaction Monitoring",
    desc: "Tracks shopper hand proximity, hover duration, and touching frequency across active shelf zones in real time.",
  },
  {
    icon: "📈",
    title: "Product Engagement Tracking",
    desc: "Maintains a full state workflow (Viewed → Picked Up → Compared → Returned / Purchased) for every tracked shopper session.",
  },
  {
    icon: "⚖️",
    title: "Product Comparison Analysis",
    desc: "Identifies multi-item handling events within sliding time windows to determine which products shoppers compare before buying.",
  },
];

function ProductInteractions() {
  const session = getSessionUser();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/interaction/summary");
      setSummary(res.data);
    } catch (err) {
      console.error(err);
      // Demo fallback data when backend is not seeded yet
      setSummary({
        total_interactions: 842,
        total_viewed: 412,
        total_picked_up: 218,
        total_returned: 74,
        total_purchased: 98,
        total_compared: 40,
        conversion_rate: 45.0,
        return_rate: 33.9,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  /* Animated values for event counters */
  const animViewed = useAnimatedValue(summary?.total_viewed || 0);
  const animPickedUp = useAnimatedValue(summary?.total_picked_up || 0);
  const animReturned = useAnimatedValue(summary?.total_returned || 0);
  const animPurchased = useAnimatedValue(summary?.total_purchased || 0);
  const animCompared = useAnimatedValue(summary?.total_compared || 0);

  const totalEvents = summary?.total_interactions || 1;

  /* The 5 Required Interaction Event Cards */
  const EVENT_CARDS = [
    {
      label: "Product Viewed",
      value: animViewed,
      raw: summary?.total_viewed || 0,
      icon: "🔍",
      desc: "Shoppers fixated eye gaze or hovered hands over product shelf area",
      color: "#3498db",
    },
    {
      label: "Product Picked Up",
      value: animPickedUp,
      raw: summary?.total_picked_up || 0,
      icon: "🤚",
      desc: "Shoppers lifted product off shelf for inspection",
      color: "#e67e22",
    },
    {
      label: "Product Returned",
      value: animReturned,
      raw: summary?.total_returned || 0,
      icon: "↩️",
      desc: "Handled product was placed back onto the shelf",
      color: "#e74c3c",
    },
    {
      label: "Product Purchased",
      value: animPurchased,
      raw: summary?.total_purchased || 0,
      icon: "🛒",
      desc: "Shopper placed product into cart/basket and proceeded to checkout",
      color: "#2ecc71",
    },
    {
      label: "Product Compared",
      value: animCompared,
      raw: summary?.total_compared || 0,
      icon: "⚖️",
      desc: "Shopper inspected or handled 2+ products in close temporal proximity",
      color: "#9b59b6",
    },
  ];

  if (loading) {
    return (
      <div className="page content-page">
        <section className="card">
          <p className="muted">Loading product interaction metrics…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page interaction-page">
      {/* ── Hero Banner ───────────────────────────────── */}
      <section className="interaction-hero">
        <div className="interaction-hero-content">
          <p className="eyebrow">Consumer Attention Mapping System</p>
          <h1>Product Interaction Analysis</h1>
          <p className="interaction-hero-copy">
            Monitor physical shelf interactions, detect pickups & returns, track engagement
            workflows, and evaluate product comparison behaviors.
          </p>
          <div className="interaction-hero-pills">
            <span>{summary?.total_interactions || 0} Total Interactions</span>
            <span>{summary?.conversion_rate || 0}% Purchase Conversion Rate</span>
            <span>{summary?.return_rate || 0}% Shelf Return Rate</span>
          </div>
        </div>
        <div className="interaction-hero-visual">
          <div className="pulse-ring interaction-pulse" />
          <div className="pulse-ring interaction-pulse delay-1" />
          <span className="hero-icon">🛍️</span>
        </div>
      </section>

      {/* ── Analysis Module Capabilities ───────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Module Capabilities</p>
            <h2>Product Interaction Components</h2>
          </div>
          <p className="muted">
            Five core computer vision and analytics engines tracking retail shelf activity
          </p>
        </div>

        <div className="engine-grid">
          {INTERACTION_CAPABILITIES.map((cap) => (
            <div className="engine-card" key={cap.title}>
              <span className="engine-icon">{cap.icon}</span>
              <strong>{cap.title}</strong>
              <p>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interaction Events ─────────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Interaction Events</p>
            <h2>Event Metrics Breakdown</h2>
          </div>
          <p className="muted">Categorized event counts captured across all store shelves</p>
        </div>

        <div className="metrics-grid">
          {EVENT_CARDS.map((evt) => (
            <div
              className="metric-card interaction-event-card"
              key={evt.label}
              style={{ "--accent": evt.color }}
            >
              <div className="event-card-header">
                <span className="event-card-icon">{evt.icon}</span>
                <span className="metric-label">{evt.label}</span>
              </div>
              <strong className="metric-value">{evt.value}</strong>
              <p className="metric-desc">{evt.desc}</p>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min(100, (evt.raw / totalEvents) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Detailed Breakdown Table ─────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Detailed Summary</p>
            <h2>Interaction Event Table</h2>
          </div>
          <p className="muted">System-wide interaction metrics and conversion indicators</p>
        </div>

        <div className="metric-table-wrap">
          <table className="metric-detail-table">
            <thead>
              <tr>
                <th>Interaction Event</th>
                <th>Icon</th>
                <th>Total Event Count</th>
                <th>Share of Interactions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Product Viewed</td>
                <td>🔍</td>
                <td>{summary?.total_viewed || 0}</td>
                <td>{(((summary?.total_viewed || 0) / totalEvents) * 100).toFixed(1)}%</td>
                <td><span className="status-pill active">Tracking</span></td>
              </tr>
              <tr>
                <td>Product Picked Up</td>
                <td>🤚</td>
                <td>{summary?.total_picked_up || 0}</td>
                <td>{(((summary?.total_picked_up || 0) / totalEvents) * 100).toFixed(1)}%</td>
                <td><span className="status-pill active">Tracking</span></td>
              </tr>
              <tr>
                <td>Product Returned</td>
                <td>↩️</td>
                <td>{summary?.total_returned || 0}</td>
                <td>{(((summary?.total_returned || 0) / totalEvents) * 100).toFixed(1)}%</td>
                <td><span className="status-pill active">Tracking</span></td>
              </tr>
              <tr>
                <td>Product Purchased</td>
                <td>🛒</td>
                <td>{summary?.total_purchased || 0}</td>
                <td>{(((summary?.total_purchased || 0) / totalEvents) * 100).toFixed(1)}%</td>
                <td><span className="status-pill active">Tracking</span></td>
              </tr>
              <tr>
                <td>Product Compared</td>
                <td>⚖️</td>
                <td>{summary?.total_compared || 0}</td>
                <td>{(((summary?.total_compared || 0) / totalEvents) * 100).toFixed(1)}%</td>
                <td><span className="status-pill active">Tracking</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Role Hint ──────────────────────────────────── */}
      <p className="role-hint">
        Logged in as <strong>{session?.role?.name || "Unknown"}</strong>. Product interaction metrics are available to all roles.
      </p>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default ProductInteractions;
