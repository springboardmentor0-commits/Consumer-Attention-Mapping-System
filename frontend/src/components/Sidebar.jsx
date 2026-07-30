import React from "react";
import { NavLink } from "react-router-dom";
import {
  HouseDoor,
  CameraVideo,
  Shop,
  Grid,
  BarChart,
  FileEarmarkText,
  Person,
  Gear,
  BoxArrowRight,
  PersonWalking
} from "react-bootstrap-icons";

import "../styles/Sidebar.css";

const MENU_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: <HouseDoor /> },
  { to: "/camera-management", label: "Camera Management", icon: <CameraVideo /> },
  { to: "/store-management", label: "Store Management", icon: <Shop /> },
  { to: "/add-shelf", label: "Shelf Management", icon: <Grid /> },
  { to: "/shopper-tracking", label: "Shopper Tracking", icon: <PersonWalking /> },
  { to: "/reports", label: "Reports", icon: <FileEarmarkText /> },
  { to: "/profile", label: "Profile", icon: <Person /> },
  { to: "/settings", label: "Settings", icon: <Gear /> },
];

const Sidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_role");
    window.location.href = "/";
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <CameraVideo size={34} />
        <h4>CAMS</h4>
      </div>

      <ul className="sidebar-menu">
        {MENU_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="logout" onClick={handleLogout}>
        <BoxArrowRight />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;