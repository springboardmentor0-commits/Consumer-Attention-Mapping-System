from __future__ import annotations

import logging
from queue import Empty, Queue
from threading import Event, Thread

from app.analytics.dwell_time import DwellRecord
from app.storage.analytics_storage import AnalyticsStorageService

logger = logging.getLogger(__name__)


class BackgroundAnalyticsSync:
    """
    Background worker responsible for asynchronously
    persisting completed shopper sessions.
    """

    def __init__(
        self,
        storage: AnalyticsStorageService,
        queue_size: int = 1000,
    ) -> None:

        self._storage = storage

        self._queue: Queue[DwellRecord] = Queue(maxsize=queue_size)

        self._shutdown = Event()

        self._worker = Thread(
            target=self._run,
            daemon=True,
            name="AnalyticsSyncWorker",
        )

        self._worker.start()

        logger.info("Background analytics worker started.")

    # =====================================================
    # Public API
    # =====================================================

    def enqueue(
        self,
        session: DwellRecord,
    ) -> None:
        """
        Queue a completed shopper session.
        """

        self._queue.put(session)

        logger.debug(
            "Queued session | Track=%d | Queue=%d",
            session.track_id,
            self.queue_size,
        )

    @property
    def queue_size(self) -> int:
        """
        Current number of queued sessions.
        """
        return self._queue.qsize()

    @property
    def is_running(self) -> bool:
        """
        Whether the worker thread is running.
        """
        return self._worker.is_alive()

    # =====================================================
    # Worker
    # =====================================================

    def _run(self) -> None:
        """
        Consume queued sessions and persist them.
        """

        while not self._shutdown.is_set():

            try:
                session = self._queue.get(timeout=1)

            except Empty:
                continue

            try:
                self._storage.save_session(session)

            except Exception:
                logger.exception(
                    "Failed to persist attention session."
                )

            finally:
                self._queue.task_done()

    # =====================================================
    # Shutdown
    # =====================================================

    def wait_until_empty(self) -> None:
        """
        Wait until all queued sessions are written.
        """
        self._queue.join()

    def stop(self) -> None:
        """
        Stop the background worker gracefully.
        """

        logger.info("Stopping background analytics worker...")

        self.wait_until_empty()

        self._shutdown.set()

        self._worker.join()

        logger.info("Background analytics worker stopped.")

    # =====================================================
    # Statistics
    # =====================================================

    def status(self) -> dict[str, int | bool]:
        """
        Runtime statistics.
        """

        return {
            "running": self.is_running,
            "queue_size": self.queue_size,
        }