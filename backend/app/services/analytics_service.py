from app.core.database import SessionLocal
from app.models.attention_session import AttentionSession


class AnalyticsService:

    def save_session(self, shopper_id, dwell_time, zone_times):

        db = SessionLocal()

        try:

            zone_a = round(zone_times.get("Zone A", 0), 2)
            zone_b = round(zone_times.get("Zone B", 0), 2)
            zone_c = round(zone_times.get("Zone C", 0), 2)

            valid_zones = {
                zone: seconds for zone, seconds in zone_times.items() if zone != "None"
            }

            if valid_zones:
                most_viewed = max(valid_zones, key=valid_zones.get)
            else:
                most_viewed = "No Shelf Viewed"

            session = AttentionSession(
                shopper_id=shopper_id,
                dwell_time=dwell_time,
                zone_a_time=zone_a,
                zone_b_time=zone_b,
                zone_c_time=zone_c,
                most_viewed_zone=most_viewed,
            )

            db.add(session)
            db.commit()

        finally:
            db.close()
