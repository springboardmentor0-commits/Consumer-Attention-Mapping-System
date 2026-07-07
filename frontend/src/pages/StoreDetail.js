import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { getSessionUser } from "../utils/role";

function StoreDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const session = getSessionUser();
  const [store, setStore] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStore = async () => {
      try {
        setLoading(true);
        setError("");

        const [storesResponse, shelvesResponse] = await Promise.all([
          api.get("/stores"),
          api.get("/shelves"),
        ]);

        const matchedStore = storesResponse.data.find(
          (item) => String(item.id) === String(storeId)
        );

        if (!matchedStore) {
          setError("Store not found.");
          return;
        }

        setStore(matchedStore);
        setShelves(
          shelvesResponse.data.filter(
            (shelf) => String(shelf.store_id) === String(storeId)
          )
        );
      } catch (err) {
        console.log(err);
        setError("Could not load store details right now.");
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [storeId]);

  const metrics = useMemo(() => {
    const shelfCount = shelves.length;
    const expectedShelves = Math.max(8, shelfCount || 0);
    const coverage = Math.min(100, Math.round((shelfCount / expectedShelves) * 100));
    const cameraReady = Math.min(100, Math.max(35, coverage + 20));

    return {
      shelfCount,
      expectedShelves,
      coverage,
      cameraReady,
    };
  }, [shelves]);

  const cameraDetails = [
    {
      title: "Primary camera line",
      value: `${Math.max(1, Math.ceil(metrics.shelfCount / 2))} active cameras`,
    },
    {
      title: "Coverage status",
      value: `${metrics.coverage}% shelf coverage mapped`,
    },
    {
      title: "Attention capture",
      value: `${metrics.cameraReady}% ready for monitoring`,
    },
    {
      title: "Setup note",
      value: "Keep a camera facing each key aisle or zone entrance.",
    },
  ];

  if (loading) {
    return (
      <div className="page content-page">
        <section className="card">
          <p className="muted">Loading store details...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page content-page">
        <section className="card">
          <p className="error-text">{error}</p>
          <button className="primary-btn" onClick={() => navigate("/store")}>
            Back to Stores
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page content-page">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Store detail</p>
          <h1>{store?.store_name}</h1>
          <p className="muted">{store?.location}</p>
        </div>

        <div className="detail-actions">
          <Link className="secondary-btn" to="/store">
            Back to Stores
          </Link>
          <span className="detail-id">Store ID: {store?.id}</span>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Shelves</span>
          <strong>{metrics.shelfCount}</strong>
          <p>Connected shelf records for this store.</p>
        </div>
        <div className="stat-card">
          <span>Gathering</span>
          <strong>{metrics.coverage}%</strong>
          <p>How much of the expected shelf layout is mapped.</p>
        </div>
        <div className="stat-card">
          <span>Camera readiness</span>
          <strong>{metrics.cameraReady}%</strong>
          <p>Quick estimate of setup completeness.</p>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Shelf information</p>
            <h2>All shelves in this store</h2>
          </div>
          <p className="muted">
            Showing shelves linked to store ID {store?.id}. Total expected shelf slots: {metrics.expectedShelves}
          </p>
        </div>

        <div className="list">
          {shelves.length > 0 ? (
            shelves.map((shelf, index) => (
              <div className="detail-row" key={shelf.id}>
                <div>
                  <strong>{shelf.zone_name}</strong>
                  <p>Store ID: {shelf.store_id}</p>
                </div>
                <span className="mini-pill">Shelf {index + 1}</span>
              </div>
            ))
          ) : (
            <p className="muted">No shelves are linked to this store yet.</p>
          )}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Camera setup</p>
            <h2>Setup details</h2>
          </div>
          <p className="muted">Simple guidance for monitoring this store.</p>
        </div>

        <div className="camera-grid">
          {cameraDetails.map((item) => (
            <div className="camera-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.value}</p>
            </div>
          ))}
        </div>

        <p className="role-hint">
          Logged in as <strong>{session?.role?.name || "Unknown"}</strong>. This page summarizes store layout and camera planning.
        </p>
      </section>
    </div>
  );
}

export default StoreDetail;
