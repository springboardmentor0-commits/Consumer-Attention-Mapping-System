from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.analytics_engine import Recommendation, ProductScore, HourlyTraffic
from app.repositories.analytics_repository import AnalyticsRepository


class AnalyticsService:
    """
    Service layer providing business logic and data aggregation 
    for store analytics endpoints and background session persistence.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.repository = AnalyticsRepository(db)

    # ------------------------------------------------------------------
    # Helper Methods
    # ------------------------------------------------------------------

    @staticmethod
    def _get_since_timestamp(hours: int) -> datetime:
        """Utility to calculate UTC timestamp based on window hours."""
        return datetime.now(timezone.utc) - timedelta(hours=hours)

    # ------------------------------------------------------------------
    # Persistence Methods (Fixes Background Worker Error)
    # ------------------------------------------------------------------

    async def save_session(self, session_data: Any) -> None:
        """
        Persists an attention session to the database.
        Required by background sync processes.
        """
        await self.repository.save_session(session_data)

    # ------------------------------------------------------------------
    # Analytics Endpoints
    # ------------------------------------------------------------------

    async def get_summary(self, store_id: int, hours: int = 24) -> Dict[str, Any]:
        """Generate executive dashboard summary metrics concurrently."""
        now = datetime.now(timezone.utc)
        since = now - timedelta(hours=hours)
        active_since = now - timedelta(minutes=2)

        # Run independent repository queries concurrently
        (
            current_visitors,
            total_visitors,
            average_dwell,
            product_scores,
            traffic,
        ) = await asyncio.gather(
            self.repository.get_current_visitors(store_id, since=active_since),
            self.repository.get_total_visitors(store_id, since=since),
            self.repository.get_average_dwell(store_id, since=since),
            self.repository.get_product_scores(store_id, since=since),
            self.repository.get_customer_flow(store_id, since=since),
        )

        top_product = product_scores[0].product_name if product_scores else None
        peak = max(traffic, key=lambda item: item.visitors, default=None)
        peak_hour = peak.hour.strftime("%Y-%m-%d %H:00") if peak else None

        return {
            "current_visitors": current_visitors,
            "total_visitors": total_visitors,
            "average_dwell_time": average_dwell,
            "top_product": top_product,
            "peak_hour": peak_hour,
        }

    async def get_product_rankings(self, store_id: int, hours: int = 24) -> List[Dict[str, Any]]:
        """Retrieve engagement scores and ranking metrics for all shelves in a store."""
        since = self._get_since_timestamp(hours)
        product_scores = await self.repository.get_product_scores(store_id, since)
        
        return [
            {
                "product": score.product_name,
                "attention_score": score.score,
                "customers": score.customers,
                "avg_dwell_seconds": score.avg_dwell_seconds,
                "score": score.score,
            }
            for score in product_scores
        ]

    async def get_heatmap(self, store_id: int, hours: int = 24) -> List[Dict[str, float]]:
        """Retrieve spatial coordinates and accumulated dwell time for rendering store heatmaps."""
        since = self._get_since_timestamp(hours)
        return await self.repository.get_heatmap_points(store_id, since=since)

    async def get_traffic(self, store_id: int, hours: int = 24) -> List[Dict[str, Any]]:
        """Retrieve hourly foot-traffic metrics."""
        since = self._get_since_timestamp(hours)
        traffic_records = await self.repository.get_customer_flow(store_id, since)
        
        return [
            {
                "hour": item.hour.strftime("%H:00"),
                "visitors": item.visitors,
            }
            for item in traffic_records
        ]

    async def get_recommendations(self, store_id: int, hours: int = 24) -> List[Dict[str, str]]:
        """Generate rule-based recommendations for store optimization."""
        since = self._get_since_timestamp(hours)
        product_scores = await self.repository.get_product_scores(store_id, since)
        return self._build_recommendations(product_scores)

    async def get_shelf_attention(self, store_id: int, hours: int = 24) -> List[Dict[str, Any]]:
        """Retrieve detailed dwell metrics per shelf."""
        since = self._get_since_timestamp(hours)
        return await self.repository.get_shelf_attention(store_id, since)

    def _build_recommendations(self, product_scores: List[ProductScore]) -> List[Dict[str, str]]:
        """Build prioritized recommendation objects from product performance scores."""
        recommendations: List[Dict[str, str]] = []

        for score in product_scores:
            if score.avg_dwell_seconds >= 30.0:
                recommendations.append({
                    "priority": "High",
                    "message": f"Promote {score.product_name} with priority placement."
                })
            elif score.customers < 10:
                recommendations.append({
                    "priority": "Medium",
                    "message": f"Move {score.product_name} to a higher traffic zone."
                })

        return recommendations