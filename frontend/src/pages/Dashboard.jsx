import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import AttentionChart from "../components/AttentionChart";
import AttentionPieChart from "../components/AttentionPieChart";
import RecentActivity from "../components/RecentActivity";
import Loader from "../components/Loader";

import {
  PeopleFill,
  CameraVideoFill,
  EyeFill,
  BarChartFill
} from "react-bootstrap-icons";

import "../styles/dashboard.css";

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/attention-records");
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load attention records");
        }

        setRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="dashboard-content">

        <Navbar />

        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <p>
            Welcome back! Here's your consumer attention overview.
          </p>
        </div>

        {/* KPI Cards */}

        <div className="stats-grid">

          <StatCard
            title="Consumers Today"
            value="154"
            change="+12%"
            color="#0F766E"
            icon={<PeopleFill />}
          />

          <StatCard
            title="Active Cameras"
            value="08"
            change="Online"
            color="#2563EB"
            icon={<CameraVideoFill />}
          />

          <StatCard
            title="Average Attention"
            value="42 sec"
            change="+8%"
            color="#F59E0B"
            icon={<EyeFill />}
          />

          <StatCard
            title="Shelf Visits"
            value="89"
            change="+15%"
            color="#8B5CF6"
            icon={<BarChartFill />}
          />

        </div>

        {/* Charts */}

        {loading ? (
          <Loader label="Loading attention data..." />
        ) : error ? (
          <div className="dashboard-error">{error}</div>
        ) : records.length === 0 ? (
          <div className="coming-soon-card">
            <p>No attention records yet — data will appear here once cameras start reporting.</p>
          </div>
        ) : (
          <>
            <div className="charts-grid">
              <div className="chart-card">
                <AttentionChart records={records} />
              </div>

              <div className="chart-card chart-card-pie">
                <AttentionPieChart records={records} />
              </div>
            </div>

            <div className="activity-section">
              <RecentActivity />
            </div>
          </>
        )}

      </div>

    </div>
  );
};

export default Dashboard;