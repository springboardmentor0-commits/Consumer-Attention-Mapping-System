import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/stores.css";

function Stores() {

    const navigate = useNavigate();

    const [storeName, setStoreName] = useState("");
    const [location, setLocation] = useState("");

    const [stores, setStores] = useState([]);
    const [shelves, setShelves] = useState([]);

    const [openStore, setOpenStore] = useState(null);

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/");
            return;
        }

        getData();

    }, [navigate]);

    const getData = async () => {

        try {

            const storeResponse = await api.get("/stores");
            const shelfResponse = await api.get("/shelves");

            setStores(storeResponse.data);
            setShelves(shelfResponse.data);

        } catch (error) {

            console.log(error);

        }

    };

    const addStore = async () => {

        try {

            await api.post("/stores", {
                store_name: storeName,
                location: location
            });

            setStoreName("");
            setLocation("");

            getData();

        } catch (error) {

            console.log(error);

        }

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

            </div>

            <h1 className="app-title">
                Consumer Attention Mapping System
            </h1>

            <h2 className="page-title">
                Store Management
            </h2>

            <div className="form-card">

                <h2>Add New Store</h2>

                <input
                    type="text"
                    placeholder="Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <button
                    className="primary-btn"
                    onClick={addStore}
                >
                    Add Store
                </button>

            </div>

            <h2 className="section-title">
                Store Directory
            </h2>

            <div className="directory">

                {stores.map((store) => (

                    <div
                        className="directory-card"
                        key={store.id}
                    >

                        <div
                            className="directory-header"
                            onClick={() =>
                                setOpenStore(
                                    openStore === store.id ? null : store.id
                                )
                            }
                        >

                            <div>

                                <h3>🏪 {store.store_name}</h3>

                                <p>📍 {store.location}</p>

                            </div>

                            <span>

                                {openStore === store.id ? "▲" : "▼"}

                            </span>

                        </div>

                        {openStore === store.id && (

                            <div className="directory-body">

                                <h4>Shelves</h4>

                                {shelves
                                    .filter(
                                        shelf => shelf.store_id === store.id
                                    )
                                    .map((shelf) => (

                                        <p key={shelf.id}>

                                            • {shelf.zone_name}

                                        </p>

                                    ))}

                                {shelves.filter(
                                    shelf => shelf.store_id === store.id
                                ).length === 0 && (

                                    <p>No shelves added yet.</p>

                                )}

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Stores;