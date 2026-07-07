import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { canEditStores, getSessionUser } from "../utils/role";

function Store() {
  const [stores, setStores] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const editable = canEditStores();
  const session = getSessionUser();

  const loadStores = async () => {
    try {
      const response = await api.get("/stores");
      setStores(response.data);
    } catch (error) {
      console.log(error);
      setMessage("Backend is running, but stores could not be loaded yet.");
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const addStore = async () => {
    try {
      setMessage("");
      await api.post("/stores", {
        store_name: storeName,
        location,
      });
      setStoreName("");
      setLocation("");
      setMessage("Store added successfully.");
      loadStores();
    } catch (error) {
      console.log(error);
      setMessage("Could not add store.");
    }
  };

  return (
    <div className="page content-page">
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Store module</p>
            <h2>Manage stores</h2>
          </div>
          <p className="muted">
            {editable
              ? "Add a store and see the current list below."
              : "This role can view stores but cannot add new ones."}
          </p>
        </div>

        <div className="grid-2">
          <label className="field">
            <span>Store name</span>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="City Center Mall"
              disabled={!editable}
            />
          </label>

          <label className="field">
            <span>Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bengaluru"
              disabled={!editable}
            />
          </label>
        </div>

        <button className="primary-btn" onClick={addStore} disabled={!editable}>
          {editable ? "Add Store" : "View Only"}
        </button>

        <p className="role-hint">
          Role: <strong>{session?.role?.name || "Unknown"}</strong> | Access:{" "}
          <strong>{editable ? "Can add stores" : "Read only"}</strong>
        </p>
        {message ? <p className="muted">{message}</p> : null}
      </section>

      <section className="card">
        <h3>Stores</h3>
        <div className="list">
          {stores.length > 0 ? (
            stores.map((store) => (
              <Link className="list-item list-link" key={store.id} to={`/store/${store.id}`}>
                <strong>{store.store_name}</strong>
                <span>{store.location}</span>
              </Link>
            ))
          ) : (
            <p className="muted">No stores yet. Add your first one above.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Store;
