import random


def generate_recommendation(attention, score):

    # Simulated business metrics
    pickup_rate = random.randint(0, 100)
    conversion_rate = random.randint(0, 100)

    if attention > 15 and pickup_rate < 30:
        return "🔥 High attention but low pickup. Review product pricing or promotions."

    elif score > 80:
        return "⭐ Top-performing shelf. Keep current placement."

    elif score < 50:
        return "⚠ Low-performing shelf. Improve visibility or relocate products."

    elif conversion_rate < 30:
        return "📢 Many viewers but few buyers. Add promotional offers."

    else:
        return "✅ Shelf performance is healthy."