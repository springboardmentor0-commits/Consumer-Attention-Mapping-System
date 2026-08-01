"""
display_pipeline.py

Consumer Attention Mapping System

Display Pipeline

Responsibilities
----------------
- Create display window
- Show rendered frames
- Handle keyboard input
- Manage OpenCV window lifecycle

This module does NOT:
- Detect people
- Track people
- Calculate analytics
- Draw overlays
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import cv2

logger = logging.getLogger(__name__)


# ==========================================================
# Display Configuration
# ==========================================================

@dataclass(slots=True)
class DisplayConfig:
    """
    OpenCV display configuration.
    """

    window_name: str = "Consumer Attention Mapping System"

    fullscreen: bool = False

    resizable: bool = True


# ==========================================================
# Display Pipeline
# ==========================================================

class DisplayPipeline:
    """
    Handles visualization of rendered frames.
    """

    def __init__(
        self,
        config: DisplayConfig | None = None,
    ) -> None:

        self._config = config or DisplayConfig()

        self._initialize_window()

    # ======================================================
    # Window Initialization
    # ======================================================

    def _initialize_window(self) -> None:
        """
        Create the OpenCV window.
        """

        flag = (
            cv2.WINDOW_NORMAL
            if self._config.resizable
            else cv2.WINDOW_AUTOSIZE
        )

        cv2.namedWindow(
            self._config.window_name,
            flag,
        )

        if self._config.fullscreen:

            cv2.setWindowProperty(
                self._config.window_name,
                cv2.WND_PROP_FULLSCREEN,
                cv2.WINDOW_FULLSCREEN,
            )

        logger.info(
            "Display window initialized."
        )

    # ======================================================
    # Display
    # ======================================================

    def show(
        self,
        frame,
    ) -> None:
        """
        Display a rendered frame.
        """

        cv2.imshow(
            self._config.window_name,
            frame,
        )

    # ======================================================
    # Keyboard
    # ======================================================

    def poll_key(self) -> int:
        """
        Read one keyboard event.
        """

        return cv2.waitKey(1) & 0xFF

    def should_exit(self) -> bool:
        """
        Exit when 'Q' is pressed.
        """

        return self.poll_key() == ord("q")

    # ======================================================
    # Window Cleanup
    # ======================================================

    def close(self) -> None:
        """
        Destroy all OpenCV windows.
        """

        cv2.destroyAllWindows()

        logger.info(
            "Display window closed."
        )