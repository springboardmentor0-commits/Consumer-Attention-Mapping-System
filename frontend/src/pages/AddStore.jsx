import { useState } from "react";

function AddStore() {
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/stores",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store_name: storeName,
            location: location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add store");
      }

      setMessage("Store added successfully!");
      setStoreName("");
      setLocation("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h1>Add New Store</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Store Name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">
          Add Store
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default AddStore;