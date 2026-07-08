import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/");
        }

    }, [navigate]);

    const handleLogout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        navigate("/");

    };

    return (

        <div className="dashboard">

            <div className="dashboard-header">

                <h1>Consumer Attention Mapping System</h1>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

            <div className="welcome-card">

                <h2>Welcome, {user?.email} 👋</h2>

                <p><strong>Role:</strong> {role}</p>

                <br />

                <p>
                    Manage your retail stores and shelf layouts from one place.
                </p>

            </div>

            <div className="cards">

                <div
                    className="card"
                    onClick={() => navigate("/stores")}
                >

                    <h2>🏪 Stores</h2>

                    <p>
                        {(role === "Admin" || role === "Store Manager")
                            ? "Add and manage store locations."
                            : "View store locations."}
                    </p>

                </div>

                <div
                    className="card"
                    onClick={() => navigate("/shelves")}
                >

                    <h2>📦 Shelves</h2>

                    <p>
                        {(role === "Admin" || role === "Store Manager")
                            ? "Manage shelf zones for stores."
                            : "View shelf information."}
                    </p>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;