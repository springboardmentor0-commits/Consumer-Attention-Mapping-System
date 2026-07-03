import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Stores from "../pages/Stores";
import Shelves from "../pages/Shelves";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/stores" element={<Stores />} />

        <Route path="/shelves" element={<Shelves />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;