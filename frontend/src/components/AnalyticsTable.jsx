function AnalyticsTable({ analytics }) {
    return (
        <div className="analytics-table">
            <h2>Attention Analytics</h2>

            <table>
                <thead>
                    <tr>
                        <th>Shelf ID</th>
                        <th>Average Dwell Time (sec)</th>
                        <th>Total Visits</th>
                    </tr>
                </thead>

                <tbody>
                    {analytics.length > 0 ? (
                        analytics.map((item, index) => (
                            <tr key={index}>
                                <td>{item.shelf_id}</td>
                                <td>{item.average_dwell_time}</td>
                                <td>{item.total_visits}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">
                                No analytics data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AnalyticsTable;