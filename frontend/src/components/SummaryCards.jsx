function SummaryCards({ analytics }) {
  const first = analytics[0];

  return (
    <div className="summary-cards">
      <div className="card">
        <h3>Average Dwell</h3>
        <p>{first ? `${first.average_dwell_time} sec` : "--"}</p>
      </div>

      <div className="card">
        <h3>Total Visits</h3>
        <p>{first ? first.total_visits : "--"}</p>
      </div>

      <div className="card">
        <h3>Monitored Shelves</h3>
        <p>{analytics.length}</p>
      </div>
    </div>
  );
}

export default SummaryCards;