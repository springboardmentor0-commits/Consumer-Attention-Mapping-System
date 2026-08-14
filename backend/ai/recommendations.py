def generate_recommendations(
    product_name,
    attractiveness_score,
    attention_duration,
    pickup_rate,
    conversion_rate,
    repeat_engagement
):
    """
    Generates actionable business recommendations
    based on product performance metrics.
    """

    recommendations = []

    # Rule 1: High attention but low conversion
    if attention_duration > 80 and conversion_rate < 20:
        recommendations.append(
            "High shopper attention but poor sales. "
            "Review pricing, promotions, or product packaging."
        )

    # Rule 2: High pickup but low conversion
    if pickup_rate > 70 and conversion_rate < 30:
        recommendations.append(
            "Customers frequently pick up the product but rarely purchase it. "
            "Consider improving pricing or product value."
        )

    # Rule 3: Low attractiveness
    if attractiveness_score < 40:
        recommendations.append(
            "Low product attractiveness. "
            "Consider improving shelf placement or increasing visibility."
        )

    # Rule 4: Excellent performer
    if attractiveness_score >= 80:
        recommendations.append(
            "Top-performing product. "
            "Maintain placement and ensure inventory remains available."
        )

    # Rule 5: Strong repeat engagement
    if repeat_engagement > 70:
        recommendations.append(
            "Strong repeat engagement detected. "
            "Consider cross-selling nearby complementary products."
        )

    # Default recommendation
    if not recommendations:
        recommendations.append(
            "Product performance is stable. "
            "Continue monitoring shopper behavior."
        )

    return {
        "product_name": product_name,
        "attractiveness_score": attractiveness_score,
        "recommendations": recommendations
    }

def generate_recommendation(
    attractiveness_score,
    attention_duration,
    pickup_rate,
    conversion_rate,
    repeat_engagement
):
    """
    Backward-compatible wrapper for the existing API.
    """

    result = generate_recommendations(
        product_name="Product",
        attractiveness_score=attractiveness_score,
        attention_duration=attention_duration,
        pickup_rate=pickup_rate,
        conversion_rate=conversion_rate,
        repeat_engagement=repeat_engagement
    )

    return " ".join(result["recommendations"])