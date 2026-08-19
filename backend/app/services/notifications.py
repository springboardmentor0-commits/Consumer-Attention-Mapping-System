"""
Turn alert-worthy findings into persisted notifications.

There is no detection logic here. The findings come from
services/reports.py::build_store_report, which already derives an `alerts`
list from the High-priority band the recommendation engine assigns. This
module only decides when to write those findings down and how to avoid
recording the same standing problem twice.
"""

from app.crud.notification import create_notification, has_open_notification
from app.models.shelf import Shelf
from app.services.reports import build_store_report


# Every notification this module writes describes shelf performance. A wider
# taxonomy (traffic anomalies, camera health) needs detection that does not
# exist yet — see the gap noted in the task report.
SHELF_PERFORMANCE = "shelf_performance"


def resolve_shelf_id(db, store_id: int, shelf_label: str):
    """
    Best-effort link from an alert's shelf label to a Shelf record.

    The alert names a display label ("Shelf A"), which is frame geometry, not
    a shelf record. Only rows the pipeline already attributed to a shelf can
    resolve, so this returns None rather than guessing when nothing matches.
    """

    shelf = (
        db.query(Shelf)
        .filter(Shelf.store_id == store_id)
        .filter(Shelf.shelf_name == shelf_label)
        .first()
    )

    return shelf.id if shelf else None


def sync_store_notifications(db, store_id: int):
    """
    Record any currently alerting shelves for one store.

    Called after analytics change, which is the only moment the alert state
    can change. Returns the notifications created — an empty list when nothing
    is alerting or when the same findings are already unread.
    """

    if store_id is None:
        raise ValueError(
            "store_id is required: notifications must be store-scoped."
        )

    report = build_store_report(db, store_id=store_id)

    if report is None:
        # Unknown store. The caller validated it, so this only happens if the
        # store disappeared mid-run; nothing to record either way.
        return []

    created = []

    for alert in report["alerts"]:
        message = f"{alert['shelf']}: {alert['message']}"

        shelf_id = resolve_shelf_id(db, store_id, alert["shelf"])

        if has_open_notification(
            db,
            store_id=store_id,
            category=SHELF_PERFORMANCE,
            shelf_id=shelf_id,
            message=message,
        ):
            continue

        created.append(
            create_notification(
                db,
                store_id=store_id,
                shelf_id=shelf_id,
                category=SHELF_PERFORMANCE,
                severity=alert["severity"],
                message=message,
                commit=False,
            )
        )

    if created:
        db.commit()

        for notification in created:
            db.refresh(notification)

    return created
