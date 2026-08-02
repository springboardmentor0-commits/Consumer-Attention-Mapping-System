import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStores, fetchShelves, createStore, updateStore, deleteStore } from "../api/api";
import { getRolePermissions } from "../utils/rolePermissions";
import StoreMapDesignerModal from "../components/StoreMapDesignerModal";
import {
  ShieldCheck,
  Store,
  Grid,
  Layers,
  UserCheck,
  CheckCircle2,
  Lock,
  Video,
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
} from "../components/Icons";

const Dashboard = () => {
  const navigate = useNavigate();
  const permissionsInfo = getRolePermissions();
  
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for Store CRUD
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  // 2D Map Designer Modal state (Admin feature)
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [designerStore, setDesignerStore] = useState(null);
  const [designerShelves, setDesignerShelves] = useState([]);

  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const userRole = localStorage.getItem("userRole") || "Admin";
  const userEmail = localStorage.getItem("userEmail") || "admin@infosys.com";

  // Permissions matrix display
  const permissions = [
    { key: "create_store", name: "Create & Add New Stores", granted: permissionsInfo.canCreateStore },
    { key: "update_store", name: "Edit Store Location & Config", granted: permissionsInfo.canUpdateStore },
    { key: "design_map", name: "Design 2D Grid Store Map (Admin)", granted: permissionsInfo.canDesignMap },
    { key: "delete_store", name: "Delete Retail Stores", granted: permissionsInfo.canDeleteStore },
    { key: "create_shelf", name: "Configure & Add Shelves", granted: permissionsInfo.canCreateShelf },
    { key: "update_shelf", name: "Edit Shelf Parameters", granted: permissionsInfo.canUpdateShelf },
    { key: "delete_shelf", name: "Delete Shelves & Zones", granted: permissionsInfo.canDeleteShelf },
  ];

  const loadStores = async () => {
    setLoading(true);
    const data = await fetchStores();
    setStores(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStoreName || !newStoreLocation) return;
    
    await createStore({ name: newStoreName, location: newStoreLocation });
    
    // Update local state roster
    setStores((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newStoreName,
        store_name: newStoreName,
        location: newStoreLocation,
        total_shelves: 4,
        active_cctv: 3,
        attention_index: 92.0,
        status: "Active Streaming",
      },
    ]);
    
    setNewStoreName("");
    setNewStoreLocation("");
    setIsAddModalOpen(false);
    setActionMessage("Store created successfully!");
    setTimeout(() => setActionMessage(""), 3000);
  };

  const handleUpdateStoreSubmit = async (e) => {
    e.preventDefault();
    if (!editingStore) return;

    await updateStore(editingStore.id, { name: newStoreName, location: newStoreLocation });

    setStores((prev) =>
      prev.map((s) =>
        s.id === editingStore.id
          ? { ...s, name: newStoreName, store_name: newStoreName, location: newStoreLocation }
          : s
      )
    );

    setEditingStore(null);
    setNewStoreName("");
    setNewStoreLocation("");
    setActionMessage("Store updated successfully!");
    setTimeout(() => setActionMessage(""), 3000);
  };

  const handleDeleteStoreClick = async (e, storeId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    await deleteStore(storeId);
    setStores((prev) => prev.filter((s) => s.id !== storeId));
    setActionMessage("Store deleted successfully!");
    setTimeout(() => setActionMessage(""), 3000);
  };

  const openEditModal = (e, st) => {
    e.stopPropagation();
    setEditingStore(st);
    setNewStoreName(st.name || st.store_name);
    setNewStoreLocation(st.location);
  };

  const openDesignerModal = async (e, st) => {
    if (e) e.stopPropagation();
    setDesignerStore(st);
    const storeShelves = await fetchShelves(st.id);
    setDesignerShelves(storeShelves);
    setIsDesignerOpen(true);
  };

  const filteredStores = (stores || []).filter((st) => {
    if (!st) return false;
    const storeName = st.name || st.store_name || "";
    const storeLocation = st.location || "";
    const q = (searchQuery || "").toLowerCase();
    return storeName.toLowerCase().includes(q) || storeLocation.toLowerCase().includes(q);
  });

  return (
    <div className="main-content">
      {/* Action Notification Toast */}
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

      {/* Add / Edit Store Modal */}
      {(isAddModalOpen || editingStore) && (
        <div className="cctv-modal-overlay" onClick={() => { setIsAddModalOpen(false); setEditingStore(null); }}>
          <div
            className="glass-panel-glow"
            style={{ width: "100%", maxWidth: "450px", padding: "2rem", background: "#0d1124" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>
                {editingStore ? "Edit Store Details" : "Add New Store"}
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingStore(null); }}
                className="glass-btn glass-btn-secondary"
                style={{ padding: "0.35rem" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={editingStore ? handleUpdateStoreSubmit : handleAddStore} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="glass-input-group">
                <label className="glass-label">Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flagship Retail Hub - Store #101"
                  className="glass-input"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Location / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Downtown Commercial Plaza, NY"
                  className="glass-input"
                  value={newStoreLocation}
                  onChange={(e) => setNewStoreLocation(e.target.value)}
                />
              </div>

              {/* Admin 2D Store Layout Designer Launcher inside Edit Modal */}
              {editingStore && permissionsInfo.canDesignMap && (
                <button
                  type="button"
                  onClick={(e) => {
                    const targetStore = editingStore;
                    setEditingStore(null);
                    openDesignerModal(e, targetStore);
                  }}
                  className="glass-btn"
                  style={{
                    background: "linear-gradient(135deg, rgba(121, 40, 202, 0.4) 0%, rgba(0, 242, 254, 0.4) 100%)",
                    color: "#fff",
                    padding: "0.65rem",
                    fontSize: "0.825rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    borderColor: "var(--accent-cyan)",
                    marginTop: "0.25rem",
                  }}
                >
                  <Grid size={16} />
                  <span>Design 2D Grid Store Map (Admin Only)</span>
                </button>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingStore(null); }}
                  className="glass-btn glass-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="glass-btn glass-btn-primary" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>{editingStore ? "Update Store" : "Save Store"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attention Management Dashboard</h1>
          <p className="page-subtitle">
            Role Access Control • Multi-Store Roster & Permission-Based CRUD Actions
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="glass-badge glass-badge-emerald">
            <span className="pulse-dot"></span>
            <span>Role: {userRole}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Wireframe Grid */}
      <div className="wireframe-grid">
        {/* LEFT BOX: Role & Permission */}
        <div className="glass-panel wireframe-box">
          <div className="wireframe-box-header">
            <div className="box-title">
              <ShieldCheck size={22} color="var(--accent-cyan)" />
              <span>Role & Permissions Matrix</span>
            </div>
            <span className="glass-badge glass-badge-purple">{userRole}</span>
          </div>

          {/* Active User Card */}
          <div
            className="glass-card"
            style={{
              background: "linear-gradient(135deg, rgba(121, 40, 202, 0.12) 0%, rgba(0, 242, 254, 0.08) 100%)",
              borderColor: "rgba(121, 40, 202, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #7928ca 0%, #00f2fe 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <UserCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                {userEmail.split("@")[0].toUpperCase()}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", marginTop: "0.15rem" }}>
                {userRole} • Access Privileges Verified
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div>
            <div
              style={{
                fontSize: "0.825rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-muted)",
                marginBottom: "0.85rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Action Clearance Permissions</span>
              <span>Authorization</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {permissions.map((perm) => (
                <div
                  key={perm.key}
                  className="glass-card"
                  style={{
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: perm.granted ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {perm.granted ? (
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    ) : (
                      <Lock size={16} color="var(--text-dim)" />
                    )}
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: perm.granted ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {perm.name}
                    </span>
                  </div>

                  <span
                    className="glass-badge"
                    style={{
                      background: perm.granted ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      color: perm.granted ? "#6ee7b7" : "var(--text-dim)",
                      borderColor: perm.granted ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {perm.granted ? "GRANTED" : "RESTRICTED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT BOX: Store List & Store Actions */}
        <div className="glass-panel wireframe-box">
          <div className="wireframe-box-header">
            <div className="box-title">
              <Store size={22} color="var(--accent-cyan)" />
              <span>Store Roster</span>
            </div>

            {/* Role-based Add New Store Action */}
            {permissionsInfo.canCreateStore ? (
              <button
                onClick={() => {
                  setNewStoreName("");
                  setNewStoreLocation("");
                  setIsAddModalOpen(true);
                }}
                className="glass-btn glass-btn-primary"
                style={{ padding: "0.45rem 0.9rem", fontSize: "0.825rem" }}
              >
                <Plus size={16} />
                <span>Add New Store</span>
              </button>
            ) : (
              <span className="glass-badge glass-badge-amber" style={{ fontSize: "0.75rem" }}>
                Creation Restricted ({userRole})
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search stores by location or name..."
              className="glass-input"
              style={{ paddingLeft: "2.3rem", fontSize: "0.85rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Store Roster with Role Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto", maxHeight: "380px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                Loading stores data...
              </div>
            ) : filteredStores.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                No matching stores found.
              </div>
            ) : (
              filteredStores.map((st) => {
                const sName = st.name || st.store_name || `Store #${st.id}`;
                const sLoc = st.location || "Store Location";
                return (
                  <div
                    key={st.id}
                    className="glass-card"
                    onClick={() => navigate(`/store/${st.id}`)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderLeft: "3px solid var(--accent-cyan)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                        {sName}
                      </div>
                      <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                        {sLoc}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.4rem" }}>
                        <span className="glass-badge glass-badge-cyan" style={{ fontSize: "0.7rem" }}>
                          <Layers size={12} /> {st.total_shelves || 4} Shelves
                        </span>
                        <span className="glass-badge glass-badge-purple" style={{ fontSize: "0.7rem" }}>
                          <Video size={12} /> {st.active_cctv || 3} CCTV Cameras
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                      {/* Action buttons according to roles */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        {permissionsInfo.canUpdateStore && (
                          <button
                            onClick={(e) => openEditModal(e, st)}
                            className="glass-btn glass-btn-secondary"
                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                            title="Edit Store Details"
                          >
                            <Edit3 size={14} color="var(--accent-cyan)" />
                          </button>
                        )}

                        {permissionsInfo.canDesignMap && (
                          <button
                            onClick={(e) => openDesignerModal(e, st)}
                            className="glass-btn"
                            style={{
                              padding: "0.3rem 0.55rem",
                              fontSize: "0.75rem",
                              background: "rgba(0, 242, 254, 0.12)",
                              borderColor: "var(--accent-cyan)",
                              color: "var(--accent-cyan)",
                            }}
                            title="Design Store 2D Grid Map (Admin Only)"
                          >
                            <Grid size={14} />
                          </button>
                        )}

                        {permissionsInfo.canDeleteStore && (
                          <button
                            onClick={(e) => handleDeleteStoreClick(e, st.id)}
                            className="glass-btn glass-btn-danger"
                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem" }}
                            title="Delete Store"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        <button
                          className="glass-btn glass-btn-primary"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        >
                          View Store
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2D Store Grid Map Designer Modal (Admin Feature) */}
      <StoreMapDesignerModal
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        store={designerStore}
        shelves={designerShelves}
        onSaveSuccess={() => {
          setActionMessage("Store 2D map layout updated successfully!");
          setTimeout(() => setActionMessage(""), 3000);
        }}
      />
    </div>
  );
};

export default Dashboard;
