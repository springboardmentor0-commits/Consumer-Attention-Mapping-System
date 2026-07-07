import { useEffect, useState } from "react";

function AddShelf() {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/stores"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load stores");
        }

        setStores(data);
      } catch (error) {
        setMessage(error.message);
      }
    };

    fetchStores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/shelves",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store_id: Number(storeId),
            zone_name: zoneName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to add shelf"
        );
      }

      setMessage("Shelf added successfully!");
      setStoreId("");
      setZoneName("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h1>Add New Shelf Zone</h1>

      <form onSubmit={handleSubmit}>
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          required
        >
          <option value="">
            Select Store
          </option>

          {stores.map((store) => (
            <option
              key={store.id}
              value={store.id}
            >
              {store.store_name} - {store.location}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          type="text"
          placeholder="Zone Name"
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">
          Add Shelf
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default AddShelf;