import api from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleLogin = async () => {

    try {

        const response = await api.post("/login", {
            email: email,
            password: password
        });

        localStorage.setItem(
    "access_token",
    response.data.access_token
    );

    console.log("Token Saved!");
    navigate("/dashboard");

    } catch (error) {

        console.log(error);

    }

   };
    return (
        <div className="login-container">

            <div className="login-card">

                <h1>Consumer Attention Mapping System</h1>

                <p>Sign in to continue</p>

                <label>Email</label>

                <input
                     type="email"
                     placeholder="Enter your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                />

                <label>Password</label>

                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleLogin}>
                    Login
                </button>

                <div className="register-link">
                    Don't have an account? Register
                </div>

            </div>

        </div>
    );
}

export default Login;