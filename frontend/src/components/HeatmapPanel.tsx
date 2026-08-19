"use client";

import { useEffect, useState } from "react";
import { Flame, Upload } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/permissions";
import {
  ACCEPTED_VIDEO_TYPES,
  fetchStoreHeatmap,
  getShelves,
  processVideo,
  PROCESSING_ZONES,
  type HeatmapResult,
  type ShelfRecord,
} from "@/lib/api";

// Analytics only change when a video is processed, so the panel states when
// that last happened rather than implying a live feed.
function processedLabel(value: string | null | undefined) {
  if (!value) return "Not yet processed";

  const parsed = new Date(value);

  return Number.isNaN(parsed.valueOf())
    ? "Not yet processed"
    : `Last processed ${parsed.toLocaleString()}`;
}

export function HeatmapPanel({
  token,
  role = "",
  lastProcessed,
  storeId = null,
  onProcessed,
}: {
  token: string;
  role?: string;
  /** From the analytics summary — when the pipeline last wrote data. */
  lastProcessed?: string | null;
  /** Store the processed footage belongs to. Required to run the pipeline. */
  storeId?: number | null;
  /**
   * Called after a run writes new analytics. The surrounding dashboard fetched
   * its figures before the upload, so without this it would keep showing the
   * old numbers — reading "0 shoppers" directly beneath "4 sessions written".
   */
  onProcessed?: () => void;
}) {
  const [result, setResult] = useState<HeatmapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState("");
  const [processFailed, setProcessFailed] = useState(false);
  const [processedAt, setProcessedAt] = useState<string | null | undefined>(
    undefined
  );

  // Shelves belonging to the selected store, and which one each frame region
  // maps to. The pipeline emits regions, not shelf records, so this mapping
  // has to come from the user rather than being inferred.
  const [shelves, setShelves] = useState<ShelfRecord[]>([]);
  const [shelfMap, setShelfMap] = useState<Record<string, number>>({});

  // The clip to process. The pipeline reads a whole file and stops at its end,
  // so this is an upload-and-process flow rather than a live feed.
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Running the pipeline is operational configuration — same tier the backend
  // gates POST /api/camera/process behind.
  // Processing writes analytics rows, and every row must be attributable to a
  // store — so the button stays disabled until a specific store is selected.
  const canProcess = can(role, "cameraControls");
  const canRun = canProcess && storeId != null;

  const shownTimestamp = processedAt !== undefined ? processedAt : lastProcessed;

  async function loadHeatmap() {
    setLoading(true);
    setError(false);

    try {
      const heatmap = await fetchStoreHeatmap(token);

      setResult((previous) => {
        // Release the previous blob before replacing it.
        if (previous?.status === "ready") {
          URL.revokeObjectURL(previous.imageUrl);
        }
        return heatmap;
      });
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setError(false);

      try {
        const heatmap = await fetchStoreHeatmap(token);

        if (cancelled) {
          if (heatmap.status === "ready") {
            URL.revokeObjectURL(heatmap.imageUrl);
          }
          return;
        }

        if (heatmap.status === "ready") {
          objectUrl = heatmap.imageUrl;
        }

        setResult(heatmap);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [token]);

  useEffect(() => {
    // A mapping only makes sense for one store, so drop it when the store
    // changes rather than sending another store's shelf ids.
    setShelfMap({});
    setVideoFile(null);

    if (!token || storeId == null) {
      setShelves([]);
      return;
    }

    let cancelled = false;

    getShelves(storeId, token)
      .then((rows: ShelfRecord[]) => {
        if (!cancelled) setShelves(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setShelves([]);
      });

    return () => {
      cancelled = true;
    };
  }, [token, storeId]);

  function setZoneShelf(region: string, value: string) {
    setShelfMap((current) => {
      const next = { ...current };

      if (value === "") {
        delete next[region];
      } else {
        next[region] = Number(value);
      }

      return next;
    });
  }

  async function handleRefresh() {
    setProcessing(true);
    setProcessMessage("");
    setProcessFailed(false);

    try {
      if (storeId == null) {
        throw new Error("Select a store before processing footage.");
      }

      if (!videoFile) {
        throw new Error("Choose a video file to process.");
      }

      const summary = await processVideo(storeId, token, {
        file: videoFile,
        shelfMap,
      });

      setProcessedAt(summary.last_processed ?? null);

      setProcessMessage(
        `Processed ${summary.frames_processed} frames · ` +
          `${summary.sessions_written} sessions written` +
          (summary.session_write_failures > 0
            ? ` · ${summary.session_write_failures} failed to save`
            : "")
      );

      setVideoFile(null);

      await loadHeatmap();

      // Let the dashboard refetch now that this store has new analytics.
      onProcessed?.();
    } catch (err) {
      console.error(err);
      setProcessFailed(true);
      setProcessMessage(
        err instanceof Error ? err.message : "Processing failed."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Card className="mt-6 animate-fade-in p-6">
      <CardHeader
        icon={<AccentIcon icon={Flame} variant="behavior" />}
        title="Store Traffic Heatmap"
        description="Shopper movement hotspots from the last processed video."
        action={
          <div className="flex items-center gap-2">
            <StatusBadge variant="neutral">
              {processedLabel(shownTimestamp)}
            </StatusBadge>

            {canProcess && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={processing || !canRun || !videoFile}
                title={
                  !canRun
                    ? "Select a single store to process footage into"
                    : !videoFile
                      ? "Choose a video file first"
                      : undefined
                }
              >
                <Upload />
                {processing ? "Processing…" : "Upload & Process Video"}
              </Button>
            )}
          </div>
        }
      />

      {canRun && (
        <div className="mb-4 rounded-xl border border-line bg-surface-sunken/50 p-4">
          <label
            htmlFor="video_file"
            className="text-sm font-medium text-ink"
          >
            Video file
          </label>

          <p className="mt-1 text-xs text-ink-subtle">
            The clip is uploaded and processed once, end to end — this is not a
            live camera feed. Accepted formats: {ACCEPTED_VIDEO_TYPES}.
          </p>

          <input
            id="video_file"
            type="file"
            accept={ACCEPTED_VIDEO_TYPES}
            disabled={processing}
            onChange={(event) =>
              setVideoFile(event.target.files?.[0] ?? null)
            }
            className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none file:mr-3 file:rounded-md file:border-0 file:bg-surface-sunken file:px-3 file:py-1.5 file:text-sm file:text-ink-muted focus:border-analytics-base disabled:cursor-not-allowed disabled:bg-surface-sunken"
          />

          {videoFile && (
            <p className="mt-2 text-xs text-ink-muted">
              Selected: {videoFile.name} (
              {(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}

          <p className="mt-4 text-sm font-medium text-ink">Shelf mapping</p>

          <p className="mt-1 text-xs text-ink-subtle">
            The pipeline detects frame regions, not shelf records. Choose which
            shelf each region belongs to so sessions are filed correctly.
            Regions left unmapped are still recorded, just without a shelf.
          </p>

          {shelves.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              This store has no shelves yet — add one to map regions to it.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {PROCESSING_ZONES.map((zone) => (
                <div key={zone.region}>
                  <label
                    htmlFor={`zone_${zone.region}`}
                    className="text-xs font-medium text-ink-muted"
                  >
                    {zone.label}
                  </label>

                  <select
                    id={`zone_${zone.region}`}
                    value={shelfMap[zone.region] ?? ""}
                    onChange={(event) =>
                      setZoneShelf(zone.region, event.target.value)
                    }
                    disabled={processing}
                    className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-analytics-base disabled:cursor-not-allowed disabled:bg-surface-sunken"
                  >
                    <option value="">Not mapped</option>

                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.shelf_name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {processMessage && (
        <p
          className={`mb-4 text-sm ${
            processFailed ? "text-critical-strong" : "text-ink-muted"
          }`}
        >
          {processMessage}
        </p>
      )}

      {loading ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50">
          <p className="text-sm text-ink-muted">Loading heatmap…</p>
        </div>
      ) : error ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-critical-soft bg-critical-soft/40 px-6">
          <p className="text-center text-sm text-critical-strong">
            Failed to load heatmap.
          </p>
        </div>
      ) : result?.status === "pending" ? (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50 px-6">
          <p className="text-center text-sm text-ink-muted">
            {result.message}
          </p>
        </div>
      ) : result?.status === "ready" ? (
        <figure className="overflow-hidden rounded-xl border border-line bg-surface-sunken">
          <div className="flex justify-center p-3">
            {/* w-auto/max-w-full preserve the source aspect ratio and stop the
                backend-generated image being upscaled on wide screens. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.imageUrl}
              alt="Store traffic heatmap showing shopper movement hotspots"
              className="h-auto max-h-[480px] w-auto max-w-full rounded-lg object-contain"
            />
          </div>

          <figcaption className="border-t border-line px-4 py-2.5 text-xs text-ink-subtle">
            Warmer areas mark where shoppers dwelled longest.
          </figcaption>
        </figure>
      ) : null}
    </Card>
  );
}
