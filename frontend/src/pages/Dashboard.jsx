import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import "./Dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
    };

    return (
        <div className="dashboard-page">

            {/* Header */}

            <header className="dashboard-header">

                <div>
                    <h1 className="dashboard-system-title">
                        Consumer Attention Mapping System
                    </h1>

                    <p className="dashboard-system-subtitle">
                        Retail Store & Shelf Management
                    </p>
                </div>

                <Button
                    variant="destructive"
                    onClick={handleLogout}
                >
                    Logout
                </Button>

            </header>

            {/* Main Content */}

            <main className="dashboard-main">

                <div className="dashboard-welcome">

                    <h2 className="dashboard-title">
                        Dashboard
                    </h2>

                    <p className="dashboard-description">
                        Manage stores, shelves and retail layout operations.
                    </p>

                </div>

                <div className="dashboard-grid">

                    <div className="dashboard-card">

                        <h3>Stores</h3>

                        <p>
                            View and manage registered retail stores.
                        </p>

                        <Button
                            className="dashboard-button"
                            onClick={() => navigate("/stores/view")}
                        >
                            View Stores
                        </Button>

                    </div>

                    <div className="dashboard-card">

                        <h3>Add Store</h3>

                        <p>
                            Register a new physical retail location.
                        </p>

                        <Button
                            className="dashboard-button"
                            onClick={() => navigate("/stores/add")}
                        >
                            Add Store
                        </Button>

                    </div>

                    <div className="dashboard-card">

                        <h3>Shelves</h3>

                        <p>
                            Browse and manage shelf assignments.
                        </p>

                        <Button
                            className="dashboard-button"
                            onClick={() => navigate("/shelves/view")}
                        >
                            View Shelves
                        </Button>

                    </div>

                    <div className="dashboard-card">

                        <h3>Add Shelf</h3>

                        <p>
                            Create a new shelf mapping for a store.
                        </p>

                        <Button
                            className="dashboard-button"
                            onClick={() => navigate("/shelves/add")}
                        >
                            Add Shelf
                        </Button>

                    </div>

                    <div className="dashboard-card">

                        <h3>Analytics</h3>

                        <p>
                            View real-time consumer attention and heatmap metrics.
                        </p>

                        <Button
                            className="dashboard-button"
                            onClick={() => navigate("/analytics")}
                        >
                            View Analytics
                        </Button>

                    </div>

                </div>

            </main>

        </div>
    );
}