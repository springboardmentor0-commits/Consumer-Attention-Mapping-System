from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.models import TrackedPerson
from app.analytics.domain.dwell.dwell_models import (
    DwellRecord,
    DwellSnapshot,
)
from app.analytics.domain.dwell.dwell_policy import DwellPolicy
from app.analytics.domain.dwell.services.export_service import ExportService
from app.analytics.domain.dwell.services.session_service import SessionManager
from app.analytics.domain.dwell.services.statistics_service import StatisticsService


class DwellService:
    """Orchestrates session tracking, statistics generation, and exports for dwell analytics."""

    def __init__(self, policy: DwellPolicy | None = None) -> None:
        """Initializes the dwell service with an explicit DwellPolicy or defaults to a standard DwellPolicy."""
        self._policy = policy if policy is not None else DwellPolicy()
        self._sessions = SessionManager(self._policy)
        self._statistics = StatisticsService()
        self._exporter = ExportService()

    # =====================================================
    # Frame Processing & Async Compatibility Layer
    # =====================================================

    def update(self, tracked_people: list[TrackedPerson]) -> None:
        """Process one frame of tracked shoppers (batch model)."""
        self._sessions.update(tracked_people)

    async def update_shopper_state(
        self,
        shopper_id: int,
        store_id: int,
        shelf_id: int | None,
        current_time: datetime | None = None,
    ) -> None:
        """Async interface method expected by FrameProcessor to update individual shopper interaction states."""
        now = current_time or datetime.now(timezone.utc)

        tracked_person = TrackedPerson(
            track_id=shopper_id,
            store_id=store_id,
            shelf_id=shelf_id,
            timestamp=now,
        )
        self._sessions.update([tracked_person])

    def flush_expired_sessions(
        self,
        present_shopper_ids: set[int],
        current_time: datetime | None = None,
    ) -> list[dict[str, Any]]:
        """Flushes and returns completed dwell sessions that have timed out or left frame context."""
        now = current_time or datetime.now(timezone.utc)

        self._sessions.expire_absent_sessions(present_shopper_ids, now)

        exported_sessions = self.export_completed_sessions()
        self.clear_completed_sessions()

        return exported_sessions

    # =====================================================
    # Session Properties & Queries
    # =====================================================

    @property
    def active_count(self) -> int:
        return self._sessions.active_count

    @property
    def completed_count(self) -> int:
        return self._sessions.completed_count

    def get_dwell_time(self, track_id: int) -> float:
        return self._sessions.get_dwell_time(track_id)

    def get_active_sessions(self) -> list[DwellRecord]:
        return self._sessions.get_active_records()

    def get_completed_sessions(self) -> list[DwellRecord]:
        return self._sessions.get_completed_records()

    # =====================================================
    # Analytics & Exports
    # =====================================================

    def snapshot(self) -> DwellSnapshot:
        """Build analytics snapshot from active and completed sessions."""
        return self._statistics.build_snapshot(
            active_sessions=self.get_active_sessions(),
            completed_sessions=self.get_completed_sessions(),
        )

    def export_completed_sessions(self) -> list[dict[str, Any]]:
        """Serialize completed sessions for export."""
        return self._exporter.export_completed(self.get_completed_sessions())

    def clear_completed_sessions(self) -> None:
        """Clear completed sessions from internal state."""
        self._sessions.clear_completed()

    def reset(self) -> None:
        """Reset all state in the dwell service."""
        self._sessions.reset()


# Backward compatibility alias
DwellTimeTracker = DwellService