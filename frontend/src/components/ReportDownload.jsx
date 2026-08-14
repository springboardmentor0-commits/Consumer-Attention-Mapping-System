function ReportDownload() {
  const downloadReport = () => {
    window.open(
      "http://127.0.0.1:8000/analytics/export-report",
      "_blank"
    );
  };

  return (
    <div className="report-card">
      <h2>Reports & Export</h2>

      <p>
        Download the latest product analytics report as an Excel file.
      </p>

      <button onClick={downloadReport}>
        Download Excel Report
      </button>
    </div>
  );
}

export default ReportDownload;