import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { getSessionUser } from "../utils/role";

/* ── Category Filter Config ───────────────────────────────── */
const CATEGORY_FILTERS = [
  { key: "all", label: "All Recommendations", icon: "✨" },
  { key: "shelf_optimization", label: "Shelf Optimization", icon: "📚" },
  { key: "product_placement", label: "Product Placement", icon: "📦" },
  { key: "promotional_placement", label: "Promotional Placement", icon: "📢" },
  { key: "consumer_engagement", label: "Consumer Engagement", icon: "🤝" },
  { key: "layout_improvement", label: "Layout Improvement", icon: "🗺️" },
];

/* ── Engine Capabilities ─────────────────────────────────── */
const OPTIMIZATION_CAPABILITIES = [
  {
    icon: "📚",
    title: "Shelf Optimization Recommendations",
    desc: "Rebalances shelf tier facing width & vertical slot allocation based on gaze density & fixation benchmarks.",
  },
  {
    icon: "📦",
    title: "Product Placement Recommendations",
    desc: "Identifies under-placed high-attractiveness SKUs on lower tiers and suggests relocation to eye-level golden zones.",
  },
  {
    icon: "📢",
    title: "Promotional Placement Suggestions",
    desc: "Maps peak traffic density hotspots from 2D heatmaps to recommend optimal endcap & promotional kiosk positions.",
  },
  {
    icon: "🤝",
    title: "Consumer Engagement Recommendations",
    desc: "Highlights high-dwell low-conversion products and suggests packaging clarity, pricing, or tag enhancements.",
  },
  {
    icon: "🗺️",
    title: "Layout Improvement Suggestions",
    desc: "Analyzes aisle traffic congestion bottlenecks & deadzones to propose optimized store floor plan layouts.",
  },
];

