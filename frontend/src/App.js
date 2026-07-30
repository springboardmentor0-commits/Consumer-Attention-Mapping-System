import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CameraManagement from "./pages/CameraManagement";
import AddStore from "./pages/AddStore";
import AddShelf from "./pages/AddShelf";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ShopperTracking from "./pages/ShopperTracking";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/camera-management" element={<CameraManagement />} />
        <Route path="/store-management" element={<AddStore />} />
        <Route path="/shopper-tracking" element={<ShopperTracking />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Admin-only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
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

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;