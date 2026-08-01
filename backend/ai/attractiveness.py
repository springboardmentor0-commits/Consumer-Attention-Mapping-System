import random


def calculate_attractiveness_score(
    attention_duration,
    interaction_frequency,
    pickup_rate,
    conversion_rate,
    repeat_engagement
):
    """
    Calculates the product attractiveness score (0–100)
    using the weighted formula from the project design.
    """

    score = (
        (attention_duration * 0.35)
        + (interaction_frequency * 0.25)
        + (pickup_rate * 0.20)
        + (conversion_rate * 0.15)
        + (repeat_engagement * 0.05)
    )

    return round(score, 2)


def generate_product_metrics(dwell_time):
    """
    Generates normalized product metrics for demonstration.
    """

    attention_duration = min(dwell_time * 10, 100)

    interaction_frequency = random.randint(50, 100)

    pickup_rate = random.randint(30, 100)

    conversion_rate = random.randint(20, 100)

    repeat_engagement = random.randint(10, 100)

    score = calculate_attractiveness_score(
        attention_duration,
        interaction_frequency,
        pickup_rate,
        conversion_rate,
        repeat_engagement
    )

    return {
        "attention_duration": attention_duration,
        "interaction_frequency": interaction_frequency,
        "pickup_rate": pickup_rate,
        "conversion_rate": conversion_rate,
        "repeat_engagement": repeat_engagement,
        "attractiveness_score": score
    }