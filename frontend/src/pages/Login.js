import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/api";
import { Eye, ShieldCheck, Lock, Mail, User, ArrowRight, CheckCircle2 } from "../components/Icons";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("admin@infosys.com");
  const [password, setPassword] = useState("admin123");
  const [fullName, setFullName] = useState("Retail Ops Lead");
  const [role, setRole] = useState("Admin");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const res = await loginUser(email, password);
      if (res && res.access_token) {
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);
        navigate("/dashboard");
      } else {
        setMessage("Authentication Failed. Please check your credentials.");
      }
    } else {
      const res = await registerUser({ email, password, full_name: fullName, role_id: 1 });
      if (res) {
        setMessage("Registration successful! Logging you in...");
        setTimeout(() => {
          localStorage.setItem("token", "mock_jwt_registered_token");
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userRole", role);
          navigate("/dashboard");
        }, 1000);
      }
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      <div
        className="glass-panel-glow"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "2.5rem",
          backdropFilter: "blur(28px)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 1rem auto",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #00f2fe 0%, #7928ca 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 0 30px rgba(0, 242, 254, 0.4)",
            }}
          >
            <Eye size={30} />
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "#fff" }}>
            Consumer Attention System
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
            AI-Powered Spatial Attention & Shopper Analytics Platform
          </p>
        </div>

        {/* Auth Toggle Tabs (Login vs Signup) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "rgba(255, 255, 255, 0.04)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "1.75rem",
          }}
        >
          <button
            onClick={() => setIsLogin(true)}
            className="glass-btn"
            style={{
              background: isLogin ? "rgba(0, 242, 254, 0.15)" : "transparent",
              color: isLogin ? "#fff" : "var(--text-muted)",
              borderColor: isLogin ? "var(--accent-cyan)" : "transparent",
              padding: "0.5rem",
              fontSize: "0.85rem",
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className="glass-btn"
            style={{
              background: !isLogin ? "rgba(0, 242, 254, 0.15)" : "transparent",
              color: !isLogin ? "#fff" : "var(--text-muted)",
              borderColor: !isLogin ? "var(--accent-cyan)" : "transparent",
              padding: "0.5rem",
              fontSize: "0.85rem",
            }}
          >
            Signup
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(0, 242, 254, 0.1)",
              border: "1px solid var(--accent-cyan)",
              fontSize: "0.825rem",
              color: "#fff",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle2 size={16} color="var(--accent-cyan)" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {!isLogin && (
            <div className="glass-input-group">
              <label className="glass-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="glass-input"
                  style={{ paddingLeft: "2.3rem" }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="glass-input-group">
            <label className="glass-label">Work Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="glass-input"
                style={{ paddingLeft: "2.3rem" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-input-group">
            <label className="glass-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="glass-input"
                style={{ paddingLeft: "2.3rem" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-input-group">
            <label className="glass-label">Assigned Role</label>
            <div style={{ position: "relative" }}>
              <ShieldCheck size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
              <select
                className="glass-select"
                style={{ paddingLeft: "2.3rem" }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Admin">Admin (Full System Access)</option>
                <option value="Store Manager">Store Manager (Store Ops & CCTV)</option>
                <option value="Retail Analyst">Retail Analyst (Attention Metrics & Heatmaps)</option>
                <option value="Marketing Manager">Marketing Manager (Scoring & Recommendations)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-btn glass-btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem", fontSize: "0.95rem" }}
          >
            <span>{loading ? "Authenticating..." : isLogin ? "Login to Dashboard" : "Create Account"}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.775rem", color: "var(--text-dim)" }}>
          Protected by Enterprise Glassmorphism Security & YOLO Edge Engine
        </div>
      </div>
    </div>
  );
};

export default Login;
