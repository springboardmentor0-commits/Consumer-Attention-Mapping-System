import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(1);

  const registerUser = async () => {
    try {
      const response = await api.post("/register", {
        email: email,
        password: password,
        role_id: Number(roleId),
      });

      alert(response.data.message);
    } catch (error) {
      alert("Registration Failed");
      console.log(error);
    }
  };

  return (
    <div className="page page-center">
      <section className="card auth-card">
        <h2>Register</h2>
        <p className="muted">Create an account to start using the dashboard.</p>

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Role</span>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="1">Admin</option>
            <option value="2">Store Manager</option>
            <option value="3">Retail Analyst</option>
            <option value="4">Marketing Manager</option>
          </select>
        </label>

        <button className="primary-btn" onClick={registerUser}>
          Register
        </button>

        <p className="small-link">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
