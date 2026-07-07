import { useEffect, useState } from "react";
import api from "../api/api";
import { canEditShelves, getSessionUser } from "../utils/role";

function Shelf() {
  const [shelves, setShelves] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [message, setMessage] = useState("");
  const editable = canEditShelves();
  const session = getSessionUser();

  const loadShelves = async () => {
    try {
      const response = await api.get("/shelves");
      setShelves(response.data);
    } catch (error) {
      console.log(error);
      setMessage("Backend is running, but shelves could not be loaded yet.");
    }
  };

  useEffect(() => {
    loadShelves();
  }, []);

  const addShelf = async () => {
    try {
      setMessage("");
      await api.post("/shelves", {
        zone_name: zoneName,
        store_id: Number(storeId),
      });
      setZoneName("");
      setStoreId("");
      setMessage("Shelf added successfully.");
      loadShelves();
    } catch (error) {
      console.log(error);
      setMessage("Could not add shelf.");
    }
  };

  return (
    <div className="page content-page">
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Shelf module</p>
            <h2>Manage shelves</h2>
          </div>
          <p className="muted">
            {editable
              ? "Create zones and connect them to a store ID."
              : "This role can review shelves, but cannot create new zones."}
          </p>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>Zone name</span>
            <input
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Electronics Aisle"
              disabled={!editable}
            />
          </label>

          <label className="field">
            <span>Store ID</span>
            <input
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="1"
              disabled={!editable}
            />
          </label>
        </div>

        <button className="primary-btn" onClick={addShelf} disabled={!editable}>
          {editable ? "Add Shelf" : "View Only"}
        </button>

        <p className="role-hint">
          Role: <strong>{session?.role?.name || "Unknown"}</strong> | Access:{" "}
          <strong>{editable ? "Can add shelves" : "Read only"}</strong>
        </p>
        {message ? <p className="muted">{message}</p> : null}
      </section>

      <section className="card">
        <h3>Shelves</h3>
        <div className="list">
          {shelves.length > 0 ? (
            shelves.map((shelf) => (
              <div className="list-item" key={shelf.id}>
                <strong>{shelf.zone_name}</strong>
                <span>Store ID: {shelf.store_id}</span>
              </div>
            ))
          ) : (
            <p className="muted">No shelves yet. Add your first one above.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Shelf;
