from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.notification import Notification


def scoped(query, store_id: int | None = None, unread_only: bool = False):
    """
    Restrict a notification query to one store, and optionally to unread.

    Mirrors the scoping helper in crud/analytics.py so notifications filter the
    same way every other per-store read does.
    """

    if store_id is not None:
        query = query.filter(Notification.store_id == store_id)

    if unread_only:
        query = query.filter(Notification.read_at.is_(None))

    return query


def list_notifications(
    db: Session,
    store_id: int | None = None,
    unread_only: bool = False,
    limit: int = 50,
):
    """Most recent first, newest at the top of the history panel."""

    return (
        scoped(db.query(Notification), store_id, unread_only)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(limit)
        .all()
    )


def count_unread(db: Session, store_id: int | None = None):
    return scoped(
        db.query(func.count(Notification.id)), store_id, unread_only=True
    ).scalar() or 0


def mark_read(db: Session, notification_id: int):
    """Acknowledge one notification. Returns None if it does not exist."""

    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if notification is None:
        return None

    if notification.read_at is None:
        notification.read_at = datetime.now()
        db.commit()
        db.refresh(notification)

    return notification


def mark_all_read(db: Session, store_id: int | None = None):
    """Acknowledge everything currently unread, optionally for one store."""

    unread = scoped(
        db.query(Notification), store_id, unread_only=True
    ).all()

    now = datetime.now()

    for notification in unread:
        notification.read_at = now

    db.commit()

    return len(unread)


def has_open_notification(
    db: Session,
    store_id: int,
    category: str,
    shelf_id: int | None,
    message: str,
):
    """
    True when an identical finding is already sitting unread.

    Alerts are recomputed from the current score every time analytics change,
    so without this the same standing problem would be inserted again on every
    run. Once acknowledged, the next occurrence is recorded afresh — that is
    the history the panel is for.
    """

    query = (
        db.query(Notification)
        .filter(Notification.store_id == store_id)
        .filter(Notification.category == category)
        .filter(Notification.message == message)
        .filter(Notification.read_at.is_(None))
    )

    if shelf_id is None:
        query = query.filter(Notification.shelf_id.is_(None))
    else:
        query = query.filter(Notification.shelf_id == shelf_id)

    return db.query(query.exists()).scalar()


def create_notification(
    db: Session,
    store_id: int,
    category: str,
    severity: str,
    message: str,
    shelf_id: int | None = None,
    commit: bool = True,
):
    """
    Record one finding.

    store_id is required and never defaulted: an unattributed notification
    would be invisible to every per-store view, the same failure mode the
    analytics pipeline already had.
    """

    if store_id is None:
        raise ValueError(
            "store_id is required: refusing to create a notification that no "
            "store could be attributed to."
        )

    notification = Notification(
        store_id=store_id,
        shelf_id=shelf_id,
        category=category,
        severity=severity,
        message=message,
        created_at=datetime.now(),
        read_at=None,
    )

    db.add(notification)

    if commit:
        db.commit()
        db.refresh(notification)

    return notification
