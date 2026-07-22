import { useState } from "react";
import axios from "axios";

function AddShelf() {

    const [storeId, setStoreId] = useState("");
    const [shelfName, setShelfName] = useState("");
    const [zoneName, setZoneName] = useState("");
    const [zoneCoordinates, setZoneCoordinates] = useState("");

    const handleSubmit = async () => {

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://127.0.0.1:8000/shelves",
                {
                    store_id: Number(storeId),
                    shelf_name: shelfName,
                    zone_name: zoneName,
                    zone_coordinates: zoneCoordinates
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Shelf added successfully");

            setStoreId("");
            setShelfName("");
            setZoneName("");
            setZoneCoordinates("");

        } catch (error) {

            console.log(error.response);

            alert("Error creating shelf");

        }

    };

    return (

        <div className="card">

            <h2>📦 Add Shelf Zone</h2>
            <p>Add a shelf to a store</p>

            <input
                type="number"
                placeholder="Store ID"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
            />

            <input
                type="text"
                placeholder="Shelf Name"
                value={shelfName}
                onChange={(e) => setShelfName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Zone Name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Zone Coordinates"
                value={zoneCoordinates}
                onChange={(e) => setZoneCoordinates(e.target.value)}
            />

            <button
                className="main-btn"
                onClick={handleSubmit}
            >
                Add Shelf
            </button>

        </div>

    );

}

export default AddShelf;