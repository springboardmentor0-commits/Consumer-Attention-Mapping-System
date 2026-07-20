import time


class DwellTimeTracker:
    """
    Tracks how long each shopper stays inside the camera view.

    Features:
    - Entry Time
    - Last Seen Time
    - Grace Period before exit
    - Completed Session Analytics
    """

    def __init__(self, timeout=2.0):
        self.timeout = timeout

        self.active_shoppers = {}

    def update(self, tracked_ids):
        """
        Update shopper information every frame.

        Args:
            tracked_ids (list[int])

        Returns:
            list[dict]
        """

        current_time = time.time()

        completed_sessions = []

        # -----------------------------
        # Update existing shoppers
        # -----------------------------
        for person_id in tracked_ids:

            if person_id not in self.active_shoppers:

                print(f"NEW SHOPPER -> ID {person_id}")

                self.active_shoppers[person_id] = {
                    "entry_time": current_time,
                    "last_seen": current_time,
                }

            else:

                self.active_shoppers[person_id]["last_seen"] = current_time

        # -----------------------------
        # Check who has left
        # -----------------------------
        for person_id in list(self.active_shoppers.keys()):

            shopper = self.active_shoppers[person_id]

            if current_time - shopper["last_seen"] > self.timeout:

                dwell_time = shopper["last_seen"] - shopper["entry_time"]

                print(f"SHOPPER LEFT -> ID {person_id}")

                completed_sessions.append({
                    "person_id": person_id,
                    "entry_time": shopper["entry_time"],
                    "exit_time": shopper["last_seen"],
                    "dwell_time": round(dwell_time, 2)
                })

                del self.active_shoppers[person_id]

        return completed_sessions