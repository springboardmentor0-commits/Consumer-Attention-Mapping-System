import random


def calculate_score(attention, interaction):

    # Simulated metrics
    pickup_rate = random.randint(20, 90)
    conversion_rate = random.randint(20, 90)
    repeat_engagement = random.randint(20, 90)

    # Normalize
    attention = min(attention * 5, 100)
    interaction = min(interaction * 10, 100)

    score = (
        attention * 0.35 +
        interaction * 0.25 +
        pickup_rate * 0.20 +
        conversion_rate * 0.15 +
        repeat_engagement * 0.05
    )

    return round(score, 2)