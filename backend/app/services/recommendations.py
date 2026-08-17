from typing import Dict, List


def generate_product_recommendation(
    product_name: str,
    shelf_zone: str,
    attractiveness_score: float,
) -> Dict:
    """
    Generate rule-based recommendations based on the Product
    Attractiveness Score.

    Parameters
    ----------
    product_name : str
        Name of the product.
    shelf_zone : str
        Shelf where the product is placed (e.g., Shelf A, Shelf B).
    attractiveness_score : float
        Final attractiveness score (0-100).

    Returns
    -------
    dict
        Recommendation details including priority and suggestions.
    """

    recommendations: List[str] = []

    if attractiveness_score < 40:
        priority = "High"

        recommendations.extend(
            [
                "Reposition the product to an eye-level shelf for better visibility.",
                "Improve shelf presentation using clearer signage and lighting.",
                "Consider promotional pricing or discount campaigns.",
                "Review product packaging and shelf placement strategy.",
            ]
        )

    elif attractiveness_score < 60:
        priority = "Medium"

        recommendations.extend(
            [
                "Optimize shelf organization to improve customer engagement.",
                "Bundle the product with complementary items.",
                "Monitor shopper engagement and adjust placement if required.",
            ]
        )

    elif attractiveness_score < 80:
        priority = "Low"

        recommendations.extend(
            [
                "Current shelf placement is satisfactory.",
                "Continue monitoring product performance.",
                "Seasonal promotions may further improve engagement.",
            ]
        )

    else:
        priority = "Excellent"

        recommendations.extend(
            [
                "Current shelf placement is performing exceptionally well.",
                "Maintain the existing merchandising strategy.",
                "Use this product placement as a benchmark for similar products.",
            ]
        )

    return {
        "product": product_name,
        "shelf": shelf_zone,
        "score": round(attractiveness_score, 2),
        "priority": priority,
        "recommendations": recommendations,
    }