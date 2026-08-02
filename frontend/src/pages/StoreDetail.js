import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchShelves, fetchStores, createShelf, updateShelf, deleteShelf, getStoreLayout, MOCK_STORES } from "../api/api";
import { getRolePermissions } from "../utils/rolePermissions";
import CctvModal from "../components/CctvModal";
import StoreMapDesignerModal from "../components/StoreMapDesignerModal";
import {
  Video,
  Grid,
  MapPin,
  ChevronRight,
  Eye,
  Flame,
  ArrowLeft,
  Activity,
  UserCheck,
  Sparkles,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Camera,
} from "../components/Icons";

const DIRECTION_CONES = {
  N: { arrow: "↑", style: { top: "-28px", left: "-10px", width: "36px", height: "28px", clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)" } },
  E: { arrow: "→", style: { top: "-10px", left: "16px", width: "28px", height: "36px", clipPath: "polygon(0% 50%, 100% 0%, 100% 100%)" } },
  S: { arrow: "↓", style: { top: "16px", left: "-10px", width: "36px", height: "28px", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" } },
  W: { arrow: "←", style: { top: "-10px", left: "-28px", width: "28px", height: "36px", clipPath: "polygon(100% 50%, 0% 0%, 0% 100%)" } },
};

const StoreDetail = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const currentStoreId = Number(storeId) || 1;
  const permissionsInfo = getRolePermissions();

  const [stores, setStores] = useState(MOCK_STORES);
  const [store, setStore] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [isCctvOpen, setIsCctvOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // 2D Store Map Layout State (Admin Feature)
  const [layoutData, setLayoutData] = useState(null);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  
  // Active feature tab state inside Store view
  const [activeTab, setActiveTab] = useState("overview");

  // Shelf CRUD Modal States
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);

  const [shelfName, setShelfName] = useState("");
  const [shelfCategory, setShelfCategory] = useState("Electronics");
  const [positionX, setPositionX] = useState(30);
  const [positionY, setPositionY] = useState(40);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const allStores = await fetchStores();
      setStores(allStores);
      const currentStore = allStores.find((s) => s.id === currentStoreId) || allStores[0];
      setStore(currentStore);

      // Fetch ONLY shelves belonging to THIS specific store
      const shelfList = await fetchShelves(currentStoreId);
      setShelves(shelfList);
      if (shelfList.length > 0) {
        setSelectedShelf(shelfList[0]);
      }

      // Load 2D Store Layout Grid Map (Admin layout data with cameras & directions)
      const layout = getStoreLayout(currentStoreId);
      setLayoutData(layout);
    };

    loadData();
  }, [currentStoreId]);

  // Shelf Actions
  const handleAddShelfSubmit = async (e) => {
    e.preventDefault();
    if (!shelfName) return;

    await createShelf({
      name: shelfName,
      zone_name: shelfName,
      category: shelfCategory,
      store_id: currentStoreId,
    });

    const newShelfItem = {
      id: Date.now(),
      shelf_number: String(shelves.length + 1).padStart(2, "0"),
      name: shelfName,
      zone_name: shelfName,
      category: shelfCategory,
      store_id: currentStoreId,
      position_x: Number(positionX),
      position_y: Number(positionY),
      dwell_time_avg: 40.0,
      gaze_count: 1000,
      attractiveness_score: 90.0,
      engagement_rate: 75.0,
      status: "Optimal",
    };

    setShelves((prev) => [...prev, newShelfItem]);
    setShelfName("");
    setIsAddShelfModalOpen(false);
    setActionMessage("Shelf added successfully!");
    setTimeout(() => setActionMessage(""), 3000);
  };

  const handleUpdateShelfSubmit = async (e) => {
    e.preventDefault();
    if (!editingShelf) return;

    await updateShelf(editingShelf.id, {
      name: shelfName,
      category: shelfCategory,
      position_x: Number(positionX),
      position_y: Number(positionY),
    });

    setShelves((prev) =>
      prev.map((sh) =>
        sh.id === editingShelf.id
          ? {
              ...sh,
              name: shelfName,
              category: shelfCategory,
              position_x: Number(positionX),
              position_y: Number(positionY),
            }
          : sh
      )
    );

    setEditingShelf(null);
    setShelfName("");
    setActionMessage("Shelf updated successfully!");
    setTimeout(() => setActionMessage(""), 3000);
  };

  const handleDeleteShelfClick = async (e, shelfId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this shelf?")) return;

    await deleteShelf(shelfId);
    setShelves((prev) => prev.filter((sh) => sh.id !== shelfId));
    setActionMessage("Shelf deleted successfully!");
    setTimeout(() => setActionMessage(""), 3000);
  };

  const openEditShelfModal = (e, sh) => {
    e.stopPropagation();
    setEditingShelf(sh);
    setShelfName(sh.name);
    setShelfCategory(sh.category);
    setPositionX(sh.position_x);
    setPositionY(sh.position_y);
  };

  return (
    <div className="main-content">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "rgba(0, 242, 254, 0.15)",
            border: "1px solid var(--accent-cyan)",
            color: "#fff",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-md)",
            backdropFilter: "blur(16px)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={18} color="var(--accent-cyan)" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Add / Edit Shelf Modal */}
      {(isAddShelfModalOpen || editingShelf) && (
        <div className="cctv-modal-overlay" onClick={() => { setIsAddShelfModalOpen(false); setEditingShelf(null); }}>
          <div
            className="glass-panel-glow"
            style={{ width: "100%", maxWidth: "450px", padding: "2rem", background: "#0d1124" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>
                {editingShelf ? "Edit Shelf Config" : `Add Shelf to Store #${currentStoreId}`}
              </h3>
              <button
                onClick={() => { setIsAddShelfModalOpen(false); setEditingShelf(null); }}
                className="glass-btn glass-btn-secondary"
                style={{ padding: "0.35rem" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingShelf ? handleUpdateShelfSubmit : handleAddShelfSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="glass-input-group">
                <label className="glass-label">Shelf Name / Zone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Eyewear & Sunglasses"
                  className="glass-input"
                  value={shelfName}
                  onChange={(e) => setShelfName(e.target.value)}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Product Category</label>
                <select
                  className="glass-select"
                  value={shelfCategory}
                  onChange={(e) => setShelfCategory(e.target.value)}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Jewelry">Jewelry & Watches</option>
                  <option value="Optics">Optics & Eyewear</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="glass-input-group">
                  <label className="glass-label">Map Position X (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    className="glass-input"
                    value={positionX}
                    onChange={(e) => setPositionX(e.target.value)}
                  />
                </div>
                <div className="glass-input-group">
                  <label className="glass-label">Map Position Y (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    className="glass-input"
                    value={positionY}
                    onChange={(e) => setPositionY(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setIsAddShelfModalOpen(false); setEditingShelf(null); }}
                  className="glass-btn glass-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="glass-btn glass-btn-primary" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>{editingShelf ? "Update Shelf" : "Save Shelf"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CCTV Camera Stream Overlay Modal */}
      <CctvModal isOpen={isCctvOpen} onClose={() => setIsCctvOpen(false)} initialStoreId={currentStoreId} />

      {/* Store Header & Store Selector Dropdown */}
      <div className="page-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/dashboard")}
            className="glass-btn glass-btn-secondary"
            style={{ padding: "0.5rem" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 className="page-title">
                {store ? store.name : `Store #${currentStoreId}`}
              </h1>
              
              {/* Quick Store Switcher */}
              <select
                value={currentStoreId}
                onChange={(e) => navigate(`/store/${e.target.value}`)}
                className="glass-select"
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  width: "auto",
                  background: "rgba(0, 242, 254, 0.1)",
                  borderColor: "var(--accent-cyan)",
                  color: "#fff",
                }}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    Switch to {s.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={14} color="var(--accent-cyan)" />
              {store ? store.location : "Commercial Hub"} • Showing {shelves.length} Store-Specific Shelves
            </p>
          </div>
        </div>

        {/* Action Controls Top Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {permissionsInfo.canDesignMap && (
            <button
              onClick={() => setIsDesignerOpen(true)}
              className="glass-btn"
              style={{
                background: "linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(121, 40, 202, 0.25) 100%)",
                borderColor: "var(--accent-cyan)",
                color: "#fff",
                padding: "0.55rem 0.95rem",
                fontSize: "0.825rem",
                fontWeight: 700,
                boxShadow: "0 0 15px rgba(0, 242, 254, 0.25)",
              }}
              title="Design 2D Grid Store Map (Admin Only)"
            >
              <Grid size={16} color="var(--accent-cyan)" />
              <span>Admin 2D Map Designer</span>
            </button>
          )}

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`glass-btn ${showHeatmap ? "glass-btn-primary" : "glass-btn-secondary"}`}
            style={{ padding: "0.55rem 0.9rem", fontSize: "0.825rem" }}
          >
            <Flame size={16} />
            <span>{showHeatmap ? "Heatmap ON" : "Heatmap OFF"}</span>
          </button>

          <button
            onClick={() => setIsCctvOpen(true)}
            className="glass-btn"
            style={{
              background: "linear-gradient(135deg, rgba(121, 40, 202, 0.8) 0%, rgba(0, 242, 254, 0.8) 100%)",
              color: "#fff",
              padding: "0.55rem 1rem",
              fontSize: "0.825rem",
              boxShadow: "0 0 25px rgba(0, 242, 254, 0.35)",
            }}
          >
            <Video size={16} />
            <span>Live CCTV & YOLO</span>
          </button>
        </div>
      </div>

      {/* Feature Module Sub-Navigation Bar */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          overflowX: "auto",
          padding: "4px",
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "var(--radius-md)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: "1.75rem",
        }}
      >
        {[
          { id: "overview", label: "Shelves & Visual Map", icon: Grid },
          { id: "attention", label: "Attention Analytics", icon: Eye },
          { id: "behavior", label: "Consumer Behavior", icon: UserCheck },
          { id: "heatmap", label: "Heatmaps & Hotspots", icon: Flame },
          { id: "interactions", label: "Product Interactions", icon: Activity },
          { id: "scoring", label: "Attractiveness Scoring", icon: Sparkles },
          { id: "recommendations", label: "AI Recommendations", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="glass-btn"
              style={{
                background: isActive ? "rgba(0, 242, 254, 0.15)" : "transparent",
                color: isActive ? "#fff" : "var(--text-muted)",
                borderColor: isActive ? "var(--accent-cyan)" : "transparent",
                padding: "0.5rem 0.85rem",
                fontSize: "0.825rem",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={15} color={isActive ? "var(--accent-cyan)" : "currentColor"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW - Wireframe Visual Floor Map + Store-Specific Shelves List & CRUD Actions */}
      {activeTab === "overview" && (
        <div className="wireframe-grid">
          {/* LEFT BOX: Store Inside visual map with shelves position */}
          <div className="glass-panel wireframe-box">
            <div className="wireframe-box-header">
              <div className="box-title">
                <Eye size={22} color="var(--accent-cyan)" />
                <span>Store #{currentStoreId} Visual Map with Shelves Position</span>
              </div>
              <span className="glass-badge glass-badge-emerald">Live Spatial Sync</span>
            </div>

            {/* Interactive Floor Blueprint Visualizer */}
            <div className="floor-map-container">
              <div className="floor-grid-overlay" />

              {/* Simulated Shopper Traffic Heatmap Blob Overlays */}
              {showHeatmap && (
                <>
                  <div
                    className="heatmap-blob"
                    style={{
                      top: "20%",
                      left: "20%",
                      width: "140px",
                      height: "140px",
                      background: "radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(245, 158, 11, 0.3) 50%, rgba(0,0,0,0) 70%)",
                    }}
                  />
                  <div
                    className="heatmap-blob"
                    style={{
                      top: "60%",
                      left: "60%",
                      width: "160px",
                      height: "160px",
                      background: "radial-gradient(circle, rgba(0, 242, 254, 0.6) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(0,0,0,0) 70%)",
                    }}
                  />
                </>
              )}

              {/* Blueprint Structural Labels */}
              <div style={{ position: "absolute", top: "12px", left: "16px", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>
                ENTRANCE CORRIDOR
              </div>
              <div style={{ position: "absolute", bottom: "12px", right: "16px", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>
                CHECKOUT COUNTER
              </div>

              {/* Custom Entrances, Exits, & Checkout Counters Placed by Admin */}
              {(layoutData?.entrances || []).map((ent) => {
                const gSize = layoutData?.grid_size || 10;
                const posX = (ent.grid_x / Math.max(1, gSize - 1)) * 82 + 5;
                const posY = (ent.grid_y / Math.max(1, gSize - 1)) * 82 + 5;
                return (
                  <div
                    key={ent.id}
                    style={{
                      position: "absolute",
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: "translate(-50%, -50%)",
                      background: "rgba(16, 185, 129, 0.25)",
                      border: "1px solid #10b981",
                      color: "#6ee7b7",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      zIndex: 8,
                    }}
                  >
                    🚪 ENTRANCE [IN]
                  </div>
                );
              })}

              {(layoutData?.exits || []).map((ext) => {
                const gSize = layoutData?.grid_size || 10;
                const posX = (ext.grid_x / Math.max(1, gSize - 1)) * 82 + 5;
                const posY = (ext.grid_y / Math.max(1, gSize - 1)) * 82 + 5;
                return (
                  <div
                    key={ext.id}
                    style={{
                      position: "absolute",
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: "translate(-50%, -50%)",
                      background: "rgba(239, 68, 68, 0.25)",
                      border: "1px solid #ef4444",
                      color: "#fca5a5",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      zIndex: 8,
                    }}
                  >
                    🚪 EXIT [OUT]
                  </div>
                );
              })}

              {(layoutData?.checkouts || []).map((chk) => {
                const gSize = layoutData?.grid_size || 10;
                const posX = (chk.grid_x / Math.max(1, gSize - 1)) * 82 + 5;
                const posY = (chk.grid_y / Math.max(1, gSize - 1)) * 82 + 5;
                return (
                  <div
                    key={chk.id}
                    style={{
                      position: "absolute",
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: "translate(-50%, -50%)",
                      background: "rgba(245, 158, 11, 0.25)",
                      border: "1px solid #f59e0b",
                      color: "#fde047",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      zIndex: 8,
                    }}
                  >
                    💳 CHECKOUT [CASH]
                  </div>
                );
              })}

              {/* Render Placed CCTV Cameras & Direction Vectors from 2D Layout Map */}
              {(layoutData?.cameras || []).map((cam) => {
                const posX = Math.min(88, Math.max(5, (cam.grid_x / 9) * 82 + 5));
                const posY = Math.min(88, Math.max(5, (cam.grid_y / 9) * 82 + 5));
                const dirConfig = DIRECTION_CONES[cam.direction] || DIRECTION_CONES.E;

                return (
                  <div
                    key={cam.id}
                    style={{
                      position: "absolute",
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      zIndex: 10,
                    }}
                    title={`${cam.name} (Facing ${cam.direction})`}
                  >
                    {/* Glowing FOV Direction Cone Projection */}
                    <div
                      style={{
                        position: "absolute",
                        background: "linear-gradient(180deg, rgba(0, 242, 254, 0.45) 0%, rgba(121, 40, 202, 0.05) 100%)",
                        pointerEvents: "none",
                        zIndex: 1,
                        ...dirConfig.style,
                      }}
                    />

                    {/* Camera Badge Icon */}
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7928ca 0%, #00f2fe 100%)",
                        border: "1px solid #00f2fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        boxShadow: "0 0 14px rgba(0, 242, 254, 0.6)",
                        zIndex: 2,
                      }}
                    >
                      <Camera size={14} />
                    </div>

                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 800,
                        color: "#00f2fe",
                        background: "rgba(8, 12, 25, 0.85)",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        border: "1px solid rgba(0, 242, 254, 0.3)",
                        whiteSpace: "nowrap",
                        marginTop: "2px",
                        zIndex: 2,
                      }}
                    >
                      {dirConfig.arrow} {cam.name.split("-")[0]}
                    </span>
                  </div>
                );
              })}

              {/* Interactive Shelves Positioned on Visual Map for THIS STORE ONLY */}
              {shelves.map((sh) => {
                // Check if Admin designed custom grid position for this shelf
                const customPos = (layoutData?.shelves_grid || []).find((sg) => sg.id === sh.id);
                const posX = customPos !== undefined ? Math.min(85, Math.max(10, (customPos.grid_x / 9) * 75 + 10)) : sh.position_x;
                const posY = customPos !== undefined ? Math.min(85, Math.max(10, (customPos.grid_y / 9) * 75 + 10)) : sh.position_y;

                return (
                  <div
                    key={sh.id}
                    onClick={() => {
                      setSelectedShelf(sh);
                      navigate(`/shelf/${sh.id}`);
                    }}
                    className={`shelf-marker ${selectedShelf?.id === sh.id ? "selected" : ""}`}
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Grid size={12} color="var(--accent-cyan)" />
                      <span>Shelf {sh.shelf_number}</span>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {sh.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Shelf Quick Info */}
            {selectedShelf && (
              <div className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>Selected Shelf Marker</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                    Shelf {selectedShelf.shelf_number} - {selectedShelf.name}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/shelf/${selectedShelf.id}`)}
                  className="glass-btn glass-btn-primary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Inspect Parameters
                </button>
              </div>
            )}
          </div>

          {/* RIGHT BOX: Shelf details list & Role-based Shelf CRUD Actions */}
          <div className="glass-panel wireframe-box">
            <div className="wireframe-box-header">
              <div className="box-title">
                <Grid size={22} color="var(--accent-cyan)" />
                <span>Shelf Details (Store #{currentStoreId})</span>
              </div>

              {/* Add New Shelf Action */}
              {permissionsInfo.canCreateShelf ? (
                <button
                  onClick={() => {
                    setShelfName("");
                    setIsAddShelfModalOpen(true);
                  }}
                  className="glass-btn glass-btn-primary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.775rem" }}
                >
                  <Plus size={14} />
                  <span>Add Shelf</span>
                </button>
              ) : (
                <span className="glass-badge glass-badge-amber" style={{ fontSize: "0.7rem" }}>
                  Read Only
                </span>
              )}
            </div>

            {/* Shelf Details List with Edit / Delete Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto", maxHeight: "420px" }}>
              {shelves.map((sh) => (
                <div
                  key={sh.id}
                  onClick={() => navigate(`/shelf/${sh.id}`)}
                  className="glass-card"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: selectedShelf?.id === sh.id ? "rgba(0, 242, 254, 0.08)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: selectedShelf?.id === sh.id ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "rgba(0, 242, 254, 0.12)",
                        border: "1px solid rgba(0, 242, 254, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-cyan)",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                      }}
                    >
                      {sh.shelf_number}
                    </div>

                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                        {sh.shelf_number} - {sh.name}
                      </div>
                      <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                        Category: {sh.category} • Avg Dwell: {sh.dwell_time_avg}s
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {/* Role-based Edit Shelf Action */}
                    {permissionsInfo.canUpdateShelf && (
                      <button
                        onClick={(e) => openEditShelfModal(e, sh)}
                        className="glass-btn glass-btn-secondary"
                        style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                        title="Edit Shelf Parameters"
                      >
                        <Edit3 size={14} color="var(--accent-cyan)" />
                      </button>
                    )}

                    {/* Role-based Delete Shelf Action */}
                    {permissionsInfo.canDeleteShelf && (
                      <button
                        onClick={(e) => handleDeleteShelfClick(e, sh.id)}
                        className="glass-btn glass-btn-danger"
                        style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                        title="Delete Shelf"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENTION ANALYTICS */}
      {activeTab === "attention" && (
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            Attention Analytics • {store?.name}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Gaze Fixation Engine, Head Pose Distribution & Spatial Attention Vectors
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
            <div className="glass-card">
              <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Total Fixation Events</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "0.3rem" }}>1,482 events</div>
            </div>
            <div className="glass-card">
              <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Mean Gaze Duration</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-purple)", marginTop: "0.3rem" }}>4.8 seconds</div>
            </div>
            <div className="glass-card">
              <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Head Yaw Alignment</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "0.3rem" }}>3.2° Pitch</div>
            </div>
            <div className="glass-card">
              <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Fixation-to-Dwell Ratio</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-pink)", marginTop: "0.3rem" }}>84.6%</div>
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "1.25rem", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: "0.85rem" }}>Active Shelf Attention Breakdown ({store?.name})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {shelves.map((sh) => (
                <div key={sh.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 1rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                  <div>
                    <strong style={{ color: "#fff" }}>Shelf {sh.shelf_number} - {sh.name}</strong>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Category: {sh.category}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span className="glass-badge glass-badge-cyan">{sh.gaze_count} Gazes</span>
                    <span className="glass-badge glass-badge-emerald">{sh.dwell_time_avg}s Dwell</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONSUMER BEHAVIOR INTELLIGENCE */}
      {activeTab === "behavior" && (
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            Consumer Behavior Intelligence • {store?.name}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Shopper Segmentation, Velocity Patterns & Journey Path Profiling
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
            {[
              { segment: "Explorers", pct: "34%", count: "412 shoppers", color: "cyan" },
              { segment: "Quick Buyers", pct: "28%", count: "338 shoppers", color: "emerald" },
              { segment: "Comparison Shoppers", pct: "22%", count: "264 shoppers", color: "purple" },
              { segment: "Impulse Buyers", pct: "16%", count: "192 shoppers", color: "pink" },
            ].map((s, idx) => (
              <div key={idx} className="glass-card" style={{ textAlign: "center" }}>
                <span className={`glass-badge glass-badge-${s.color}`}>{s.segment}</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: "0.5rem 0 0.2rem 0" }}>{s.pct}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ATTENTION HEATMAPS */}
      {activeTab === "heatmap" && (
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            Attention Heatmap & Hotspot Matrix • {store?.name}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            2D Spatial Heatmap Intensity Grid for Store #{currentStoreId}
          </p>

          <div className="floor-map-container" style={{ height: "400px" }}>
            <div className="floor-grid-overlay" />
            <div className="heatmap-blob" style={{ top: "15%", left: "25%", width: "220px", height: "220px", background: "radial-gradient(circle, rgba(244, 63, 94, 0.7) 0%, rgba(245, 158, 11, 0.4) 50%, rgba(0,0,0,0) 75%)" }} />
            <div className="heatmap-blob" style={{ top: "50%", left: "60%", width: "240px", height: "240px", background: "radial-gradient(circle, rgba(0, 242, 254, 0.7) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(0,0,0,0) 75%)" }} />

            <div style={{ position: "absolute", bottom: "1rem", left: "1rem", background: "rgba(0,0,0,0.6)", padding: "0.6rem 1rem", borderRadius: "8px", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", marginBottom: "0.2rem" }}>Spatial Intensity Legend</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                <span style={{ color: "#f43f5e" }}>■ Hot (High Dwell)</span>
                <span style={{ color: "#f59e0b" }}>■ Warm (Browsing)</span>
                <span style={{ color: "#00f2fe" }}>■ Cool (Pass-by)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCT INTERACTIONS */}
      {activeTab === "interactions" && (
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            Product Interaction Analysis • {store?.name}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Product Views, Pickups, Returns, Purchases, Compare Rates
          </p>

          <table className="glass-table">
            <thead>
              <tr>
                <th>Shelf</th>
                <th>Category</th>
                <th>Product Views</th>
                <th>Pickups</th>
                <th>Returns</th>
                <th>Purchases</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {shelves.map((sh) => (
                <tr key={sh.id}>
                  <td style={{ fontWeight: 700, color: "#fff" }}>Shelf {sh.shelf_number} - {sh.name}</td>
                  <td>{sh.category}</td>
                  <td>{sh.gaze_count}</td>
                  <td style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{Math.round(sh.gaze_count * 0.42)}</td>
                  <td style={{ color: "var(--accent-amber)" }}>{Math.round(sh.gaze_count * 0.12)}</td>
                  <td style={{ color: "var(--accent-emerald)", fontWeight: 800 }}>{Math.round(sh.gaze_count * 0.30)}</td>
                  <td><span className="glass-badge glass-badge-emerald">{sh.engagement_rate}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: ATTRACTIVENESS SCORING */}
      {activeTab === "scoring" && (
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            Product Attractiveness Scoring • {store?.name}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Attractiveness Tiers, Visibility & Conversion Scores for Store #{currentStoreId} Shelves
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {shelves.map((sh) => (
              <div key={sh.id} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="glass-badge glass-badge-purple">Tier Grade A+</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent-pink)" }}>{sh.attractiveness_score}</span>
                </div>
                <div style={{ fontWeight: 700, color: "#fff" }}>Shelf {sh.shelf_number} - {sh.name}</div>
                <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Category: {sh.category}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Visibility Score:</span><strong style={{ color: "#fff" }}>94.2/100</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Engagement Score:</span><strong style={{ color: "#fff" }}>{sh.engagement_rate}/100</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Conversion Potential:</span><strong style={{ color: "var(--accent-emerald)" }}>89.5/100</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AI RECOMMENDATIONS */}
      {activeTab === "recommendations" && (
        <div className="glass-panel" style={{ padding: "1.75rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            AI Optimization Recommendations • {store?.name}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            AI Placement Action Steps & Layout Revenue Lift Suggestions
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {shelves.map((sh, idx) => (
              <div key={sh.id} className="glass-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <span className="glass-badge glass-badge-amber">Priority HIGH</span>
                    <strong style={{ color: "#fff" }}>Optimize Placement for Shelf {sh.shelf_number} ({sh.name})</strong>
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
                    Re-align top SKUs to eye-level (1.4m height) to boost dwell fixation by +22% and drive +15% conversion lift.
                  </p>
                </div>

                <div style={{ textAlign: "right", minWidth: "140px" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent-emerald)" }}>+${18400 + idx * 4200}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Expected Revenue Lift</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2D Store Grid Map Designer Modal (Admin Feature) */}
      <StoreMapDesignerModal
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        store={store}
        shelves={shelves}
        onSaveSuccess={(newLayout, newShelvesGrid) => {
          setLayoutData(newLayout);
          setActionMessage("2D Store Map Layout Updated Successfully!");
          setTimeout(() => setActionMessage(""), 3000);
        }}
      />
    </div>
  );
};

export default StoreDetail;
