import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { getSessionUser } from "../utils/role";

/* ── Heatmap Modes ───────────────────────────────────────── */
const HEATMAP_MODES = [
  { key: "store_heatmap", label: "Store Heatmap", icon: "🏬", endpoint: "/heatmap/store/1" },
  { key: "shelf_heatmap", label: "Shelf Heatmap", icon: "📚", endpoint: "/heatmap/shelf/1/1" },
  { key: "product_attention_heatmap", label: "Product Attention", icon: "📦", endpoint: "/heatmap/products/1" },
  { key: "customer_traffic_heatmap", label: "Customer Traffic", icon: "🚶", endpoint: "/heatmap/generate?heatmap_type=customer_traffic_heatmap" },
  { key: "engagement_hotspot", label: "Engagement Hotspots", icon: "🔥", endpoint: "/heatmap/hotspots/1" },
];

/* ── Engine Capabilities ─────────────────────────────────── */
const HEATMAP_CAPABILITIES = [
  {
    icon: "🏬",
    title: "Store Heatmap Generation",
    desc: "Computes 2D Gaussian Kernel Density Estimation (KDE) over floor plan coordinates to map overall shopper dwell and movement density.",
  },
  {
    icon: "📚",
    title: "Shelf Heatmap Generation",
    desc: "Maps eye gaze and hand touch fixations on 2D shelf elevation zones to quantify tier-by-tier visual attention.",
  },
  {
    icon: "📦",
    title: "Product Attention Heatmaps",
    desc: "Overlays gaze density directly onto product bounding boxes to calculate per-item visual fixation intensity.",
  },
  {
    icon: "🚶",
    title: "Customer Traffic Heatmaps",
    desc: "Tracks shopper spatial trajectories to generate foot traffic flow maps, identifying high-speed corridors and bottleneck zones.",
  },
  {
    icon: "🔥",
    title: "Engagement Hotspot Analysis",
    desc: "Applies 2D local maxima detection on intensity grids to isolate peak engagement hotspots and under-performing cold zones.",
  },
];

/* ── Map 0.0-1.0 Intensity to Heatmap Color ─────────────── */
function getHeatmapColor(val) {
  if (val <= 0.1) return "rgba(10, 24, 44, 0.85)";           /*Deep Navy (Coldest)*/
  if (val <= 0.3) return "rgba(30, 144, 255, 0.75)";          /*# Cyan / Blue*/
  if (val <= 0.5) return "rgba(46, 204, 113, 0.8)";           /*# Green*/
  if (val <= 0.7) return "rgba(241, 196, 15, 0.85)";         /* # Yellow / Amber*/
  if (val <= 0.85) return "rgba(230, 126, 34, 0.9)";          /*# Orange / Coral*/
  return "rgba(231, 76, 60, 0.95)";                         /*# Crimson Red (Peak Hotspot)*/
}