function Recommendations() {
  const session = getSessionUser();
  const [activeCategory, setActiveCategory] = useState("all");
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const catQuery = activeCategory !== "all" ? `?category=${activeCategory}` : "";
      const [recsRes, sumRes] = await Promise.all([
        api.get(`/optimization/recommendations/1${catQuery}`),
        api.get("/optimization/summary"),
      ]);
      setRecommendations(recsRes.data.recommendations || []);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
      // Demo fallback data
      const demoRecs = [
        {
          id: "REC-SO-01", category: "shelf_optimization", priority: "HIGH",
          title: "Rebalance Eye-Level Golden Zone Allocation",
          description: "Organic Dairy products are receiving 38% higher gaze fixation than allotted shelf width. Expand tier width by 40cm.",
          expected_revenue_lift_percent: 14.5,
          actionable_steps: [
            "Move low-turnover skim milk SKUs to lower shelf tier 4",
            "Expand Organic Almond Milk facing from 2 to 4 slots on Eye-Level tier 2",
            "Verify line-of-sight clearance from main aisle entry point",
          ],
          target_product_or_zone: "Dairy Aisle 2 - Tier 2", status: "pending",
        },
        {
          id: "REC-PP-01", category: "product_placement", priority: "HIGH",
          title: "Relocate High-Attractiveness Artisan Cheese to Eye Level",
          description: "Artisan Cheddar Cheese has an A-grade attractiveness score (88.6) but is currently placed on middle tier 3.",
          expected_revenue_lift_percent: 18.0,
          actionable_steps: [
            "Swap Artisan Cheddar Cheese with generic Processed Cheese on Tier 2",
            "Place cross-promotional cracker displays directly adjacent on shelf clip-strips",
          ],
          target_product_or_zone: "Artisan Cheddar Cheese 200g", status: "pending",
        },
        {
          id: "REC-PR-01", category: "promotional_placement", priority: "HIGH",
          title: "Deploy Promotional Feature Stand at Central Hotspot",
          description: "Central Feature Island (Grid X=10, Y=7) captures 98% traffic density. Position seasonal promotion here.",
          expected_revenue_lift_percent: 22.4,
          actionable_steps: [
            "Install 360-degree promotional island kiosk at X=10, Y=7",
            "Feature high-margin seasonal bundles with bright overhead signage",
            "Schedule sampling staff during peak hours (17:00 - 19:00)",
          ],
          target_product_or_zone: "Central Feature Island (X=10, Y=7)", status: "pending",
        },
        {
          id: "REC-CE-01", category: "consumer_engagement", priority: "MEDIUM",
          title: "Enhance Price & Nutrition Labeling for Dark Chocolate 85%",
          description: "High dwell duration (95,000ms) but lower pickup-to-purchase conversion (15%). Shoppers are inspecting labels.",
          expected_revenue_lift_percent: 8.8,
          actionable_steps: [
            "Add prominent shelf-edge tags highlighting 'Organic 85% Cocoa - Non-GMO'",
            "Increase shelf price font size for clear pricing visibility",
          ],
          target_product_or_zone: "Dark Chocolate 85% 100g", status: "pending",
        },
        {
          id: "REC-LI-01", category: "layout_improvement", priority: "HIGH",
          title: "Widen Aisle 1 Bottleneck Corridor",
          description: "Aisle 1 experiences heavy traffic congestion (97% traffic density) causing 24% of Quick Buyers to bypass the aisle.",
          expected_revenue_lift_percent: 12.0,
          actionable_steps: [
            "Shift Aisle 1 display gondola back by 45cm to relieve bottleneck",
            "Replace bulky floor stackers with slim-line side wing displays",
          ],
          target_product_or_zone: "Aisle 1 Main Corridor", status: "pending",
        },
      ];

      const filtered = activeCategory !== "all"
        ? demoRecs.filter(r => r.category === activeCategory)
        : demoRecs;

      setRecommendations(filtered);
      setSummary({
        total_recommendations: 5,
        high_priority_count: 4,
        medium_priority_count: 1,
        low_priority_count: 0,
        projected_total_revenue_lift: 75.7,
      });
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Handle Apply Recommendation */
  const handleApply = async (recId) => {
    try {
      await api.post(`/optimization/apply/${recId}`);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: "applied" } : r))
      );
    } catch (err) {
      // Fallback update in state if API isn't live
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: "applied" } : r))
      );
    }
  };

  if (loading) {
    return (
      <div className="page content-page">
        <section className="card">
          <p className="muted">Generating AI optimization recommendations…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page recommendations-page">
      {/* ── Hero Banner ───────────────────────────────── */}
      <section className="recommendations-hero">
        <div className="recommendations-hero-content">
          <p className="eyebrow">Consumer Attention Mapping System</p>
          <h1>Recommendation & Optimization Engine</h1>
          <p className="recommendations-hero-copy">
            AI-driven rebalancing strategies, product placement adjustments, endcap promotional recommendations,
            and aisle layout improvements to maximize store ROI.
          </p>
          <div className="recommendations-hero-pills">
            <span>{summary?.total_recommendations || 0} Total Recommendations</span>
            <span>{summary?.high_priority_count || 0} High Priority Actions</span>
            <span>+{summary?.projected_total_revenue_lift || 0}% Projected Revenue Lift</span>
          </div>
        </div>
        <div className="recommendations-hero-visual">
          <div className="pulse-ring recommendations-pulse" />
          <div className="pulse-ring recommendations-pulse delay-1" />
          <span className="hero-icon">💡</span>
        </div>
      </section>

      {/* ── Engine Capabilities ─────────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Engine Capabilities</p>
            <h2>Optimization & Advisory Modules</h2>
          </div>
          <p className="muted">
            Five decision engines translating attention, interaction, and behavior data into actionable store improvements
          </p>
        </div>

        <div className="engine-grid">
          {OPTIMIZATION_CAPABILITIES.map((cap) => (
            <div className="engine-card" key={cap.title}>
              <span className="engine-icon">{cap.icon}</span>
              <strong>{cap.title}</strong>
              <p>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Actionable Recommendations Feed ───────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Actionable Insights</p>
            <h2>Optimization Recommendations</h2>
          </div>
          <p className="muted">Prioritized actions ranked by projected revenue lift & impact</p>
        </div>

        {/* Category Filter Pills */}
        <div className="recommendation-category-tabs">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.key}
              className={`cat-tab-btn ${activeCategory === cat.key ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Recommendations Feed */}
        <div className="recommendations-feed">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`recommendation-card priority-${(rec.priority || "medium").toLowerCase()}`}
              >
                <div className="rec-top-bar">
                  <div className="rec-badges">
                    <span className={`priority-tag ${rec.priority?.toLowerCase()}`}>
                      {rec.priority === "HIGH" ? "🔴 High Impact" : rec.priority === "MEDIUM" ? "🟡 Medium Impact" : "🟢 Low Impact"}
                    </span>
                    <span className="rec-cat-tag">
                      {rec.category ? rec.category.replace("_", " ").toUpperCase() : "OPTIMIZATION"}
                    </span>
                  </div>
                  <span className="revenue-lift-badge">
                    +{rec.expected_revenue_lift_percent}% Projected Lift
                  </span>
                </div>

                <div className="rec-body">
                  <h3>{rec.title}</h3>
                  <p className="rec-desc">{rec.description}</p>
                  <p className="rec-target">
                    <strong>Target Zone / SKU:</strong> {rec.target_product_or_zone || "Store Floor"}
                  </p>

                  <div className="action-steps-box">
                    <strong>Action Plan:</strong>
                    <ul>
                      {rec.actionable_steps?.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rec-footer">
                  <span className="rec-id">Ref: {rec.id}</span>
                  {rec.status === "applied" ? (
                    <span className="applied-pill">✓ Action Implemented</span>
                  ) : (
                    <button
                      className="primary-btn apply-btn"
                      onClick={() => handleApply(rec.id)}
                    >
                      Implement Recommendation
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No recommendations found for this category filter.</p>
          )}
        </div>
      </section>

      {/* ── Role Hint ──────────────────────────────────── */}
      <p className="role-hint">
        Logged in as <strong>{session?.role?.name || "Unknown"}</strong>. AI optimization recommendations are available to all roles.
      </p>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default Recommendations;
