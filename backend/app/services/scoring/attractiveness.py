def normalize(value, min_value, max_value):
    """
    Convert a metric into a 0-100 range.
    """

    if max_value == min_value:
        return 50.0

    score = (
        (value - min_value)
        / (max_value - min_value)
    ) * 100

    return max(0.0, min(100.0, score))


def calculate_attractiveness_score(
    attention_duration,
    interaction_frequency,
    pickup_rate,
    conversion_rate,
    repeat_engagement,
):
    """
    Calculate product attractiveness score.

    All inputs should already be normalized
    between 0 and 100.
    """

    score = (
        attention_duration * 0.35
        + interaction_frequency * 0.25
        + pickup_rate * 0.20
        + conversion_rate * 0.15
        + repeat_engagement * 0.05
    )

    return round(
        max(0.0, min(100.0, score)),
        2
    )