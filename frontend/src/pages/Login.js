import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const loginUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (error) {
      setError("Login failed. Please check your email and password.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-split">
      <section className="hero-panel">
        <p className="eyebrow">Consumer Attention Mapping System</p>
        <h1>Track attention, stores, and shelves.</h1>
      </section>

      <section className="card auth-card">
        <h2>Login</h2>
        <p className="muted">Enter your account details to continue.</p>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="primary-btn" onClick={loginUser} disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="small-link">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
