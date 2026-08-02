import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  LayoutDashboard,
  Store,
  Grid,
  Video,
  LogOut,
  ShieldCheck,
} from "./Icons";

const Navbar = ({ onOpenCctv }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "admin@infosys.com";
  const userRole = localStorage.getItem("userRole") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // Hide Navbar on Login / Signup screen
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="navbar-container">
      <Link to="/dashboard" className="navbar-brand">
        <div className="brand-icon">
          <Eye size={22} />
        </div>
        <div>
          <div className="brand-title">Consumer Attention System</div>
          <div style={{ fontSize: "0.68rem", color: "var(--accent-cyan)", fontWeight: 600, letterSpacing: "0.08em" }}>
            AI ATTENTION MAPPING & YOLO INTELLIGENCE
          </div>
        </div>
      </Link>

      <div className="navbar-nav">
        <Link
          to="/dashboard"
          className={`nav-link-btn ${location.pathname === "/dashboard" ? "active" : ""}`}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/store/1"
          className={`nav-link-btn ${location.pathname.startsWith("/store") ? "active" : ""}`}
        >
          <Store size={16} />
          <span>Store View</span>
        </Link>

        <Link
          to="/shelf/101"
          className={`nav-link-btn ${location.pathname.startsWith("/shelf") ? "active" : ""}`}
        >
          <Grid size={16} />
          <span>Shelf Details</span>
        </Link>

        {onOpenCctv && (
          <button
            onClick={onOpenCctv}
            className="glass-btn glass-btn-secondary"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.825rem", color: "var(--accent-cyan)" }}
          >
            <Video size={16} />
            <span>Live CCTV</span>
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div className="glass-badge glass-badge-purple" style={{ padding: "0.35rem 0.75rem" }}>
          <ShieldCheck size={14} />
          <span>{userRole}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>{userEmail.split("@")[0]}</span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Verified Access</span>
        </div>

        <button onClick={handleLogout} className="glass-btn glass-btn-danger" style={{ padding: "0.45rem 0.75rem" }}>
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
