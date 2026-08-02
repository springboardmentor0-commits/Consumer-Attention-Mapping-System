import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import CctvModal from "./components/CctvModal";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StoreDetail from "./pages/StoreDetail";
import Shelf from "./pages/Shelf";
import AttentionAnalytics from "./pages/AttentionAnalytics";
import ConsumerBehavior from "./pages/ConsumerBehavior";
import HeatmapAnalytics from "./pages/HeatmapAnalytics";
import ProductInteractions from "./pages/ProductInteractions";
import ProductScoring from "./pages/ProductScoring";
import Recommendations from "./pages/Recommendations";

function App() {
  const [isGlobalCctvOpen, setIsGlobalCctvOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar onOpenCctv={() => setIsGlobalCctvOpen(true)} />
        <CctvModal isOpen={isGlobalCctvOpen} onClose={() => setIsGlobalCctvOpen(false)} />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Store Routes */}
          <Route path="/store" element={<StoreDetail />} />
          <Route path="/store/:storeId" element={<StoreDetail />} />
          
          {/* Shelf Routes */}
          <Route path="/shelf" element={<Shelf />} />
          <Route path="/shelf/:shelfId" element={<Shelf />} />

          {/* Standalone Store Analytics Feature Routes */}
          <Route path="/attention" element={<AttentionAnalytics />} />
          <Route path="/attention/:storeId" element={<AttentionAnalytics />} />
          
          <Route path="/behavior" element={<ConsumerBehavior />} />
          <Route path="/behavior/:storeId" element={<ConsumerBehavior />} />
          
          <Route path="/heatmap" element={<HeatmapAnalytics />} />
          <Route path="/heatmap/:storeId" element={<HeatmapAnalytics />} />
          
          <Route path="/interactions" element={<ProductInteractions />} />
          <Route path="/interactions/:storeId" element={<ProductInteractions />} />
          
          <Route path="/scoring" element={<ProductScoring />} />
          <Route path="/scoring/:storeId" element={<ProductScoring />} />
          
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/recommendations/:storeId" element={<Recommendations />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
