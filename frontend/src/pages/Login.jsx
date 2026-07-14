import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Login.css";

function Login() {
    const navigate = useNavigate();

    // ==========================================================
    // Component State
    // ==========================================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================================
    // Login Handler
    // ==========================================================

    const handleLogin = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            navigate("/dashboard");
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // UI
    // ==========================================================

    return (
        <div className="login-page">

            <div className="login-card">

                <h1 className="login-project-title">
                    Consumer Attention Mapping System
                </h1>

                <p className="login-project-description">
                    A smart retail management platform for monitoring stores,
                    shelves and consumer attention analytics.
                </p>

                <hr className="login-divider" />

                <h2 className="login-title">
                    Welcome Back
                </h2>

                <p className="login-subtitle">
                    Sign in to continue
                </p>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >

                    <div className="login-input-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>

                    <div className="login-input-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In"}
                    </button>

                </form>

                <div className="login-footer">

                    <p>
                        Don't have an account?
                    </p>

                    <Link
                        to="/register"
                        className="login-link"
                    >
                        Create Account
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Login;