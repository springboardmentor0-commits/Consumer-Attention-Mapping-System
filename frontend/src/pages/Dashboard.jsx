import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

        <div style={{ padding: "40px" }}>

            <h1>Dashboard</h1>

            <button onClick={handleLogout}>
                Logout
            </button>

        </div>

    );

}

export default Dashboard;