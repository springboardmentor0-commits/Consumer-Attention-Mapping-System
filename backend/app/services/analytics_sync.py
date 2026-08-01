from __future__ import annotations

import logging

from app.analytics.dwell_time import DwellTimeManager
from app.services.background_sync import BackgroundAnalyticsSync
from app.storage.models import AttentionSession

logger = logging.getLogger(__name__)


class AnalyticsSyncService:
    """
    Bridges the analytics layer with the persistence layer.
    """

    def __init__(
        self,
        background_sync: BackgroundAnalyticsSync,
        store_id: int = 1,
    )-> None:
        self._background_sync = background_sync
        self._store_id = store_id

    # ==========================================================
    # Synchronization
    # ==========================================================

    def synchronize(
        self,
        dwell_manager: DwellTimeManager,
    ) -> int:
        """
        Convert completed analytics sessions into storage
        records and queue them for persistence.

        Parameters
        ----------
        dwell_manager : DwellTimeManager

        Returns
        -------
        int
            Number of synchronized sessions.
        """

        completed_sessions = dwell_manager.get_completed_sessions()

        if not completed_sessions:
            return 0

        for session in completed_sessions:
            # Enqueue the raw DwellRecord for the background worker. The
            # BackgroundAnalyticsSync expects a DwellRecord and the storage
            # layer will convert it into a persistence model.
            self._background_sync.enqueue(session)

        synchronized = len(completed_sessions)

        dwell_manager.clear_completed_sessions()

        logger.info(
            "Queued %d completed attention session(s).",
            synchronized,
        )

        return synchronized

    def enqueue(self, session) -> None:
        """
        Enqueue a single completed dwell session for background storage persistence.
        """
        self._background_sync.enqueue(session)


    # ==========================================================
    # Status
    # ==========================================================

    def pending_jobs(self) -> int:
        """
        Return the current number of queued analytics jobs.
        """
        return self._background_sync.queue_size