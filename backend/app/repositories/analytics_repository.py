from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.analytics_engine import HourlyTraffic, ProductScore
from app.models.database_models import AttentionSessionModel, ShelfModel

logger = logging.getLogger(__name__)


class AnalyticsRepository:
    """
    Async repository for handling analytics persistence and database query aggregates.
    Aligned with PostgreSQL / TimescaleDB schema (schema.sql).
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # =========================================================================
    # Write Operations (Relational + TimescaleDB Hypertable)
    # =========================================================================

    async def save_dwell_session(
        self,
        store_id: int,
        shopper_id: int,
        shelf_id: Optional[int],
        dwell_seconds: float,
        entry_time: datetime,
        exit_time: datetime,
    ) -> None:
        """
        Saves a completed shopper session to relational storage (attention_sessions) 
        and TimescaleDB hypertable (shopper_dwell_analytics) within the current transaction session.
        """
        try:
            # 1. Relational Layer (attention_sessions)
            session_record = AttentionSessionModel(
                tracker_id=shopper_id,
                store_id=store_id,
                shelf_id=shelf_id,
                entry_time=entry_time,
                exit_time=exit_time,
                dwell_time_seconds=dwell_seconds,
            )
            self.db.add(session_record)

            # 2. Analytics Layer (shopper_dwell_analytics hypertable)
            timescale_query = text(
                """
                INSERT INTO shopper_dwell_analytics (time, store_id, shelf_id, shopper_id, dwell_seconds)
                VALUES (:time_stamp, :store_id, :shelf_id, :shopper_id, :dwell_seconds)
                """
            )

            await self.db.execute(
                timescale_query,
                {
                    "time_stamp": exit_time,
                    "store_id": store_id,
                    "shelf_id": shelf_id,
                    "shopper_id": shopper_id,
                    "dwell_seconds": dwell_seconds,
                },
            )
            await self.db.flush()
        except Exception as err:
            logger.error("Failed to save dwell session for shopper %s in store %s: %s", shopper_id, store_id, err)
            raise

    # =========================================================================
    # Aggregated Read Operations
    # =========================================================================

    async def get_current_visitors(self, store_id: int, since: datetime) -> int:
        """Count distinct visitors active since a given time."""
        stmt = (
            select(func.count(func.distinct(AttentionSessionModel.tracker_id)))
            .where(
                AttentionSessionModel.store_id == store_id,
                AttentionSessionModel.exit_time >= since,
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar() or 0

    async def get_total_visitors(self, store_id: int, since: datetime) -> int:
        """Count total unique visitors entered since a given time."""
        stmt = (
            select(func.count(func.distinct(AttentionSessionModel.tracker_id)))
            .where(
                AttentionSessionModel.store_id == store_id,
                AttentionSessionModel.entry_time >= since,
            )
        )
        res = await self.db.execute(stmt)
        return res.scalar() or 0

    async def get_average_dwell(self, store_id: int, since: datetime) -> float:
        """Calculate average dwell duration in seconds."""
        stmt = (
            select(func.coalesce(func.avg(AttentionSessionModel.dwell_time_seconds), 0.0))
            .where(
                AttentionSessionModel.store_id == store_id,
                AttentionSessionModel.entry_time >= since,
            )
        )
        res = await self.db.execute(stmt)
        avg_val = res.scalar()
        return round(float(avg_val or 0.0), 1)

    async def get_product_scores(self, store_id: int, since: datetime) -> List[ProductScore]:
        """Calculates performance scores grouped by shelf name."""
        stmt = (
            select(
                ShelfModel.shelf_name,
                func.count(func.distinct(AttentionSessionModel.tracker_id)).label("customers"),
                func.coalesce(func.avg(AttentionSessionModel.dwell_time_seconds), 0.0).label("avg_dwell"),
            )
            .join(AttentionSessionModel, ShelfModel.id == AttentionSessionModel.shelf_id)
            .where(
                ShelfModel.store_id == store_id,
                AttentionSessionModel.entry_time >= since,
            )
            .group_by(ShelfModel.id, ShelfModel.shelf_name)
        )
        res = await self.db.execute(stmt)
        rows = res.all()

        scores = [
            ProductScore(
                product_name=str(r.shelf_name),
                customers=int(r.customers or 0),
                avg_dwell_seconds=round(float(r.avg_dwell or 0.0), 1),
                score=round(float(r.customers or 0) * float(r.avg_dwell or 0.0), 1),
            )
            for r in rows
        ]
        return sorted(scores, key=lambda s: s.score, reverse=True)

    async def get_heatmap_points(self, store_id: int, since: Optional[datetime] = None) -> List[Dict[str, float]]:
        """Extracts JSONB shelf zone_coordinates and accumulated dwell time for heatmaps."""
        stmt = (
            select(
                ShelfModel.zone_coordinates,
                func.coalesce(func.sum(AttentionSessionModel.dwell_time_seconds), 0.0).label("total_time"),
            )
            .join(AttentionSessionModel, ShelfModel.id == AttentionSessionModel.shelf_id, isouter=True)
            .where(ShelfModel.store_id == store_id)
        )

        if since:
            stmt = stmt.where(AttentionSessionModel.entry_time >= since)

        stmt = stmt.group_by(ShelfModel.id, ShelfModel.zone_coordinates)

        res = await self.db.execute(stmt)
        rows = res.all()

        points: List[Dict[str, float]] = []
        for row in rows:
            coords = row.zone_coordinates
            if isinstance(coords, str):
                try:
                    coords = json.loads(coords)
                except json.JSONDecodeError:
                    continue

            if not isinstance(coords, dict):
                continue

            # Parse Bounding Box vs Center Coordinates
            if "x1" in coords and "x2" in coords:
                cx = (coords.get("x1", 0.0) + coords.get("x2", 0.0)) / 2.0
            else:
                cx = coords.get("cx", coords.get("x", 0.0))

            if "y1" in coords and "y2" in coords:
                cy = (coords.get("y1", 0.0) + coords.get("y2", 0.0)) / 2.0
            else:
                cy = coords.get("cy", coords.get("y", 0.0))

            points.append({
                "x": round(float(cx), 1),
                "y": round(float(cy), 1),
                "value": round(float(row.total_time or 0.0), 1),
            })

        return points

    async def get_customer_flow(self, store_id: int, since: datetime) -> List[HourlyTraffic]:
        """Queries hourly foot-traffic metrics using PostgreSQL date_trunc or SQLite fallback."""
        dialect_name = "postgresql"
        if self.db.bind:
            dialect_name = self.db.bind.dialect.name

        if dialect_name == "sqlite":
            hour_expr = func.strftime("%Y-%m-%d %H:00:00", AttentionSessionModel.entry_time)
        else:
            hour_expr = func.date_trunc("hour", AttentionSessionModel.entry_time)

        stmt = (
            select(
                hour_expr.label("hour"),
                func.count(func.distinct(AttentionSessionModel.tracker_id)).label("visitors"),
            )
            .where(
                AttentionSessionModel.store_id == store_id,
                AttentionSessionModel.entry_time >= since,
            )
            .group_by(hour_expr)
            .order_by(hour_expr)
        )

        res = await self.db.execute(stmt)
        rows = res.all()

        results: List[HourlyTraffic] = []
        for row in rows:
            hour_val = row.hour
            if isinstance(hour_val, str):
                hour_val = datetime.strptime(hour_val, "%Y-%m-%d %H:00:00")

            results.append(
                HourlyTraffic(
                    hour=hour_val,
                    visitors=int(row.visitors or 0),
                )
            )

        return results

    async def get_shelf_attention(self, store_id: int, since: datetime) -> List[Dict[str, Any]]:
        """Queries dwell metrics per shelf for dashboard UI display."""
        stmt = (
            select(
                ShelfModel.shelf_name,
                func.coalesce(func.sum(AttentionSessionModel.dwell_time_seconds), 0.0).label("total_time"),
                func.count(func.distinct(AttentionSessionModel.tracker_id)).label("customers"),
                func.coalesce(func.avg(AttentionSessionModel.dwell_time_seconds), 0.0).label("avg_dwell"),
            )
            .join(AttentionSessionModel, ShelfModel.id == AttentionSessionModel.shelf_id, isouter=True)
            .where(
                ShelfModel.store_id == store_id,
                AttentionSessionModel.entry_time >= since,
            )
            .group_by(ShelfModel.id, ShelfModel.shelf_name)
        )
        res = await self.db.execute(stmt)
        rows = res.all()

        return [
            {
                "shelf_name": str(r.shelf_name),
                "total_dwell_seconds": round(float(r.total_time or 0.0), 1),
                "customers": int(r.customers or 0),
                "avg_dwell_seconds": round(float(r.avg_dwell or 0.0), 1),
            }
            for r in rows
        ]