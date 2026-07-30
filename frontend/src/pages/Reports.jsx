import React, { useState } from "react";
import { Download } from "react-bootstrap-icons";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../styles/dashboard.css";
import "../styles/reports.css";

const REPORTS = [
  { id: 1, name: "Weekly Attention Summary", store: "Store #1 - MG Road", date: "22 Jul 2026", status: "ready" },
  { id: 2, name: "Camera Uptime Report", store: "Store #3 - FC Road", date: "21 Jul 2026", status: "ready" },
  { id: 3, name: "Shelf Engagement Report", store: "Store #2 - Kothrud", date: "20 Jul 2026", status: "processing" },
  { id: 4, name: "Monthly Consumer Insights", store: "All Stores", date: "18 Jul 2026", status: "ready" },
];

const Reports = () => {
  const [range, setRange] = useState("7d");
  const [store, setStore] = useState("all");

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar />

        <div className="page-header">
          <h2>Reports</h2>
          <p>Generate and download analytics reports for your stores.</p>
        </div>

        <div className="reports-toolbar">
          <div className="reports-filters">
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <select value={store} onChange={(e) => setStore(e.target.value)}>
              <option value="all">All Stores</option>
              <option value="1">Store #1 - MG Road</option>
              <option value="2">Store #2 - Kothrud</option>
              <option value="3">Store #3 - FC Road</option>
            </select>
          </div>

          <button className="btn-export">
            <Download style={{ marginRight: 8 }} />
            Export All
          </button>
        </div>

        <div className="reports-card">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Store</th>
                <th>Generated</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((report) => (
                <tr key={report.id}>
                  <td>{report.name}</td>
                  <td>{report.store}</td>
                  <td>{report.date}</td>
                  <td>
                    <span className={`report-status ${report.status}`}>
                      {report.status === "ready" ? "Ready" : "Processing"}
                    </span>
                  </td>
                  <td>
                    {report.status === "ready" && (
                      <a href="#!" className="report-link">
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;