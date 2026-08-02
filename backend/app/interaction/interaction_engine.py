"""
Product Interaction Analysis Engine
====================================
Product pickup detection, product return detection, shelf interaction monitoring,
product engagement tracking, and product comparison analysis.
"""

import time
import math
import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from collections import defaultdict

from .interaction_models import (
    InteractionType,
    ProductRegion,
    InteractionEvent,
    ProductEngagementState,
    InteractionSummaryData,
)


def _compute_iou(boxA: Tuple[int, int, int, int], boxB: Tuple[int, int, int, int]) -> float:
    """Compute Intersection over Union (IoU) between two bounding boxes."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    if interArea == 0:
        return 0.0

    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou


# ═══════════════════════════════════════════════════════════════════
# 1. Product Pickup Detector
# ═══════════════════════════════════════════════════════════════════

class ProductPickupDetector:
    """
    Detects when a shopper's hand overlaps with a product region
    and moves away with the product.
    """
    OVERLAP_THRESHOLD = 0.15

    @classmethod
    def detect_pickup(
        cls,
        hand_bbox: Tuple[int, int, int, int],
        products: List[ProductRegion],
        state: ProductEngagementState,
    ) -> Optional[ProductRegion]:
        """Check if hand is picking up a product from the shelf."""
        if state.current_handled_product is not None:
            return None  # already holding a product

        for prod in products:
            iou = _compute_iou(hand_bbox, prod.bbox)
            if iou >= cls.OVERLAP_THRESHOLD:
                return prod
        return None


# ═══════════════════════════════════════════════════════════════════
# 2. Product Return Detector
# ═══════════════════════════════════════════════════════════════════

class ProductReturnDetector:
    """
    Detects when a shopper returns a previously picked up product
    back to a shelf zone.
    """
    RETURN_THRESHOLD = 0.20

    @classmethod
    def detect_return(
        cls,
        hand_bbox: Tuple[int, int, int, int],
        products: List[ProductRegion],
        state: ProductEngagementState,
    ) -> Optional[ProductRegion]:
        """Check if currently held product is placed back in a shelf zone."""
        if state.current_handled_product is None:
            return None

        for prod in products:
            iou = _compute_iou(hand_bbox, prod.bbox)
            if iou >= cls.RETURN_THRESHOLD:
                return prod
        return None


# ═══════════════════════════════════════════════════════════════════
# 3. Shelf Interaction Monitor
# ═══════════════════════════════════════════════════════════════════

class ShelfInteractionMonitor:
    """
    Monitors shopper interactions with shelf zones over time (hand proximity,
    touching, hovering).
    """
    def __init__(self):
        self._interaction_history: Dict[int, list] = defaultdict(list)

    def record_proximity(
        self,
        shopper_id: int,
        shelf_id: int,
        timestamp_ms: float,
        is_touching: bool,
    ):
        self._interaction_history[shelf_id].append((shopper_id, timestamp_ms, is_touching))

    def get_shelf_activity(self, shelf_id: int, window_ms: float = 5000.0) -> int:
        now = time.time() * 1000.0
        cutoff = now - window_ms
        records = [r for r in self._interaction_history[shelf_id] if r[1] >= cutoff]
        self._interaction_history[shelf_id] = records
        return len(records)


# ═══════════════════════════════════════════════════════════════════
# 4. Product Comparison Analyzer
# ═══════════════════════════════════════════════════════════════════

class ProductComparisonAnalyzer:
    """
    Detects when a shopper inspects or picks up multiple products in close
    succession (e.g. holding/handling one, then inspecting another).
    """
    COMPARISON_WINDOW_MS = 15000.0  # 15 seconds

    @classmethod
    def analyze_comparison(
        cls,
        new_product_name: str,
        state: ProductEngagementState,
        timestamp_ms: float,
    ) -> Optional[Tuple[str, str]]:
        """Return (prod_A, prod_B) if this constitutes a comparison event."""
        if not state.handled_history:
            return None

        recent_prod = state.handled_history[-1]
        if recent_prod != new_product_name:
            # Compared current product with recently handled product
            return (recent_prod, new_product_name)
        return None


# ═══════════════════════════════════════════════════════════════════
# 5. Product Engagement Tracker
# ═══════════════════════════════════════════════════════════════════

class ProductEngagementTracker:
    """
    Tracks state machine for each shopper:
    VIEWED -> PICKED_UP -> COMPARED -> RETURNED / PURCHASED
    """
    def __init__(self):
        self._states: Dict[int, ProductEngagementState] = {}
        self._events_log: List[InteractionEvent] = []

    def get_state(self, shopper_id: int) -> ProductEngagementState:
        if shopper_id not in self._states:
            self._states[shopper_id] = ProductEngagementState(shopper_id=shopper_id)
        return self._states[shopper_id]

    def process_hand(
        self,
        shopper_id: int,
        hand_bbox: Tuple[int, int, int, int],
        products: List[ProductRegion],
        timestamp_ms: float,
        action_hint: Optional[str] = None,
    ) -> List[InteractionEvent]:
        """
        Process hand observation and generate interaction events.
        action_hint can be 'purchase' to explicitly trigger purchase.
        """
        events: List[InteractionEvent] = []
        state = self.get_state(shopper_id)

        # 1. Check Return
        if state.current_handled_product is not None:
            returned_prod = ProductReturnDetector.detect_return(hand_bbox, products, state)
            if returned_prod:
                duration_held = int(timestamp_ms - (state.pickup_time_ms or timestamp_ms))
                evt = InteractionEvent(
                    timestamp_ms=timestamp_ms,
                    shopper_id=shopper_id,
                    product_id=returned_prod.product_id,
                    product_name=returned_prod.product_name,
                    shelf_id=returned_prod.shelf_id,
                    interaction_type=InteractionType.PRODUCT_RETURNED,
                    duration_ms=max(500, duration_held),
                    confidence=0.88,
                )
                events.append(evt)
                self._events_log.append(evt)

                # Reset state
                state.current_handled_product = None
                state.pickup_time_ms = None
                return events

        # 2. Check Pickup
        picked_prod = ProductPickupDetector.detect_pickup(hand_bbox, products, state)
        if picked_prod:
            # Check if this is a comparison with previous product
            comp_pair = ProductComparisonAnalyzer.analyze_comparison(
                picked_prod.product_name, state, timestamp_ms
            )

            # Pickup event
            evt_pickup = InteractionEvent(
                timestamp_ms=timestamp_ms,
                shopper_id=shopper_id,
                product_id=picked_prod.product_id,
                product_name=picked_prod.product_name,
                shelf_id=picked_prod.shelf_id,
                interaction_type=InteractionType.PRODUCT_PICKED_UP,
                duration_ms=1000,
                confidence=0.92,
            )
            events.append(evt_pickup)
            self._events_log.append(evt_pickup)

            # Update state
            state.current_handled_product = picked_prod.product_name
            state.handled_shelf_id = picked_prod.shelf_id
            state.pickup_time_ms = timestamp_ms
            state.handled_history.append(picked_prod.product_name)

            # If comparison detected
            if comp_pair:
                evt_comp = InteractionEvent(
                    timestamp_ms=timestamp_ms,
                    shopper_id=shopper_id,
                    product_id=picked_prod.product_id,
                    product_name=picked_prod.product_name,
                    shelf_id=picked_prod.shelf_id,
                    interaction_type=InteractionType.PRODUCT_COMPARED,
                    duration_ms=1500,
                    confidence=0.85,
                    compared_with=comp_pair[0],
                )
                events.append(evt_comp)
                self._events_log.append(evt_comp)

            return events

        # 3. View detection (if hand is hovering near product region)
        for prod in products:
            iou = _compute_iou(hand_bbox, prod.bbox)
            if iou > 0.05:
                evt_view = InteractionEvent(
                    timestamp_ms=timestamp_ms,
                    shopper_id=shopper_id,
                    product_id=prod.product_id,
                    product_name=prod.product_name,
                    shelf_id=prod.shelf_id,
                    interaction_type=InteractionType.PRODUCT_VIEWED,
                    duration_ms=300,
                    confidence=0.80,
                )
                events.append(evt_view)
                self._events_log.append(evt_view)
                break

        return events

    def trigger_purchase(
        self,
        shopper_id: int,
        product_name: str,
        shelf_id: int,
        timestamp_ms: float,
    ) -> InteractionEvent:
        """Trigger an explicit PRODUCT_PURCHASED event."""
        state = self.get_state(shopper_id)
        evt = InteractionEvent(
            timestamp_ms=timestamp_ms,
            shopper_id=shopper_id,
            product_name=product_name,
            shelf_id=shelf_id,
            interaction_type=InteractionType.PRODUCT_PURCHASED,
            duration_ms=2000,
            confidence=0.95,
        )
        self._events_log.append(evt)
        state.current_handled_product = None
        return evt

    def get_summary(self) -> InteractionSummaryData:
        total = len(self._events_log)
        viewed = sum(1 for e in self._events_log if e.interaction_type == InteractionType.PRODUCT_VIEWED)
        picked = sum(1 for e in self._events_log if e.interaction_type == InteractionType.PRODUCT_PICKED_UP)
        returned = sum(1 for e in self._events_log if e.interaction_type == InteractionType.PRODUCT_RETURNED)
        purchased = sum(1 for e in self._events_log if e.interaction_type == InteractionType.PRODUCT_PURCHASED)
        compared = sum(1 for e in self._events_log if e.interaction_type == InteractionType.PRODUCT_COMPARED)

        conv_rate = (purchased / max(1, picked)) * 100.0
        ret_rate = (returned / max(1, picked)) * 100.0

        return InteractionSummaryData(
            total_interactions=total,
            total_viewed=viewed,
            total_picked_up=picked,
            total_returned=returned,
            total_purchased=purchased,
            total_compared=compared,
            conversion_rate=round(conv_rate, 1),
            return_rate=round(ret_rate, 1),
        )


# Global instance
_tracker = ProductEngagementTracker()
_shelf_monitor = ShelfInteractionMonitor()


def process_interaction_frame(
    frame: np.ndarray,
    hand_boxes: Optional[List[Tuple[int, int, int, int]]] = None,
    product_regions: Optional[List[ProductRegion]] = None,
    timestamp_ms: Optional[float] = None,
) -> List[InteractionEvent]:
    """
    Main orchestrator for single frame product interaction analysis.
    """
    if timestamp_ms is None:
        timestamp_ms = time.time() * 1000.0

    if hand_boxes is None:
        hand_boxes = []

    if product_regions is None:
        # Default demo products if none provided
        h, w = frame.shape[:2]
        product_regions = [
            ProductRegion("P001", "Organic Milk 1L", 1, (int(w * 0.1), int(h * 0.2), int(w * 0.35), int(h * 0.6))),
            ProductRegion("P002", "Greek Yogurt 500g", 1, (int(w * 0.4), int(h * 0.2), int(w * 0.65), int(h * 0.6))),
            ProductRegion("P003", "Cheddar Cheese 200g", 2, (int(w * 0.7), int(h * 0.2), int(w * 0.9), int(h * 0.6))),
        ]

    events: List[InteractionEvent] = []

    for idx, hand_box in enumerate(hand_boxes):
        hand_events = _tracker.process_hand(
            shopper_id=idx,
            hand_bbox=hand_box,
            products=product_regions,
            timestamp_ms=timestamp_ms,
        )
        events.extend(hand_events)

    return events


def get_interaction_summary() -> InteractionSummaryData:
    return _tracker.get_summary()
