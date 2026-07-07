import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AddStore from "./pages/AddStore";
import AddShelf from "./pages/AddShelf";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }

        />
        <Route
  path="/add-store"
  element={
    <ProtectedRoute>
      <AddStore />
    </ProtectedRoute>
  }
/>
<Route
  path="/add-shelf"
  element={
    <ProtectedRoute>
      <AddShelf />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;