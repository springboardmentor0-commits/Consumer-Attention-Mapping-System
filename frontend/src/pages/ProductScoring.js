import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { getSessionUser } from "../utils/role";

/* ── Formula Component Weights ──────────────────────────── */
const FORMULA_WEIGHTS = [
  { label: "Attention Duration", weight: "35%", icon: "⏱️", color: "#f39c12", desc: "Eye gaze fixation time on product" },
  { label: "Interaction Frequency", weight: "25%", icon: "🔄", color: "#e67e22", desc: "Hand hovering, touch, and movement count" },
  { label: "Product Pickup Rate", weight: "20%", icon: "🤚", color: "#d35400", desc: "Lifted off shelf for close inspection" },
  { label: "Purchase Conversion", weight: "15%", icon: "🛒", color: "#27ae60", desc: "Final addition to cart and purchase" },
  { label: "Repeat Engagement", weight: "5%", icon: "🔁", color: "#8e44ad", desc: "Re-visitation and multi-touch frequency" },
];

/* ── Engine Capabilities ─────────────────────────────────── */
const SCORING_CAPABILITIES = [
  {
    icon: "🏆",
    title: "Product Attractiveness Scoring",
    desc: "Computes 0-100 attractiveness score combining attention, pickups, conversions, and repeat engagement using a weighted formula.",
  },
  {
    icon: "👁️",
    title: "Shelf Visibility Scoring",
    desc: "Evaluates shelf height tier, eye-level exposure, and line-of-sight metrics to rate product visibility index.",
  },
  {
    icon: "🔥",
    title: "Engagement Scoring",
    desc: "Quantifies shopper engagement depth by weighing active physical handling against passive gaze dwell times.",
  },
  {
    icon: "📈",
    title: "Conversion Potential Scoring",
    desc: "Calculates purchase probability scores by analyzing high-intent shopper behaviors (long pickups, comparison checks).",
  },
  {
    icon: "📢",
    title: "Marketing Effectiveness Scoring",
    desc: "Measures promotional lift, endcap attention capture, and marketing campaign conversion efficiency.",
  },
];

/* Helper for grade color */
function getGradeBadgeClass(grade) {
  if (grade === "A+") return "grade-a-plus";
  if (grade === "A") return "grade-a";
  if (grade === "B") return "grade-b";
  if (grade === "C") return "grade-c";
  return "grade-d";
}

