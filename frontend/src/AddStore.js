import { useState } from "react";
import axios from "axios";

function AddStore() {

    const [storeName, setStoreName] = useState("");
    const [location, setLocation] = useState("");

    const handleSubmit = async () => {

        try {

            await axios.post(
                "http://127.0.0.1:8000/stores",
                {
                    store_name: storeName,
                    location: location
                }
            );

            alert("Store added successfully");

        } catch (error) {

            alert("Error creating store");

        }

    };

    return(

<div className="card">

<h2>🏬 Add Store</h2>
<p>Add a new store to the system</p>

<input
type="text"
placeholder="Store Name"
onChange={(e)=>setStoreName(e.target.value)}
/>

<input
type="text"
placeholder="Location"
onChange={(e)=>setLocation(e.target.value)}
/>

<button
className="main-btn"
onClick={handleSubmit}
>
Add Store
</button>

</div>

)

}

export default AddStore;