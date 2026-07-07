import { Link } from "react-router-dom";
import { getSessionUser } from "../utils/role";

function Dashboard() {
  const session = getSessionUser();
  const role = session?.role;

  const canEdit = Boolean(role?.canEditStores || role?.canEditShelves);

  return (
    <div className="page dashboard-page">
      <section className="role-banner">
        <div className="role-badge-row">
          <span className="role-badge">{role?.name || "Role not detected"}</span>
          <span className="role-badge muted-badge">
            {role?.access || "Limited access"}
          </span>
        </div>

        <div className="role-banner-grid">
          <div>
            <p className="eyebrow">Signed in account</p>
            <h2>{session?.email || "User"}</h2>
            <p className="muted">
              Role ID: {session?.roleId ?? "-"}
              {role?.summary ? ` - ${role.summary}` : ""}
            </p>
          </div>

          <div className="role-notes">
            <div>
              <strong>What you can do</strong>
              <p>
                {canEdit
                  ? "Create and manage data in the modules enabled for your role."
                  : "View the dashboard and review existing data only."}
              </p>
            </div>
            <div>
              <strong>Restrictions</strong>
              <p>{role?.restrictions || "No restrictions detected."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-card">
        <div>
          <p className="eyebrow">Signed in successfully</p>
          <h1>Welcome to your control room.</h1>
          <p className="hero-copy">
            Everything important is now in one place. Start with stores,
            shelves, or open a store detail page to inspect shelf and camera
            setup.
          </p>
        </div>

        <div className="dashboard-actions">
          <Link className="action-card" to="/store">
            <strong>Store</strong>
            <span>Add, view, and inspect store data</span>
          </Link>
          <Link className="action-card" to="/shelf">
            <strong>Shelf</strong>
            <span>Create shelf zones and map store links</span>
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Access</span>
          <strong>{role?.access || "Limited"}</strong>
          <p>{role?.summary || "Role details are unavailable."}</p>
        </div>
        <div className="stat-card">
          <span>Status</span>
          <strong>Ready</strong>
          <p>Your backend connection is active.</p>
        </div>
        <div className="stat-card">
          <span>Next step</span>
          <strong>Module use</strong>
          <p>Use the cards above to open the areas your role can edit.</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