function HeatmapAnalytics() {
  const session = getSessionUser();
  const [activeMode, setActiveMode] = useState(HEATMAP_MODES[0]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  /* Load System Summary */
  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await api.get("/heatmap/summary");
        setSummary(res.data);
      } catch (err) {
        setSummary({
          total_heatmaps_generated: 48,
          total_hotspots_detected: 36,
          total_coldspots_detected: 12,
          active_stores: 4,
          active_shelves: 18,
        });
      }
    }
    loadSummary();
  }, []);

  /* Load Active Mode Heatmap Data */
  const fetchHeatmap = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(activeMode.endpoint);
      // Format response if coming from /hotspots endpoint
      if (res.data.all_hotspots && !res.data.grid) {
        // Fetch direct grid for hotspots
        const gridRes = await api.get("/heatmap/generate?heatmap_type=engagement_hotspot");
        setHeatmapData(gridRes.data);
      } else {
        setHeatmapData(res.data);
      }
    } catch (err) {
      console.error(err);
      // Generate synthetic 2D grid matrix for fallback
      const fallbackGrid = [];
      for (let r = 0; r < 12; r++) {
        const row = [];
        for (let c = 0; c < 18; c++) {
          const dist1 = Math.hypot(r - 4, c - 5);
          const dist2 = Math.hypot(r - 8, c - 14);
          const val = Math.max(0, 1 - dist1 / 5) * 0.9 + Math.max(0, 1 - dist2 / 4) * 0.95;
          row.push(parseFloat(Math.min(1.0, val).toFixed(2)));
        }
        fallbackGrid.push(row);
      }
      setHeatmapData({
        heatmap_type: activeMode.key,
        resolution: { width: 18, height: 12 },
        max_intensity: 1.0,
        grid: fallbackGrid,
        hotspots: [
          { zone_id: "HS1", label: "Central Feature Island", x: 5, y: 4, intensity: 0.90, type: "hotspot" },
          { zone_id: "HS2", label: "Right Endcap Display", x: 14, y: 8, intensity: 0.95, type: "hotspot" },
          { zone_id: "CS1", label: "Rear Corner Cold Zone", x: 1, y: 11, intensity: 0.05, type: "coldspot" },
        ],
        total_data_points: 340,
      });
    } finally {
      setLoading(false);
    }
  }, [activeMode]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  return (
    <div className="page heatmap-page">
      {/* ── Hero Banner ───────────────────────────────── */}
      <section className="heatmap-hero">
        <div className="heatmap-hero-content">
          <p className="eyebrow">Attention Heatmap Generation Engine</p>
          <h1>Spatial Heatmap & Hotspot Analytics</h1>
          <p className="heatmap-hero-copy">
            Generate 2D spatial intensity grids using Kernel Density Estimation (KDE).
            Visualize store traffic, shelf fixations, product attention, and engagement hotspots.
          </p>
          <div className="heatmap-hero-pills">
            <span>{summary?.total_heatmaps_generated || 0} Heatmaps Generated</span>
            <span>{summary?.total_hotspots_detected || 0} Hotspots Detected</span>
            <span>{summary?.active_shelves || 0} Active Shelves Mapped</span>
          </div>
        </div>
        <div className="heatmap-hero-visual">
          <div className="pulse-ring heatmap-pulse" />
          <div className="pulse-ring heatmap-pulse delay-1" />
          <span className="hero-icon">🔥</span>
        </div>
      </section>

      {/* ── Engine Capabilities ─────────────────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Engine Capabilities</p>
            <h2>Heatmap Generation Modules</h2>
          </div>
          <p className="muted">
            Five spatial density generators converting gaze, touch, and trajectory points into 2D heatmaps
          </p>
        </div>

        <div className="engine-grid">
          {HEATMAP_CAPABILITIES.map((cap) => (
            <div className="engine-card" key={cap.title}>
              <span className="engine-icon">{cap.icon}</span>
              <strong>{cap.title}</strong>
              <p>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2D Interactive Heatmap Canvas ─────────────────── */}
      <section className="card heatmap-visualizer-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Interactive Visualizer</p>
            <h2>2D Spatial Heatmap Grid</h2>
          </div>
          <p className="muted">
            Mode: <strong>{activeMode.label}</strong> — Normalized intensity matrix (0.0 cold to 1.0 hotspot)
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="heatmap-mode-tabs">
          {HEATMAP_MODES.map((m) => (
            <button
              key={m.key}
              className={`mode-tab-btn ${activeMode.key === m.key ? "active" : ""}`}
              onClick={() => setActiveMode(m)}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Heatmap Grid Visualizer */}
        <div className="heatmap-canvas-container">
          {loading ? (
            <div className="heatmap-loading-overlay">
              <p className="muted">Rendering {activeMode.label} KDE grid…</p>
            </div>
          ) : heatmapData?.grid ? (
            <div className="heatmap-grid-wrap">
              <div
                className="heatmap-2d-grid"
                style={{
                  gridTemplateColumns: `repeat(${heatmapData.grid[0]?.length || 18}, 1fr)`,
                }}
              >
                {heatmapData.grid.map((row, rIdx) =>
                  row.map((intensity, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="heatmap-cell"
                      style={{
                        backgroundColor: getHeatmapColor(intensity),
                        boxShadow: intensity > 0.75 ? `0 0 12px ${getHeatmapColor(intensity)}` : "none",
                      }}
                      onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx, val: intensity })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {intensity >= 0.75 && <span className="hotspot-dot">•</span>}
                    </div>
                  ))
                )}
              </div>

              {/* Heatmap Legend */}
              <div className="heatmap-legend">
                <span className="legend-label">0.0 (Cold)</span>
                <div className="legend-bar" />
                <span className="legend-label">1.0 (Peak Hotspot)</span>
              </div>
            </div>
          ) : null}

          {/* Hovered Cell Info Tooltip */}
          {hoveredCell && (
            <div className="cell-tooltip">
              <span>Cell [{hoveredCell.r}, {hoveredCell.c}]</span>
              <strong>Intensity: {(hoveredCell.val * 100).toFixed(0)}%</strong>
            </div>
          )}
        </div>
      </section>

      {/* ── Hotspot & Cold Zone Analysis ───────────────── */}
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Spot Analysis</p>
            <h2>Detected Hotspots & Cold Zones</h2>
          </div>
          <p className="muted">Key spatial zones requiring attention or optimization</p>
        </div>

        <div className="hotspot-grid">
          {heatmapData?.hotspots?.map((hs) => (
            <div
              key={hs.zone_id}
              className={`hotspot-card ${hs.type === "coldspot" ? "coldspot" : "hotspot"}`}
            >
              <div className="hotspot-header">
                <span className="hotspot-badge">
                  {hs.type === "coldspot" ? "❄️ Cold Zone" : "🔥 Peak Hotspot"}
                </span>
                <span className="hotspot-score">{(hs.intensity * 100).toFixed(0)}% Intensity</span>
              </div>
              <strong>{hs.label}</strong>
              <p className="muted">Grid Position: X={hs.x}, Y={hs.y}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Hint ──────────────────────────────────── */}
      <p className="role-hint">
        Logged in as <strong>{session?.role?.name || "Unknown"}</strong>. Spatial heatmap analytics are available to all roles.
      </p>
    </div>
  );
}

export default HeatmapAnalytics;
