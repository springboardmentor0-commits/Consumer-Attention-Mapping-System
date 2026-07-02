import { useState } from "react";
import axios from "axios";

function AddShelf() {

    const [storeId, setStoreId] = useState("");
    const [zoneName, setZoneName] = useState("");

    const handleSubmit = async () => {

        try {

            await axios.post(
                "http://127.0.0.1:8000/shelves",
                {
                    store_id: Number(storeId),
                    zone_name: zoneName
                }
            );

            alert("Shelf added successfully");

        }
        catch(error){

            alert("Error creating shelf");

        }

    };

    return(

<div className="card">

<h2>📦 Add Shelf Zone</h2>
<p>Add a shelf zone to a store</p>

<input
type="number"
placeholder="Store ID"
onChange={(e)=>setStoreId(e.target.value)}
/>

<input
type="text"
placeholder="Zone Name"
onChange={(e)=>setZoneName(e.target.value)}
/>

<button
className="main-btn"
onClick={handleSubmit}
>
Add Shelf
</button>

</div>

)

}

export default AddShelf;