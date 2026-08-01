def generate_recommendation(
    attractiveness_score,
    attention_duration,
    pickup_rate,
    conversion_rate,
    repeat_engagement
):
    """
    Generates business recommendations based on
    shopper behavior and product attractiveness.
    """

    # High attention but low sales
    if attention_duration > 80 and conversion_rate < 20:
        return (
            "High shopper attention but poor sales. "
            "Review pricing, promotions, or product packaging."
        )

    # People pick it up but don't buy
    if pickup_rate > 70 and conversion_rate < 30:
        return (
            "Customers frequently pick up the product but rarely purchase it. "
            "Consider improving pricing or product value."
        )

    # Low attractiveness
    if attractiveness_score < 40:
        return (
            "Low product attractiveness. "
            "Consider improving shelf placement or increasing visibility."
        )

    # Excellent performer
    if attractiveness_score >= 80:
        return (
            "Top-performing product. "
            "Maintain placement and ensure inventory remains available."
        )

    # Loyal engagement
    if repeat_engagement > 70:
        return (
            "Strong repeat engagement detected. "
            "Consider cross-selling nearby complementary products."
        )

    return (
        "Product performance is stable. Continue monitoring shopper behavior."
    )