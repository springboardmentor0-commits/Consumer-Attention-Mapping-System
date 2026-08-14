def generate_alert(
    tracker_id,
    attractiveness_score,
    recommendation
):
    """
    Generates a notification based on the existing
    product attractiveness score.
    """

    if attractiveness_score < 40:
        return {
            "tracker_id": tracker_id,
            "type": "product_performance",
            "message": recommendation,
            "severity": "high"
        }

    if attractiveness_score < 60:
        return {
            "tracker_id": tracker_id,
            "type": "product_performance",
            "message": recommendation,
            "severity": "medium"
        }

    return None