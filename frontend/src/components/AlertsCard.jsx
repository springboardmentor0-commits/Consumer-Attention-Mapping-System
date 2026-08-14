import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";

function AlertsCard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/analytics/alerts")
      .then((response) => response.json())
      .then((data) => setAlerts(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="alerts-card">
      <h2>Product Alerts</h2>

      {alerts.length === 0 ? (
        <p>No active product alerts.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tracker</th>
              <th>Severity</th>
              <th>Alert</th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((alert, index) => (
              <tr key={index}>
                <td>{alert.tracker_id}</td>

                <td>
                  <StatusBadge severity={alert.severity} />
                </td>

                <td>{alert.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AlertsCard;