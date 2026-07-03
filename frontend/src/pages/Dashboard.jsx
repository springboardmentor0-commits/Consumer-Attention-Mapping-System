import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {

    const navigate = useNavigate();

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/");
        }

    }, [navigate]);

    const handleLogout = () => {

        localStorage.removeItem("access_token");

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

                <h2>Welcome 👋</h2>

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
                        Add and manage store locations.
                    </p>

                </div>

                <div
                    className="card"
                    onClick={() => navigate("/shelves")}
                >

                    <h2>📦 Shelves</h2>

                    <p>
                        Manage shelf zones for stores.
                    </p>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;