def classify_behavior(attention_time, path_length, gaze_changes):
    """
    Classify shopper behavior into one of three segments.
    """

    if path_length > 800 and attention_time > 10:
        return "Explorer"

    elif gaze_changes >= 5 and attention_time > 5:
        return "Comparison Shopper"

    else:
        return "Quick Buyer"