function ProductScoring() {
  const session = getSessionUser();
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [prodRes, sumRes] = await Promise.all([
        api.get("/scoring/products/1"),
        api.get("/scoring/summary"),
      ]);
      setProducts(prodRes.data.products || []);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
      // Demo fallback data
      const demoProds = [
        {
          product_id: "P001", product_name: "Organic Almond Milk 1L", attractiveness_score: 92.4, tier_grade: "A+",
          sub_scores: { attention_duration: 95.8, interaction_frequency: 96.0, pickup_rate: 91.4, purchase_conversion: 87.5, repeat_engagement: 80.0 },
          shelf_visibility_score: 95.0, engagement_score: 95.9, conversion_potential_score: 89.5, marketing_effectiveness_score: 92.0,
        },
        {
          product_id: "P002", product_name: "Artisan Cheddar Cheese 200g", attractiveness_score: 88.6, tier_grade: "A",
          sub_scores: { attention_duration: 90.2, interaction_frequency: 88.0, pickup_rate: 85.0, purchase_conversion: 85.2, repeat_engagement: 90.0 },
          shelf_visibility_score: 95.0, engagement_score: 88.9, conversion_potential_score: 85.1, marketing_effectiveness_score: 89.0,
        },
        {
          product_id: "P004", product_name: "Dark Chocolate 85% 100g", attractiveness_score: 79.2, tier_grade: "B",
          sub_scores: { attention_duration: 79.1, interaction_frequency: 84.0, pickup_rate: 75.0, purchase_conversion: 75.0, repeat_engagement: 72.0 },
          shelf_visibility_score: 90.0, engagement_score: 82.0, conversion_potential_score: 75.0, marketing_effectiveness_score: 78.5,
        },
        {
          product_id: "P003", product_name: "Greek Style Yogurt 500g", attractiveness_score: 68.5, tier_grade: "C",
          sub_scores: { attention_duration: 68.3, interaction_frequency: 62.0, pickup_rate: 73.3, purchase_conversion: 72.7, repeat_engagement: 50.0 },
          shelf_visibility_score: 72.0, engagement_score: 64.5, conversion_potential_score: 73.0, marketing_effectiveness_score: 65.0,
        },
        {
          product_id: "P005", product_name: "Low-Fat Cottage Cheese 250g", attractiveness_score: 48.2, tier_grade: "D",
          sub_scores: { attention_duration: 35.0, interaction_frequency: 30.0, pickup_rate: 32.0, purchase_conversion: 50.0, repeat_engagement: 25.0 },
          shelf_visibility_score: 42.0, engagement_score: 32.0, conversion_potential_score: 41.0, marketing_effectiveness_score: 33.0,
        },
      ];
      setProducts(demoProds);
      setSummary({
        total_products_scored: 5,
        avg_attractiveness_score: 75.4,
        avg_visibility_score: 78.8,
        avg_engagement_score: 72.6,
        avg_conversion_potential: 72.7,
        avg_marketing_effectiveness: 71.5,
        top_product_name: "Organic Almond Milk 1L",
        top_product_score: 92.4,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="page content-page">
        <section className="card">
          <p className="muted">Calculating product attractiveness scores…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page scoring-page">
      {/* ── Hero Banner ───────────────────────────────── */}
      <section className="scoring-hero">
        <div className="scoring-hero-content">
          <p className="eyebrow">Consumer Attention Mapping System</p>
          <h1>Product Attractiveness Scoring</h1>
          <p className="scoring-hero-copy">
            Rate product performability, shelf placement visibility, and conversion potential
            using an objective 5-component weighted scoring engine.
          </p>
          <div className="scoring-hero-pills">
            <span>{summary?.total_products_scored || 0} Products Scored</span>
            <span>{summary?.avg_attractiveness_score || 0} Average Score</span>
            <span>Top Product: {summary?.top_product_name || "N/A"} ({summary?.top_product_score || 0})</span>
          </div>
        </div>
        <div className="scoring-hero-visual">
          <div className="pulse-ring scoring-pulse" />
          <div className="pulse-ring scoring-pulse delay-1" />
          <span className="hero-icon">🏆</span>
        </div>
      </section>

      {/* ── Weighted Scoring Model Formula Breakdown ────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Scoring Model Architecture</p>
            <h2>Weighted Attractiveness Formula</h2>
          </div>
          <p className="muted">
            Attractiveness Score = 35% Attention + 25% Interaction + 20% Pickup + 15% Conversion + 5% Repeat
          </p>
        </div>

        <div className="formula-weights-grid">
          {FORMULA_WEIGHTS.map((fw) => (
            <div className="formula-weight-card" key={fw.label} style={{ "--accent": fw.color }}>
              <div className="fw-header">
                <span className="fw-icon">{fw.icon}</span>
                <span className="fw-badge">{fw.weight}</span>
              </div>
              <strong>{fw.label}</strong>
              <p>{fw.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Engine Capabilities ─────────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Engine Capabilities</p>
            <h2>Scoring Engine Modules</h2>
          </div>
          <p className="muted">
            Five scoring models evaluating visual attention, physical handling, visibility, and marketing lift
          </p>
        </div>

        <div className="engine-grid">
          {SCORING_CAPABILITIES.map((cap) => (
            <div className="engine-card" key={cap.title}>
              <span className="engine-icon">{cap.icon}</span>
              <strong>{cap.title}</strong>
              <p>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scored Products Leaderboard & Table ───────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Inventory Performance Leaderboard</p>
            <h2>Scored Product Rankings</h2>
          </div>
          <p className="muted">Ranked list of inventory items sorted by Product Attractiveness Score</p>
        </div>

        <div className="metric-table-wrap">
          <table className="metric-detail-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product Name</th>
                <th>Grade</th>
                <th>Attractiveness Score</th>
                <th>Visibility</th>
                <th>Engagement</th>
                <th>Conversion Potential</th>
                <th>Marketing Lift</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.product_id}>
                  <td><strong>#{idx + 1}</strong></td>
                  <td>
                    <strong>{p.product_name}</strong>
                    <div className="product-sub-bars">
                      <div className="mini-bar-row" title="Attention Duration (35%)">
                        <span>Att (35%)</span>
                        <div className="mini-track">
                          <div className="mini-fill" style={{ width: `${p.sub_scores?.attention_duration || 0}%`, background: "#f39c12" }} />
                        </div>
                      </div>
                      <div className="mini-bar-row" title="Interaction Freq (25%)">
                        <span>Int (25%)</span>
                        <div className="mini-track">
                          <div className="mini-fill" style={{ width: `${p.sub_scores?.interaction_frequency || 0}%`, background: "#e67e22" }} />
                        </div>
                      </div>
                      <div className="mini-bar-row" title="Pickup Rate (20%)">
                        <span>Pick (20%)</span>
                        <div className="mini-track">
                          <div className="mini-fill" style={{ width: `${p.sub_scores?.pickup_rate || 0}%`, background: "#d35400" }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`grade-badge ${getGradeBadgeClass(p.tier_grade)}`}>
                      {p.tier_grade}
                    </span>
                  </td>
                  <td>
                    <strong className="score-number">{p.attractiveness_score} / 100</strong>
                  </td>
                  <td>{p.shelf_visibility_score}%</td>
                  <td>{p.engagement_score}%</td>
                  <td>{p.conversion_potential_score}%</td>
                  <td>{p.marketing_effectiveness_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Role Hint ──────────────────────────────────── */}
      <p className="role-hint">
        Logged in as <strong>{session?.role?.name || "Unknown"}</strong>. Product attractiveness scoring metrics are available to all roles.
      </p>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default ProductScoring;
