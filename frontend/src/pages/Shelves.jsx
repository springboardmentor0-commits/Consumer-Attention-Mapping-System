import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/stores.css";

function Shelves() {

    const navigate = useNavigate();

    const [zoneName, setZoneName] = useState("");
    const [storeId, setStoreId] = useState("");
    const [shelves, setShelves] = useState([]);

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/");
            return;
        }

        getShelves();

    }, [navigate]);

    const getShelves = async () => {

        const response = await api.get("/shelves");
        setShelves(response.data);

    };

    const addShelf = async () => {

        await api.post("/shelves", {
            zone_name: zoneName,
            store_id: Number(storeId)
        });

        setZoneName("");
        setStoreId("");

        getShelves();

    };

    return (

        <div className="page">

            <div className="page-header">

                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

                <h1>📦 Shelves</h1>

            </div>

            <div className="form-card">

                <h2>Add Shelf</h2>

                <input
                    type="text"
                    placeholder="Zone Name"
                    value={zoneName}
                    onChange={(e)=>setZoneName(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Store ID"
                    value={storeId}
                    onChange={(e)=>setStoreId(e.target.value)}
                />

                <button
                    className="primary-btn"
                    onClick={addShelf}
                >
                    Add Shelf
                </button>

            </div>

            <h2 className="section-title">Available Shelves</h2>

            <div className="grid">

                {shelves.map((shelf)=>(

                    <div className="store-card" key={shelf.id}>

                        <h3>📦 {shelf.zone_name}</h3>

                        <p>🏪 Store ID: {shelf.store_id}</p>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Shelves;