from __future__ import annotations

from dataclasses import dataclass
from typing import Any

# AI Infrastructure
from app.ai.detector import PersonDetector
from app.ai.frame_processor import FrameProcessor
from app.ai.tracker import PersonTracker

# Analytics Domains
from app.analytics.domain.dwell.dwell_orchestrator import DwellOrchestrator
from app.analytics.domain.dwell.dwell_policy import DwellPolicy
from app.analytics.domain.dwell.services.dwell_service import DwellService

# Data Repositories & Services
from app.repositories.analytics_repository import AnalyticsRepository
from app.services.analytics_service import AnalyticsService

# Synchronization Services
from app.services.analytics_sync import AnalyticsSyncService
from app.services.background_sync import BackgroundAnalyticsSync

# Pipelines
from app.services.pipeline.analytics_pipeline import AnalyticsPipeline
from app.services.pipeline.display_pipeline import (
    DisplayConfig,
    DisplayPipeline,
)
from app.services.pipeline.frame_pipeline import FramePipeline
from app.services.pipeline.render_pipeline import (
    RenderConfig,
    RenderPipeline,
)


@dataclass(slots=True)
class ServiceRegistry:
    """Dependency container for CameraPipeline and application runtime."""

    performance: Any

    # AI Components
    processor: FrameProcessor
    detector: PersonDetector
    tracker: PersonTracker

    # Dwell Analytics
    dwell_policy: DwellPolicy
    dwell_service: DwellService
    dwell_orchestrator: DwellOrchestrator

    # Storage & Persistence Services
    repository: AnalyticsRepository
    storage: AnalyticsService
    background_sync: BackgroundAnalyticsSync
    analytics_sync: AnalyticsSyncService

    # Execution Pipelines
    frame_pipeline: FramePipeline
    analytics_pipeline: AnalyticsPipeline
    render_pipeline: RenderPipeline
    display_pipeline: DisplayPipeline

    # Configuration Data & Identifiers
    store_id: int = 1
    shelves_config: dict[str, Any] | list[Any] | None = None


def build_services(
    performance: Any,
    *,
    store_id: int = 1,
    shelves_config: dict[str, Any] | list[Any] | None = None,
    db: Any | None = None,
    render_config: RenderConfig | None = None,
    display_config: DisplayConfig | None = None,
) -> ServiceRegistry:
    """Factory function to instantiate and wire all application services and pipelines."""

    # Provide default fallback for shelves configuration if None is provided
    active_shelves_config = shelves_config if shelves_config is not None else {}

    # 1. AI Stack
    processor = FrameProcessor(shelves_config=active_shelves_config)
    detector = PersonDetector()
    tracker = PersonTracker()

    # 2. Dwell Analytics Domain
    dwell_policy = DwellPolicy()
    dwell_service = DwellService(policy=dwell_policy)
    dwell_orchestrator = DwellOrchestrator(dwell_service=dwell_service)

    # 3. Storage & Synchronization
    repository = AnalyticsRepository(db=db) if db is not None else AnalyticsRepository(db=None)
    storage = AnalyticsService(db=db) 
    background_sync = BackgroundAnalyticsSync(storage=storage)
    analytics_sync = AnalyticsSyncService(background_sync=background_sync)

    # 4. Processing Pipelines
    frame_pipeline = FramePipeline(
        processor=processor,
        detector=detector,
        tracker=tracker,
    )

    analytics_pipeline = AnalyticsPipeline(
        dwell_orchestrator=dwell_orchestrator,
    )

    render_pipeline = RenderPipeline(
        tracker=tracker,
        analytics=analytics_pipeline,
        config=render_config or RenderConfig(),
    )

    display_pipeline = DisplayPipeline(
        config=display_config or DisplayConfig(),
    )

    # 5. Dependency Container Assembly
    return ServiceRegistry(
        performance=performance,
        processor=processor,
        detector=detector,
        tracker=tracker,
        dwell_policy=dwell_policy,
        dwell_service=dwell_service,
        dwell_orchestrator=dwell_orchestrator,
        repository=repository,
        storage=storage,
        background_sync=background_sync,
        analytics_sync=analytics_sync,
        frame_pipeline=frame_pipeline,
        analytics_pipeline=analytics_pipeline,
        render_pipeline=render_pipeline,
        display_pipeline=display_pipeline,
        store_id=store_id,
        shelves_config=active_shelves_config,
    )