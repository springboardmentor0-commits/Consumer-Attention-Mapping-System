import RecommendationsCard from "./components/RecommendationsCard";
import Navbar from "./components/Navbar";
import SummaryCards from "./components/SummaryCards";
import HeatmapCard from "./components/HeatmapCard";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/analytics/attention")
      .then((response) => response.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2 className="loading-text">Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <Navbar />

      <SummaryCards analytics={analytics} />

      <table>
        <thead>
          <tr>
            <th>Shelf ID</th>
            <th>Average Dwell Time (sec)</th>
            <th>Total Visits</th>
          </tr>
        </thead>

        <tbody>
          {analytics.map((item, index) => (
            <tr key={index}>
              <td>{item.shelf_id}</td>
              <td>{item.average_dwell_time}</td>
              <td>{item.total_visits}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <HeatmapCard />
      <RecommendationsCard />
    </div>
  );
}

export default App;