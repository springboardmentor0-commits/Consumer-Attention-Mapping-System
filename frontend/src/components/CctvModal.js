import React, { useState, useEffect } from "react";
import { fetchStores, fetchShelves } from "../api/api";
import {
  X,
  Video,
  Eye,
  Layers,
  Camera,
  Store,
} from "./Icons";

const CctvModal = ({ isOpen, onClose, initialStoreId = 1 }) => {
  const [dbStores, setDbStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(initialStoreId);
  const [dbCameras, setDbCameras] = useState([]);
  const [activeCam, setActiveCam] = useState("Cam 1");
  const [activeCamLabel, setActiveCamLabel] = useState("Main Aisle Feed");
  const [showBoxes, setShowBoxes] = useState(true);
  const [showGaze, setShowGaze] = useState(true);
  const [fps, setFps] = useState(30);
  const [loading, setLoading] = useState(false);

  // Dynamic animated human detections on video canvas
  const [detections, setDetections] = useState([
    { id: 1, label: "Person #104 [Gaze: Shelf 01]", conf: 96, x: 22, y: 30, w: 18, h: 42, gazeX: 45, gazeY: 35 },
    { id: 2, label: "Person #108 [Gaze: Shelf 02]", conf: 91, x: 55, y: 25, w: 16, h: 45, gazeX: 70, gazeY: 28 },
    { id: 3, label: "Person #112 [Passing By]", conf: 88, x: 78, y: 50, w: 14, h: 38, gazeX: 85, gazeY: 70 },
  ]);

  // Load Stores dynamically from Database API when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const loadDbStores = async () => {
      setLoading(true);
      const stores = await fetchStores();
      setDbStores(stores || []);
      
      const sId = initialStoreId || (stores && stores[0] ? stores[0].id : 1);
      setSelectedStoreId(sId);
      setLoading(false);
    };
    loadDbStores();
  }, [isOpen, initialStoreId]);

  // Load Cameras dynamically from Database Shelves API whenever selected store changes
  useEffect(() => {
    if (!isOpen || !selectedStoreId) return;
    const loadDbStoreCameras = async () => {
      const shelves = await fetchShelves(selectedStoreId);
      
      // Construct DB-bound camera list based on store's active database shelves
      let cams = [];
      if (shelves && shelves.length > 0) {
        cams = shelves.map((sh, idx) => ({
          id: `Cam ${idx + 1}`,
          name: `Cam ${idx + 1} - ${sh.name || sh.zone_name}`,
          shelfName: sh.name || sh.zone_name,
          category: sh.category || "Retail Zone",
          status: idx % 2 === 0 ? "LIVE 4K" : "LIVE 1080p",
        }));
      } else {
        cams = [
          { id: "Cam 1", name: "Cam 1 - Main Aisle Display", shelfName: "Main Display", category: "Retail", status: "LIVE 4K" },
          { id: "Cam 2", name: "Cam 2 - Store Perimeter & Entrance", shelfName: "Entrance", category: "Corridor", status: "LIVE 1080p" },
        ];
      }

      setDbCameras(cams);
      if (cams.length > 0) {
        setActiveCam(cams[0].id);
        setActiveCamLabel(cams[0].name);
      }
    };
    loadDbStoreCameras();
  }, [isOpen, selectedStoreId]);

  // Dynamic FPS & BBox simulation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setFps(28 + Math.floor(Math.random() * 4));
      setDetections((prev) =>
        prev.map((det) => ({
          ...det,
          x: Math.max(10, Math.min(80, det.x + (Math.random() * 4 - 2))),
          y: Math.max(20, Math.min(60, det.y + (Math.random() * 2 - 1))),
          conf: Math.min(99, Math.max(85, det.conf + Math.floor(Math.random() * 3 - 1))),
        }))
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStoreObj = dbStores.find((s) => Number(s.id) === Number(selectedStoreId)) || dbStores[0] || {
    id: selectedStoreId,
    name: `Store #${selectedStoreId}`,
    location: "Commercial Hub",
  };

  const handleStoreChange = (e) => {
    const sId = Number(e.target.value);
    setSelectedStoreId(sId);
  };

  const handleCameraSelect = (cam) => {
    setActiveCam(cam.id);
    setActiveCamLabel(cam.name);
  };

  return (
    <div className="cctv-modal-overlay" onClick={onClose}>
      <div className="cctv-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="cctv-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(0, 242, 254, 0.15)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
              }}
            >
              <Video size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                CCTV Camera Stream with YOLO Integration
              </h3>
              <p style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                Database Connected • {currentStoreObj.name || currentStoreObj.store_name}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="glass-badge glass-badge-emerald">
              <span className="pulse-dot"></span>
              <span>YOLO v8 Active</span>
            </div>
            <button
              onClick={onClose}
              className="glass-btn glass-btn-secondary"
              style={{ padding: "0.4rem", borderRadius: "50%" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "0" }}>
          {/* Stream Player Area */}
          <div className="cctv-video-container">
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "radial-gradient(ellipse at center, rgba(13, 20, 42, 0.9) 0%, rgba(4, 6, 13, 0.98) 100%)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Grid Lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "linear-gradient(rgba(0, 242, 254, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.03) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Stream Details Watermark */}
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                  background: "rgba(0, 0, 0, 0.65)",
                  padding: "0.55rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Camera size={12} color="var(--accent-cyan)" /> {activeCamLabel}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--accent-cyan)", fontFamily: "monospace" }}>
                  FPS: {fps} | RES: 1920x1080 | LATENCY: 14ms
                </div>
              </div>

              {/* YOLO Detection Bounding Boxes */}
              {showBoxes &&
                detections.map((det) => (
                  <React.Fragment key={det.id}>
                    {/* Bounding Box */}
                    <div
                      className="cctv-overlay-box"
                      style={{
                        left: `${det.x}%`,
                        top: `${det.y}%`,
                        width: `${det.w}%`,
                        height: `${det.h}%`,
                      }}
                    >
                      <div className="cctv-overlay-tag">
                        {det.label} ({det.conf}%)
                      </div>
                    </div>

                    {/* Gaze Vector Line */}
                    {showGaze && (
                      <svg
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          pointerEvents: "none",
                        }}
                      >
                        <line
                          x1={`${det.x + det.w / 2}%`}
                          y1={`${det.y + 10}%`}
                          x2={`${det.gazeX}%`}
                          y2={`${det.gazeY}%`}
                          stroke="var(--accent-cyan)"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                        />
                        <circle
                          cx={`${det.gazeX}%`}
                          cy={`${det.gazeY}%`}
                          r="4"
                          fill="var(--accent-pink)"
                        />
                      </svg>
                    )}
                  </React.Fragment>
                ))}

              {/* Center Simulated Feed Graphic */}
              <div
                style={{
                  border: "1px dashed rgba(255, 255, 255, 0.15)",
                  padding: "2rem",
                  borderRadius: "16px",
                  textAlign: "center",
                  color: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <Eye size={48} style={{ opacity: 0.25, marginBottom: "0.5rem" }} />
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                  LIVE INFERENCE STREAM [{activeCam}]
                </p>
                <div style={{ fontSize: "0.775rem", color: "var(--accent-cyan)", marginTop: "0.25rem" }}>
                  {activeCamLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - 1st: SELECT STORE FROM DATABASE, 2nd: LIST OF CAMERAS OF THAT STORE FROM DB */}
          <div
            style={{
              padding: "1.25rem",
              background: "rgba(255, 255, 255, 0.02)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              overflowY: "auto",
            }}
          >
            {/* 1st Option: SELECT STORE FROM DATABASE */}
            <div>
              <label className="glass-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Store size={14} color="var(--accent-cyan)" />
                1. Select Store (Database Roster)
              </label>
              <select
                value={selectedStoreId}
                onChange={handleStoreChange}
                className="glass-select"
                style={{ fontSize: "0.85rem", fontWeight: 700 }}
              >
                {dbStores.map((st) => {
                  const sName = st.name || st.store_name || `Store #${st.id}`;
                  return (
                    <option key={st.id} value={st.id}>
                      {sName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2nd Option: LIST OF CAMERAS FOR SELECTED DATABASE STORE */}
            <div>
              <label className="glass-label" style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Camera size={14} color="var(--accent-cyan)" />
                2. Select Store Camera ({dbCameras.length} Active in DB)
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {loading ? (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.5rem" }}>
                    Loading store camera feeds...
                  </div>
                ) : dbCameras.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.5rem" }}>
                    No active cameras found for this store.
                  </div>
                ) : (
                  dbCameras.map((cam) => (
                    <button
                      key={cam.id}
                      onClick={() => handleCameraSelect(cam)}
                      className="glass-btn"
                      style={{
                        justifyContent: "space-between",
                        fontSize: "0.775rem",
                        padding: "0.55rem 0.75rem",
                        textAlign: "left",
                        background: activeCam === cam.id ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.03)",
                        borderColor: activeCam === cam.id ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                        color: activeCam === cam.id ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      <span>{cam.name}</span>
                      <span className="glass-badge glass-badge-emerald" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                        {cam.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Detection Controls */}
            <div>
              <label className="glass-label" style={{ marginBottom: "0.5rem", display: "block" }}>
                Detection Controls
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  onClick={() => setShowBoxes(!showBoxes)}
                  className={`glass-btn ${showBoxes ? "glass-btn-primary" : "glass-btn-secondary"}`}
                  style={{ fontSize: "0.775rem", padding: "0.45rem 0.75rem", justifyContent: "flex-start" }}
                >
                  <Layers size={14} />
                  <span>{showBoxes ? "Hide" : "Show"} YOLO BBoxes</span>
                </button>

                <button
                  onClick={() => setShowGaze(!showGaze)}
                  className={`glass-btn ${showGaze ? "glass-btn-primary" : "glass-btn-secondary"}`}
                  style={{ fontSize: "0.775rem", padding: "0.45rem 0.75rem", justifyContent: "flex-start" }}
                >
                  <Eye size={14} />
                  <span>{showGaze ? "Hide" : "Show"} Eye Gaze Vector</span>
                </button>
              </div>
            </div>

            {/* Live Analytics Info */}
            <div
              className="glass-card"
              style={{ padding: "0.85rem", background: "rgba(0, 242, 254, 0.04)", borderColor: "rgba(0, 242, 254, 0.2)" }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "0.4rem" }}>
                Database Connected Camera Info
              </div>
              <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div>Selected Store: <strong style={{ color: "#fff" }}>{currentStoreObj.name || currentStoreObj.store_name}</strong></div>
                <div>Active Stream: <strong style={{ color: "#fff" }}>{activeCamLabel}</strong></div>
                <div>Shoppers Tracked: <strong style={{ color: "var(--accent-emerald)" }}>{detections.length}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CctvModal;
