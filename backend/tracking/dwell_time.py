import time
from datetime import datetime


from tracking.dwell_db import save_dwell_record

# ============================================================
# SHELF ZONE CONFIGURATION
# Format: (x1, y1, x2, y2)
# ============================================================

SHELF_ZONE = (1180, 120, 1850, 950)


# ============================================================
# DWELL TIME STORAGE
# ============================================================

# Store entry time for each shopper currently inside the zone
shopper_entry_times = {}

# Store completed dwell durations
shopper_dwell_times = {}


# ============================================================
# GET SHELF ZONE
# ============================================================

def get_shelf_zone():
    """
    Return shelf zone coordinates.
    """
    return SHELF_ZONE


# ============================================================
# CHECK IF SHOPPER IS INSIDE SHELF ZONE
# ============================================================

def is_shopper_in_zone(box, zone=SHELF_ZONE):
    """
    Check whether the center point of a shopper's
    bounding box is inside the shelf zone.
    """

    x1, y1, x2, y2 = box
    zone_x1, zone_y1, zone_x2, zone_y2 = zone

    # Calculate center point of shopper bounding box
    center_x = (x1 + x2) / 2
    center_y = (y1 + y2) / 2

    # Check whether center point is inside shelf zone
    return (
        zone_x1 <= center_x <= zone_x2
        and zone_y1 <= center_y <= zone_y2
    )

def update_dwell_time(shopper_id, box):
    """
    Start dwell timer when shopper enters the shelf zone.
    Stop timer and calculate duration when shopper exits.
    """

    inside_zone = is_shopper_in_zone(box)

    # Shopper is inside shelf zone
    if inside_zone:

        # Start timer only once
        if shopper_id not in shopper_entry_times:
            entry_time = time.time()
            entry_timestamp = datetime.now()

            shopper_entry_times[shopper_id] = {
                "start_time": entry_time,
                "entry_timestamp": entry_timestamp
        }

            print(
                f"Shopper #{shopper_id} entered shelf zone | "
                f"Entry Time: {entry_timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
        )

        # Calculate live dwell time
        current_dwell = (
            time.time()
            - shopper_entry_times[shopper_id]["start_time"]
)

        return current_dwell

    # Shopper is outside shelf zone
    else:

        # Shopper was previously inside
        if shopper_id in shopper_entry_times:
            exit_time = time.time()
            exit_timestamp = datetime.now()

            entry_data = shopper_entry_times[shopper_id]

            dwell_duration = (
                exit_time - entry_data["start_time"]
)

            # Store complete dwell session record
            shopper_dwell_times[shopper_id] = {
                "shopper_id": shopper_id,
                "entry_time": entry_data["entry_timestamp"],
                "exit_time": exit_timestamp,
                "total_dwell_duration": round(dwell_duration, 2)
}
            # Save completed dwell session to database
            save_dwell_record(
                shopper_id=shopper_id,
                shelf_id="Shelf Zone",
                entry_time=entry_data["entry_timestamp"],
                exit_time=exit_timestamp,
                total_dwell_duration=round(dwell_duration, 2)
)

            print(
                f"Shopper #{shopper_id} exited shelf zone | "
                f"Entry Time: {entry_data['entry_timestamp'].strftime('%Y-%m-%d %H:%M:%S')} | "
                f"Exit Time: {exit_timestamp.strftime('%Y-%m-%d %H:%M:%S')} | "
                f"Dwell Time: {dwell_duration:.2f} seconds"
)

            # Remove active timer
            del shopper_entry_times[shopper_id]

            return dwell_duration

    return 0.0