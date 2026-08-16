def generate_recommendation(
    product_name: str,
    attention_duration: float,
    interaction_frequency: float,
    pickup_rate: float,
    conversion_rate: float,
    repeat_engagement: float,
    attractiveness_score: float,
):
    recommendations = []

    # High attention but poor conversion
    if attention_duration > 80 and (
        pickup_rate == 0 or conversion_rate == 0
    ):
        recommendations.append(
            "High Eye Attention but Low Sales. "
            "Suggest reviewing pricing or promotional offer."
        )

    # High interaction but low pickup
    if interaction_frequency > 70 and pickup_rate < 30:
        recommendations.append(
            "High customer interaction but low pickup rate. "
            "Consider improving product placement or packaging."
        )

    # Low attractiveness
    if attractiveness_score < 30:
        recommendations.append(
            "Low product attractiveness. "
            "Consider improving shelf visibility, placement, or promotion."
        )

    # Good performance
    if not recommendations and attractiveness_score >= 70:
        recommendations.append(
            "Product is performing well. "
            "Maintain current placement and promotional strategy."
        )

    if not recommendations:
        recommendations.append(
            "No major anomaly detected. Continue monitoring performance."
        )

    return recommendations