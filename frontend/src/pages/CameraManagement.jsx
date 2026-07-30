import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/camera.css";

const CameraManagement = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar />

        <div className="page-header">
          <h2>Camera Management</h2>
          <p>Manage all surveillance cameras connected to your retail store.</p>
        </div>

        <div className="camera-card">
          <div className="camera-top">
            <h4>Camera 01</h4>
            <span className="status online">Online</span>
          </div>

          <p><strong>Location:</strong> Entrance Gate</p>
          <p><strong>IP Address:</strong> 192.168.1.101</p>
          <p><strong>Resolution:</strong> 1920 × 1080</p>

          <div className="camera-buttons">
            <button className="btn btn-success">View Live</button>
            <button className="btn btn-primary">Edit</button>
            <button className="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraManagement;