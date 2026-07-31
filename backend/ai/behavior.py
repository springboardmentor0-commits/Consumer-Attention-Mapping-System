def classify_shopper(dwell_time, tracker_id):

    # Dummy values derived from tracker_id
    path_length = tracker_id * 12
    gaze_shifts = tracker_id % 5

    if path_length > 100 and dwell_time > 8:
        return "Explorer"

    elif dwell_time < 3:
        return "Quick Buyer"

    elif gaze_shifts >= 3:
        return "Comparison Shopper"

    else:
        return "Regular Shopper"