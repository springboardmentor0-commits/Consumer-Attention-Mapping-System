from database import SessionLocal
from models import DwellTimeRecord




def save_dwell_record(
    shopper_id,
    shelf_id,
    entry_time,
    exit_time,
    total_dwell_duration
):
    """
    Save one completed shopper dwell session
    into the database.
    """

    db = SessionLocal()

    try:
        record = DwellTimeRecord(
            shopper_id=shopper_id,
            shelf_id=shelf_id,
            entry_time=entry_time,
            exit_time=exit_time,
            total_dwell_duration=total_dwell_duration
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        print(
            f"Database saved: Shopper #{shopper_id} | "
            f"Shelf: {shelf_id} | "
            f"Dwell: {total_dwell_duration:.2f}s"
        )

        return record

    except Exception as error:
        db.rollback()
        print(f"Database save error: {error}")
        return None

    finally:
        db.close()