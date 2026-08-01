import { useEffect, useState } from "react";

function RecommendationsCard() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/analytics/product-scores")
            .then((response) => response.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div className="recommendation-card">
            <h2>AI Product Recommendations</h2>

            <table>
                <thead>
                    <tr>
                        <th>Tracker</th>
                        <th>Score</th>
                        <th>Recommendation</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.tracker_id}</td>
                            <td>{product.attractiveness_score}</td>
                            <td>{product.recommendation}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RecommendationsCard;