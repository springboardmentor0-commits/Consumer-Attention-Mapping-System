from dataclasses import dataclass
from typing import Dict, List, Optional
import time

from app.ai.tracker import TrackedPerson


@dataclass
class DwellRecord:
    """
    Represents one shopper dwell session.
    """

    track_id: int

    entry_time: float

    last_seen: float

    exit_time: Optional[float] = None

    dwell_time: float = 0.0

    active: bool = True

    @property
    def person_id(self) -> int:
        """Compatibility alias for older code expecting `person_id`."""
        return self.track_id


class DwellTimeManager:
    """
    Shopper Dwell Time Analytics Engine.

    Responsibilities
    ----------------
    • Detect shopper entry
    • Update dwell time
    • Detect shopper exit
    • Maintain completed sessions
    • Export sessions for database storage
    """

    # --------------------------------------------------
    # Grace period before declaring a shopper exited.
    # Prevents false exits caused by temporary
    # missed detections.
    # --------------------------------------------------

    EXIT_TIMEOUT = 1.0  # seconds

    def __init__(self):

        print("\n========================================")
        print("Initializing Dwell Time Manager")
        print("========================================")

        self.active_sessions: Dict[int, DwellRecord] = {}

        self.completed_sessions: List[DwellRecord] = []

        print(f"Exit Timeout : {self.EXIT_TIMEOUT}s")
        print("Status       : READY")
        print("========================================\n")

    # ==========================================================
    # Core Analytics
    # ==========================================================

    def update(
        self,
        tracked_people: List[TrackedPerson],
    ) -> None:

        current_time = time.time()

        visible_ids = {
            person.track_id
            for person in tracked_people
        }

        # --------------------------------------------------
        # Update/Create Active Sessions
        # --------------------------------------------------

        for person in tracked_people:

            track_id = person.track_id

            if track_id not in self.active_sessions:

                self.active_sessions[track_id] = DwellRecord(
                    track_id=track_id,
                    entry_time=current_time,
                    last_seen=current_time,
                )

            session = self.active_sessions[track_id]

            session.last_seen = current_time

            session.dwell_time = (
                current_time
                - session.entry_time
            )

        # --------------------------------------------------
        # Close Expired Sessions
        # --------------------------------------------------

        completed_tracks = []

        for track_id, session in list(
            self.active_sessions.items()
        ):

            # Shopper still visible
            if track_id in visible_ids:
                continue

            # Shopper disappeared briefly
            missing_time = (
                current_time
                - session.last_seen
            )

            if missing_time < self.EXIT_TIMEOUT:
                continue

            # Shopper has truly exited

            session.exit_time = session.last_seen

            session.dwell_time = (
                session.exit_time
                - session.entry_time
            )

            session.active = False

            self.completed_sessions.append(session)

            completed_tracks.append(track_id)

        for track_id in completed_tracks:
            del self.active_sessions[track_id]

    # ==========================================================
    # Query Methods
    # ==========================================================

    def get_dwell_time(
        self,
        track_id: int,
    ) -> float:

        session = self.active_sessions.get(track_id)

        if session is None:
            return 0.0

        return session.dwell_time

    def get_active_records(self) -> List[DwellRecord]:

        return list(self.active_sessions.values())

    def get_completed_sessions(self) -> List[DwellRecord]:

        return self.completed_sessions

    def clear_completed_sessions(self):

        self.completed_sessions.clear()

    # ==========================================================
    # Database Export
    # ==========================================================

    def export_completed_sessions(self):

        return [

            {

                "track_id": session.track_id,

                "entry_time": session.entry_time,

                "exit_time": session.exit_time,

                "dwell_time": session.dwell_time,

            }

            for session in self.completed_sessions

        ]

    # ==========================================================
    # Reporting
    # ==========================================================

    def print_summary(self):

        print("\n========== ACTIVE SESSIONS ==========")

        if not self.active_sessions:

            print("No active shoppers.")

        else:

            for session in self.active_sessions.values():

                print(

                    f"ID {session.track_id:<4}"

                    f"Dwell : {session.dwell_time:.2f}s"

                )

        print("=====================================\n")

    def print_completed_sessions(self):

        if not self.completed_sessions:
            return

        print("\n========== COMPLETED SESSIONS ==========")

        for session in self.completed_sessions:

            print(

                f"Track ID : {session.track_id}\n"

                f"Entry    : {session.entry_time:.2f}\n"

                f"Exit     : {session.exit_time:.2f}\n"

                f"Dwell    : {session.dwell_time:.2f}s\n"

                "----------------------------------------"

            )

        print("========================================\n")

        # ==========================================================
    # Statistics
    # ==========================================================

    @property
    def active_count(self) -> int:
        """
        Number of currently active shopper sessions.
        """
        return len(self.active_sessions)

    @property
    def completed_count(self) -> int:
        """
        Number of completed shopper sessions.
        """
        return len(self.completed_sessions)

    def total_active_sessions(self) -> int:
        """
        Backward-compatible method.
        """
        return self.active_count

    def total_completed_sessions(self) -> int:
        """
        Backward-compatible method.
        """
        return self.completed_count