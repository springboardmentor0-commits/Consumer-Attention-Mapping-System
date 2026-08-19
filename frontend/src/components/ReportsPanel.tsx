"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Download, FileText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { priorityTone } from "@/lib/tone";
import {
  downloadReport,
  getStoreReport,
  type ReportFormat,
  type StoreReport,
} from "@/lib/api";

function stamp(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;

  const parsed = new Date(value);

  return Number.isNaN(parsed.valueOf()) ? fallback : parsed.toLocaleString();
}

export function ReportsPanel({
  token,
  storeId = null,
  storeName,
  title = "Reports & Export",
  description = "Download this store's attention report as PDF or CSV.",
}: {
  token: string;
  /** Reports are per store; null means no store is selected yet. */
  storeId?: number | null;
  storeName?: string;
  title?: string;
  description?: string;
}) {
  const [report, setReport] = useState<StoreReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<ReportFormat | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  const [exportFailed, setExportFailed] = useState(false);

  useEffect(() => {
    setExportMessage("");
    setExportFailed(false);

    if (!token || storeId == null) {
      setReport(null);
      setError("");
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");

    getStoreReport(storeId, token)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setReport(null);
        setError(err instanceof Error ? err.message : "Failed to load report.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, storeId]);

  async function handleExport(format: ReportFormat) {
    if (storeId == null) return;

    setExporting(format);
    setExportMessage("");
    setExportFailed(false);

    try {
      const filename = await downloadReport(storeId, format, token);
      setExportMessage(`Downloaded ${filename}`);
    } catch (err) {
      console.error(err);
      setExportFailed(true);
      setExportMessage(
        err instanceof Error ? err.message : "Export failed."
      );
    } finally {
      setExporting(null);
    }
  }

  const ready = storeId != null && report !== null;

  return (
    <Card className="mt-6 animate-fade-in p-6">
      <CardHeader
        icon={<AccentIcon icon={FileText} variant="analytics" />}
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              disabled={!ready || exporting !== null}
              title={
                ready ? undefined : "Select a single store to export a report"
              }
            >
              <Download />
              {exporting === "pdf" ? "Exporting…" : "Export PDF"}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={!ready || exporting !== null}
              title={
                ready ? undefined : "Select a single store to export a report"
              }
            >
              <Download />
              {exporting === "csv" ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        }
      />

      {storeId == null ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50 px-6">
          <p className="text-center text-sm text-ink-muted">
            Select a single store above to generate its report.
            {storeName ? "" : " Reports cover one store at a time."}
          </p>
        </div>
      ) : loading ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50">
          <p className="text-sm text-ink-muted">Building report…</p>
        </div>
      ) : error ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-critical-soft bg-critical-soft/40 px-6">
          <p className="text-center text-sm text-critical-strong">{error}</p>
        </div>
      ) : report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total shoppers", String(report.summary.total_shoppers)],
              [
                "Average dwell",
                `${report.summary.average_dwell_time.toFixed(2)} sec`,
              ],
              ["Shelf A views", String(report.summary.shelf_a_views)],
              ["Shelf B views", String(report.summary.shelf_b_views)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-line p-4"
              >
                <p className="text-xs uppercase tracking-wide text-ink-subtle">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm font-medium text-ink">Shelf performance</p>

              <ul className="mt-2 space-y-2">
                {report.zones.map((zone) => (
                  <li
                    key={zone.zone}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate text-ink-muted">
                      {zone.shelf}
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge variant={priorityTone(zone.priority)}>
                        {zone.priority}
                      </StatusBadge>
                      <span className="tabular-nums text-ink">
                        {zone.attractiveness_score}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-line p-4">
              <p className="text-sm font-medium text-ink">Shopper segments</p>

              {Object.keys(report.segments).length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">
                  No segmented sessions yet.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {Object.entries(report.segments).map(([segment, count]) => (
                    <li
                      key={segment}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-ink-muted">{segment}</span>
                      <span className="tabular-nums text-ink">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-line p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-ink-subtle" />
              <p className="text-sm font-medium text-ink">Current alerts</p>
            </div>

            {report.alerts.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                No shelves are currently in the alert band.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {report.alerts.map((alert) => (
                  <li key={alert.shelf} className="flex gap-2 text-sm">
                    <StatusBadge variant={priorityTone(alert.severity)}>
                      {alert.shelf}
                    </StatusBadge>
                    <span className="text-ink-muted">{alert.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-3 text-xs text-ink-subtle">
            {report.store.name} · {report.store.location} · Generated{" "}
            {stamp(report.generated_at, "just now")} · Analytics last processed{" "}
            {stamp(report.summary.last_processed, "never")}
          </p>
        </>
      ) : null}

      {exportMessage && (
        <p
          className={`mt-3 text-sm ${
            exportFailed ? "text-critical-strong" : "text-ink-muted"
          }`}
        >
          {exportMessage}
        </p>
      )}
    </Card>
  );
}
