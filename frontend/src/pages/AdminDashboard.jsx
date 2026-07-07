import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_role");

    navigate("/");
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <p>Welcome to Consumer Attention Mapping System</p>

      <p>Logged in as: {role}</p>

      <button onClick={() => navigate("/add-store")}>
        Add Store
      </button>

      <br /><br />
      <br /><br />

<button onClick={() => navigate("/add-shelf")}>
  Add Shelf
</button>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default AdminDashboard;