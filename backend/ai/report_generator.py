import pandas as pd


def generate_product_report(product_data):
    """
    Converts product analytics data into a pandas DataFrame
    for report generation.
    """

    report_rows = []

    for product in product_data:
        report_rows.append({
            "Tracker ID": product.get("tracker_id"),
            "Shelf ID": product.get("shelf_id"),
            "Attention Duration": product.get("attention_duration"),
            "Interaction Frequency": product.get("interaction_frequency"),
            "Pickup Rate": product.get("pickup_rate"),
            "Conversion Rate": product.get("conversion_rate"),
            "Repeat Engagement": product.get("repeat_engagement"),
            "Attractiveness Score": product.get("attractiveness_score"),
            "Recommendation": product.get("recommendation")
        })

    return pd.DataFrame(report_rows)