import React, { useState, useEffect } from "react";
import { getStoreLayout, saveStoreLayout } from "../api/api";
import {
  Grid,
  Camera,
  Layers,
  X,
  Save,
  Trash2,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Store,
} from "./Icons";

// Helper directional cone styling & angles
const DIRECTION_CONFIG = {
  N: { label: "North ↑", angle: 0, arrow: "↑", coneStyle: { top: "-45px", left: "-15px", width: "70px", height: "50px", clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)" } },
  E: { label: "East →", angle: 90, arrow: "→", coneStyle: { top: "-15px", left: "25px", width: "50px", height: "70px", clipPath: "polygon(0% 50%, 100% 0%, 100% 100%)" } },
  S: { label: "South ↓", angle: 180, arrow: "↓", coneStyle: { top: "25px", left: "-15px", width: "70px", height: "50px", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" } },
  W: { label: "West ←", angle: 270, arrow: "←", coneStyle: { top: "-15px", left: "-45px", width: "50px", height: "70px", clipPath: "polygon(100% 50%, 0% 0%, 0% 100%)" } },
};

const CATEGORY_COLORS = {
  Electronics: { bg: "rgba(0, 242, 254, 0.2)", border: "#00f2fe", text: "#00f2fe" },
  Apparel: { bg: "rgba(236, 72, 153, 0.2)", border: "#ec4899", text: "#ec4899" },
  Groceries: { bg: "rgba(16, 185, 129, 0.2)", border: "#10b981", text: "#6ee7b7" },
  Beauty: { bg: "rgba(168, 85, 247, 0.2)", border: "#a855f7", text: "#c084fc" },
  Footwear: { bg: "rgba(245, 158, 11, 0.2)", border: "#f59e0b", text: "#fbbf24" },
  Jewelry: { bg: "rgba(234, 179, 8, 0.2)", border: "#eab308", text: "#fde047" },
  Optics: { bg: "rgba(59, 130, 246, 0.2)", border: "#3b82f6", text: "#60a5fa" },
  Default: { bg: "rgba(121, 40, 202, 0.2)", border: "#7928ca", text: "#d8b4fe" },
};

const StoreMapDesignerModal = ({ isOpen, onClose, store, shelves = [], onSaveSuccess }) => {
  const currentStoreId = store ? store.id : 1;
  const storeName = store ? (store.name || store.store_name) : `Store #${currentStoreId}`;

  // Dynamic Grid Dimensions (8x8, 10x10, 12x12, 15x15, 20x20)
  const [gridSize, setGridSize] = useState(10);

  // Active designer placement mode
  const [activeMode, setActiveMode] = useState("shelf");

  // Local state for layout map elements
  const [cameras, setCameras] = useState([]);
  const [shelfPositions, setShelfPositions] = useState([]);
  const [entrances, setEntrances] = useState([{ id: "ent-1", grid_x: 0, grid_y: 0 }]);
  const [exits, setExits] = useState([{ id: "ext-1", grid_x: 0, grid_y: 1 }]);
  const [checkouts, setCheckouts] = useState([{ id: "chk-1", grid_x: 9, grid_y: 9 }]);

  // Selected tool settings
  const [selectedShelfId, setSelectedShelfId] = useState(shelves[0]?.id || null);
  const [newCameraName, setNewCameraName] = useState("CCTV Camera #1");
  const [newCameraDir, setNewCameraDir] = useState("E");

  // Selected cell inspection state
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [notification, setNotification] = useState("");

  // Load layout on open
  useEffect(() => {
    if (!isOpen) return;

    const savedLayout = getStoreLayout(currentStoreId);
    const gRows = savedLayout.grid_rows || savedLayout.grid_size || 10;
    setGridSize(gRows);

    setCameras(savedLayout.cameras || []);
    if (savedLayout.entrances && savedLayout.entrances.length > 0) setEntrances(savedLayout.entrances);
    if (savedLayout.exits && savedLayout.exits.length > 0) setExits(savedLayout.exits);
    if (savedLayout.checkouts && savedLayout.checkouts.length > 0) setCheckouts(savedLayout.checkouts);

    // Initialize shelf grid positions from shelves prop or saved layout
    if (savedLayout.shelves_grid && savedLayout.shelves_grid.length > 0) {
      setShelfPositions(savedLayout.shelves_grid);
    } else {
      const mappedShelves = shelves.map((sh, idx) => {
        let r = sh.grid_y !== undefined ? sh.grid_y : Math.min(gRows - 1, Math.floor(((sh.position_y || 25) / 100) * gRows));
        let c = sh.grid_x !== undefined ? sh.grid_x : Math.min(gRows - 1, Math.floor(((sh.position_x || 25) / 100) * gRows));

        if (idx === 0) { r = 2; c = 2; }
        else if (idx === 1) { r = 2; c = Math.min(gRows - 3, 7); }
        else if (idx === 2) { r = Math.min(gRows - 3, 7); c = 2; }
        else if (idx === 3) { r = Math.min(gRows - 3, 7); c = Math.min(gRows - 3, 7); }

        return {
          id: sh.id,
          shelf_number: sh.shelf_number || String(idx + 1).padStart(2, "0"),
          name: sh.name,
          category: sh.category || "Electronics",
          grid_x: c,
          grid_y: r,
        };
      });

      setShelfPositions(mappedShelves);
    }

    if (shelves.length > 0) {
      setSelectedShelfId(shelves[0].id);
    }
  }, [isOpen, currentStoreId, shelves]);

  if (!isOpen) return null;

  // Grid lookup helpers
  const getShelfAt = (r, c) => shelfPositions.find((sh) => sh.grid_y === r && sh.grid_x === c);
  const getCameraAt = (r, c) => cameras.find((cam) => cam.grid_y === r && cam.grid_x === c);
  const getEntranceAt = (r, c) => entrances.find((item) => item.grid_y === r && item.grid_x === c);
  const getExitAt = (r, c) => exits.find((item) => item.grid_y === r && item.grid_x === c);
  const getCheckoutAt = (r, c) => checkouts.find((item) => item.grid_y === r && item.grid_x === c);

  // Cell click handler
  const handleCellClick = (r, c) => {
    setSelectedCell({ r, c });

    const existingShelf = getShelfAt(r, c);
    const existingCam = getCameraAt(r, c);
    const existingEnt = getEntranceAt(r, c);
    const existingExt = getExitAt(r, c);
    const existingChk = getCheckoutAt(r, c);

    if (activeMode === "eraser") {
      if (existingShelf) setShelfPositions((prev) => prev.filter((s) => s.id !== existingShelf.id));
      if (existingCam) setCameras((prev) => prev.filter((cam) => cam.id !== existingCam.id));
      if (existingEnt) setEntrances((prev) => prev.filter((item) => item.id !== existingEnt.id));
      if (existingExt) setExits((prev) => prev.filter((item) => item.id !== existingExt.id));
      if (existingChk) setCheckouts((prev) => prev.filter((item) => item.id !== existingChk.id));
      showToast(`Cleared Grid Cell (${r}, ${c})`);
      return;
    }

    if (activeMode === "shelf") {
      if (!selectedShelfId) return;
      const targetShelf = shelves.find((s) => s.id === Number(selectedShelfId));
      if (!targetShelf) return;

      setShelfPositions((prev) => {
        const otherShelves = prev.filter((s) => s.id !== targetShelf.id);
        return [
          ...otherShelves,
          {
            id: targetShelf.id,
            shelf_number: targetShelf.shelf_number || "01",
            name: targetShelf.name,
            category: targetShelf.category || "Electronics",
            grid_x: c,
            grid_y: r,
          },
        ];
      });
      showToast(`Placed ${targetShelf.name} at Cell (${r}, ${c})`);
    } else if (activeMode === "camera") {
      if (existingCam) {
        const dirs = ["N", "E", "S", "W"];
        const nextDir = dirs[(dirs.indexOf(existingCam.direction) + 1) % 4];
        setCameras((prev) =>
          prev.map((cam) => (cam.id === existingCam.id ? { ...cam, direction: nextDir } : cam))
        );
        showToast(`Rotated ${existingCam.name} to ${DIRECTION_CONFIG[nextDir].label}`);
      } else {
        const newCamObj = {
          id: `cam-${Date.now()}`,
          name: newCameraName || `CCTV #${cameras.length + 1}`,
          grid_x: c,
          grid_y: r,
          direction: newCameraDir,
          status: "Active Streaming",
        };
        setCameras((prev) => [...prev, newCamObj]);
        showToast(`Placed Camera "${newCamObj.name}" facing ${DIRECTION_CONFIG[newCameraDir].label}`);
      }
    } else if (activeMode === "entrance") {
      setEntrances((prev) => {
        const filtered = prev.filter((item) => !(item.grid_x === c && item.grid_y === r));
        return [...filtered, { id: `ent-${Date.now()}`, grid_x: c, grid_y: r }];
      });
      showToast(`Placed Entrance [IN] at Cell (${r}, ${c})`);
    } else if (activeMode === "exit") {
      setExits((prev) => {
        const filtered = prev.filter((item) => !(item.grid_x === c && item.grid_y === r));
        return [...filtered, { id: `ext-${Date.now()}`, grid_x: c, grid_y: r }];
      });
      showToast(`Placed Exit [OUT] at Cell (${r}, ${c})`);
    } else if (activeMode === "checkout") {
      setCheckouts((prev) => {
        const filtered = prev.filter((item) => !(item.grid_x === c && item.grid_y === r));
        return [...filtered, { id: `chk-${Date.now()}`, grid_x: c, grid_y: r }];
      });
      showToast(`Placed Checkout Counter [CASH] at Cell (${r}, ${c})`);
    }
  };

  const handleRotateSelectedCamera = (camId) => {
    const dirs = ["N", "E", "S", "W"];
    setCameras((prev) =>
      prev.map((cam) => {
        if (cam.id === camId) {
          const nextDir = dirs[(dirs.indexOf(cam.direction) + 1) % 4];
          showToast(`Camera direction updated to ${DIRECTION_CONFIG[nextDir].label}`);
          return { ...cam, direction: nextDir };
        }
        return cam;
      })
    );
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleResetGrid = () => {
    if (window.confirm("Are you sure you want to clear all layout grid items?")) {
      setCameras([]);
      setShelfPositions([]);
      setEntrances([]);
      setExits([]);
      setCheckouts([]);
      showToast("Store grid canvas cleared.");
    }
  };

  const handleSaveLayout = () => {
    const layoutPayload = {
      grid_rows: gridSize,
      grid_cols: gridSize,
      grid_size: gridSize,
      cameras: cameras,
      shelves_grid: shelfPositions,
      entrances: entrances,
      exits: exits,
      checkouts: checkouts,
    };

    saveStoreLayout(currentStoreId, layoutPayload);

    if (onSaveSuccess) {
      onSaveSuccess(layoutPayload, shelfPositions);
    }
    showToast("2D Store Map Layout Saved Successfully!");
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const activeSelectedCam = selectedCell ? getCameraAt(selectedCell.r, selectedCell.c) : null;
  const activeSelectedShelf = selectedCell ? getShelfAt(selectedCell.r, selectedCell.c) : null;
  const activeSelectedEnt = selectedCell ? getEntranceAt(selectedCell.r, selectedCell.c) : null;
  const activeSelectedExt = selectedCell ? getExitAt(selectedCell.r, selectedCell.c) : null;
  const activeSelectedChk = selectedCell ? getCheckoutAt(selectedCell.r, selectedCell.c) : null;

  return (
    <div className="cctv-modal-overlay" onClick={onClose} style={{ zIndex: 2200 }}>
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "rgba(0, 242, 254, 0.2)",
            border: "1px solid var(--accent-cyan)",
            color: "#fff",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-md)",
            backdropFilter: "blur(16px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 0 20px rgba(0, 242, 254, 0.4)",
          }}
        >
          <CheckCircle2 size={18} color="var(--accent-cyan)" />
          <span>{notification}</span>
        </div>
      )}

      <div
        className="glass-panel-glow"
        style={{
          width: "96%",
          maxWidth: "1250px",
          height: "92vh",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
          background: "#060914",
          border: "1px solid rgba(0, 242, 254, 0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(121, 40, 202, 0.2) 100%)",
                border: "1px solid var(--accent-cyan)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
              }}
            >
              <Grid size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>
                  2D Store Grid Map Layout Designer
                </h2>
                <span className="glass-badge glass-badge-purple" style={{ fontSize: "0.725rem" }}>
                  <ShieldCheck size={13} /> Full Admin Privileges Enabled
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                Store: <strong style={{ color: "#fff" }}>{storeName}</strong> • Configure Shelves, Cameras & Directions, Entrances, Exits, & Checkout Counters
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Dynamic Grid Size Expand Option */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)" }}>Grid Matrix:</span>
              <select
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="glass-select"
                style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem", fontWeight: 700, color: "#fff", background: "rgba(0, 242, 254, 0.1)", borderColor: "var(--accent-cyan)", width: "auto" }}
              >
                <option value={8}>8 x 8 Grid</option>
                <option value={10}>10 x 10 Grid (Default)</option>
                <option value={12}>12 x 12 Grid (Expanded)</option>
                <option value={15}>15 x 15 Grid (Large Store)</option>
                <option value={20}>20 x 20 Grid (Ultra Store)</option>
              </select>
            </div>

            <button onClick={handleResetGrid} className="glass-btn glass-btn-secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}>
              <Trash2 size={15} />
              <span>Clear Grid</span>
            </button>

            <button onClick={handleSaveLayout} className="glass-btn glass-btn-primary" style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem", boxShadow: "0 0 20px rgba(0, 242, 254, 0.4)" }}>
              <Save size={16} />
              <span>Save 2D Store Map</span>
            </button>

            <button onClick={onClose} className="glass-btn glass-btn-secondary" style={{ padding: "0.45rem" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Designer Grid Body */}
        <div style={{ display: "grid", gridTemplateColumns: "330px 1fr", gap: "1.25rem", flex: 1, overflow: "hidden" }}>
          
          {/* LEFT TOOLBAR & PALETTE */}
          <div
            className="glass-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              background: "rgba(255, 255, 255, 0.02)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              overflowY: "auto",
              padding: "1.1rem",
            }}
          >
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent-cyan)", display: "block", marginBottom: "0.5rem" }}>
                Admin Palette Tools
              </label>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                {[
                  { id: "shelf", label: "Place Shelf", icon: Layers, color: "var(--accent-cyan)" },
                  { id: "camera", label: "Place Camera", icon: Camera, color: "var(--accent-purple)" },
                  { id: "entrance", label: "Place Entrance", icon: MapPin, color: "#6ee7b7" },
                  { id: "exit", label: "Place Exit", icon: MapPin, color: "#fca5a5" },
                  { id: "checkout", label: "Checkout Counter", icon: Store, color: "#fde047" },
                  { id: "eraser", label: "Clear Cell", icon: Trash2, color: "#f87171" },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeMode === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveMode(tool.id)}
                      className="glass-btn"
                      style={{
                        background: isActive ? "rgba(0, 242, 254, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        borderColor: isActive ? tool.color : "rgba(255, 255, 255, 0.08)",
                        color: isActive ? "#fff" : "var(--text-muted)",
                        padding: "0.55rem 0.4rem",
                        fontSize: "0.75rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <Icon size={16} color={isActive ? tool.color : "currentColor"} />
                      <span>{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SHELF TOOL OPTIONS */}
            {activeMode === "shelf" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "rgba(0, 242, 254, 0.04)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(0, 242, 254, 0.15)" }}>
                <label className="glass-label" style={{ fontSize: "0.8rem", color: "#fff" }}>
                  Select Store Shelf to Position
                </label>
                <select
                  className="glass-select"
                  value={selectedShelfId || ""}
                  onChange={(e) => setSelectedShelfId(Number(e.target.value))}
                >
                  {shelves.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      Shelf {sh.shelf_number} - {sh.name} ({sh.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CAMERA TOOL OPTIONS */}
            {activeMode === "camera" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "rgba(121, 40, 202, 0.08)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(121, 40, 202, 0.3)" }}>
                <div className="glass-input-group">
                  <label className="glass-label" style={{ fontSize: "0.8rem", color: "#fff" }}>
                    Camera Identifier
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    value={newCameraName}
                    onChange={(e) => setNewCameraName(e.target.value)}
                    placeholder="e.g. CCTV Entrance Lens"
                  />
                </div>

                <div className="glass-input-group">
                  <label className="glass-label" style={{ fontSize: "0.8rem", color: "#fff" }}>
                    Camera Vector Facing Direction
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
                    {Object.entries(DIRECTION_CONFIG).map(([dirKey, dirObj]) => (
                      <button
                        key={dirKey}
                        type="button"
                        onClick={() => setNewCameraDir(dirKey)}
                        className="glass-btn"
                        style={{
                          padding: "0.35rem",
                          fontSize: "0.725rem",
                          background: newCameraDir === dirKey ? "rgba(121, 40, 202, 0.45)" : "rgba(255, 255, 255, 0.03)",
                          borderColor: newCameraDir === dirKey ? "#c084fc" : "rgba(255, 255, 255, 0.08)",
                          color: newCameraDir === dirKey ? "#fff" : "var(--text-muted)",
                        }}
                      >
                        {dirObj.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ENTRANCE / EXIT / CHECKOUT TOOL HINTS */}
            {(activeMode === "entrance" || activeMode === "exit" || activeMode === "checkout") && (
              <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6ee7b7", marginBottom: "0.25rem" }}>
                  Placing {activeMode.toUpperCase()} Marker
                </div>
                <p style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
                  Click any cell on the store floor grid to place an {activeMode} point for shoppers.
                </p>
              </div>
            )}

            {/* INSPECTION PANEL */}
            {selectedCell && (
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "0.4rem" }}>
                  Selected Cell ({selectedCell.r}, {selectedCell.c})
                </div>

                {activeSelectedCam && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div style={{ fontSize: "0.825rem", color: "#fff", fontWeight: 700 }}>
                      📷 {activeSelectedCam.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Direction: <strong>{DIRECTION_CONFIG[activeSelectedCam.direction].label}</strong>
                    </div>
                    <button
                      onClick={() => handleRotateSelectedCamera(activeSelectedCam.id)}
                      className="glass-btn glass-btn-secondary"
                      style={{ padding: "0.3rem 0.5rem", fontSize: "0.725rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <RotateCw size={13} />
                      <span>Rotate Direction (↑ → ↓ ←)</span>
                    </button>
                  </div>
                )}

                {activeSelectedShelf && (
                  <div style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 700 }}>
                    🏬 Shelf {activeSelectedShelf.shelf_number} - {activeSelectedShelf.name}
                  </div>
                )}
                {activeSelectedEnt && <div style={{ fontSize: "0.8rem", color: "#6ee7b7", fontWeight: 700 }}>🚪 Entrance Corridor [IN]</div>}
                {activeSelectedExt && <div style={{ fontSize: "0.8rem", color: "#fca5a5", fontWeight: 700 }}>🚪 Exit Corridor [OUT]</div>}
                {activeSelectedChk && <div style={{ fontSize: "0.8rem", color: "#fde047", fontWeight: 700 }}>💳 Checkout Counter [CASH]</div>}
              </div>
            )}
          </div>

          {/* RIGHT 2D GRID FLOOR CANVAS */}
          <div
            className="glass-panel"
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#040711",
              borderColor: "rgba(0, 242, 254, 0.2)",
              padding: "1rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Header / Blueprint Markers */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <div style={{ fontSize: "0.725rem", fontWeight: 700, color: "var(--accent-cyan)", letterSpacing: "0.08em" }}>
                NORTH WALL (ENTRANCE / SPATIAL BOUNDARY)
              </div>
              <div style={{ fontSize: "0.725rem", fontWeight: 700, color: "var(--text-muted)" }}>
                GRID MATRIX: {gridSize} x {gridSize} SPATIAL UNITS
              </div>
            </div>

            {/* INTERACTIVE CANVAS MATRIX */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: "3px",
                flex: 1,
                background: "rgba(255, 255, 255, 0.02)",
                padding: "6px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(0, 242, 254, 0.15)",
                position: "relative",
              }}
            >
              {Array.from({ length: gridSize }).map((_, r) =>
                Array.from({ length: gridSize }).map((_, c) => {
                  const shelfItem = getShelfAt(r, c);
                  const cameraItem = getCameraAt(r, c);
                  const entItem = getEntranceAt(r, c);
                  const extItem = getExitAt(r, c);
                  const chkItem = getCheckoutAt(r, c);

                  const categoryTheme = shelfItem ? (CATEGORY_COLORS[shelfItem.category] || CATEGORY_COLORS.Default) : null;
                  const isSelectedCell = selectedCell && selectedCell.r === r && selectedCell.c === c;

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      style={{
                        position: "relative",
                        borderRadius: "5px",
                        background: isSelectedCell
                          ? "rgba(0, 242, 254, 0.25)"
                          : shelfItem
                          ? categoryTheme.bg
                          : cameraItem
                          ? "rgba(121, 40, 202, 0.25)"
                          : entItem
                          ? "rgba(16, 185, 129, 0.25)"
                          : extItem
                          ? "rgba(239, 68, 68, 0.25)"
                          : chkItem
                          ? "rgba(245, 158, 11, 0.25)"
                          : "rgba(255, 255, 255, 0.02)",
                        border: isSelectedCell
                          ? "2px solid #00f2fe"
                          : shelfItem
                          ? `1px solid ${categoryTheme.border}`
                          : cameraItem
                          ? "1px solid #c084fc"
                          : entItem
                          ? "1px solid #10b981"
                          : extItem
                          ? "1px solid #ef4444"
                          : chkItem
                          ? "1px solid #f59e0b"
                          : "1px dashed rgba(255, 255, 255, 0.06)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                        userSelect: "none",
                      }}
                      title={`Cell (${r}, ${c})`}
                    >
                      {/* Grid Coordinate Label */}
                      <span
                        style={{
                          position: "absolute",
                          top: "1px",
                          left: "3px",
                          fontSize: "0.55rem",
                          color: "rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {r},{c}
                      </span>

                      {/* ENTRANCE / EXIT / CHECKOUT MARKERS */}
                      {entItem && !shelfItem && !cameraItem && (
                        <span style={{ fontSize: "0.65rem", color: "#6ee7b7", fontWeight: 800, textTransform: "uppercase" }}>
                          [IN]
                        </span>
                      )}
                      {extItem && !shelfItem && !cameraItem && (
                        <span style={{ fontSize: "0.65rem", color: "#fca5a5", fontWeight: 800, textTransform: "uppercase" }}>
                          [OUT]
                        </span>
                      )}
                      {chkItem && !shelfItem && !cameraItem && (
                        <span style={{ fontSize: "0.65rem", color: "#fde047", fontWeight: 800, textTransform: "uppercase" }}>
                          [CASH]
                        </span>
                      )}

                      {/* SHELF ITEM RENDERING */}
                      {shelfItem && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "1px",
                            padding: "2px",
                            textAlign: "center",
                          }}
                        >
                          <Layers size={13} color={categoryTheme.text} />
                          <span style={{ fontSize: "0.625rem", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                            S-{shelfItem.shelf_number}
                          </span>
                        </div>
                      )}

                      {/* CAMERA ITEM RENDERING WITH FOV DIRECTION CONE */}
                      {cameraItem && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              background: "linear-gradient(180deg, rgba(0, 242, 254, 0.45) 0%, rgba(121, 40, 202, 0.05) 100%)",
                              pointerEvents: "none",
                              zIndex: 1,
                              ...DIRECTION_CONFIG[cameraItem.direction].coneStyle,
                            }}
                          />

                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #7928ca 0%, #00f2fe 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 0 12px rgba(0, 242, 254, 0.6)",
                              zIndex: 2,
                              color: "#fff",
                            }}
                          >
                            <Camera size={12} />
                          </div>

                          <span
                            style={{
                              fontSize: "0.55rem",
                              fontWeight: 800,
                              color: "#00f2fe",
                              marginTop: "1px",
                              zIndex: 2,
                              background: "rgba(0,0,0,0.6)",
                              padding: "0 3px",
                              borderRadius: "3px",
                            }}
                          >
                            {DIRECTION_CONFIG[cameraItem.direction].arrow}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Blueprint Bottom Label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.6rem" }}>
              <div style={{ fontSize: "0.725rem", fontWeight: 700, color: "var(--text-muted)" }}>
                WEST WALL
              </div>
              <div style={{ fontSize: "0.725rem", fontWeight: 700, color: "var(--accent-amber)", letterSpacing: "0.08em" }}>
                SOUTH WALL (CHECKOUT & EXIT)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreMapDesignerModal;
