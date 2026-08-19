"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getStores,
  getShelves,
  getAnalyticsSummary,
  getAnalytics,
  regionLabel,
  zoneLabel,
  type AnalyticsSession,
  type AnalyticsSummary,
} from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccentIcon } from "@/components/ui/AccentIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RoleBadge } from "@/components/RoleBadge";
import { can, roleLabel } from "@/lib/permissions";
import {
  dashboardConfig,
  hasSection,
  type SectionKey,
} from "@/lib/dashboardConfig";
import { OverviewItem } from "@/components/OverviewItem";
import { DisplayAttentionChart } from "@/components/DisplayAttentionChart";
import { BehaviorSegments } from "@/components/BehaviorSegments";
import { HeatmapPanel } from "@/components/HeatmapPanel";
import { ProductIntelligence } from "@/components/ProductIntelligence";
import { ReportsPanel } from "@/components/ReportsPanel";
import {
  Store,
  LayoutGrid,
  ArrowRight,
  Mail,
  ShieldCheck,
  Camera,
  Users,
  Clock,
  PanelLeft,
  PanelRight,
  History,
} from "lucide-react";

type StoreRecord = {
  id: number;
  name: string;
  location: string;
};

export default function DashboardPage() {
  const [storeCount, setStoreCount] = useState(0);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  // null = every store. Defaults to that so the dashboard keeps showing
  // sessions recorded before analytics carried a store id.
  const [storeId, setStoreId] = useState<number | null>(null);
  const [shelfCount, setShelfCount] = useState<number | null>(null);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    total_shoppers: 0,
    average_dwell_time: 0,
    left_display_views: 0,
    right_display_views: 0,
    last_processed: null,
  });
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  // Bumped after a video is processed so the figures below refetch.
  const [refreshKey, setRefreshKey] = useState(0);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("role") || "");
    setEmail(localStorage.getItem("email") || "");

    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      setToken(token);

      try {
        const stores: StoreRecord[] = await getStores(token);

        if (Array.isArray(stores)) {
          setStoreCount(stores.length);
          setStores(stores);

          const shelvesPerStore = await Promise.all(
            stores.map((store) => getShelves(store.id, token).catch(() => []))
          );

          const total = shelvesPerStore.reduce(
            (sum: number, shelves) =>
              sum + (Array.isArray(shelves) ? shelves.length : 0),
            0
          );

          setShelfCount(total);
        }

        try {
          const summary = await getAnalyticsSummary(token, { storeId });

          setAnalytics({
            total_shoppers: summary?.total_shoppers ?? 0,
            average_dwell_time: summary?.average_dwell_time ?? 0,
            left_display_views: summary?.left_display_views ?? 0,
            right_display_views: summary?.right_display_views ?? 0,
            last_processed: summary?.last_processed ?? null,
          });

          const allSessions = await getAnalytics(token, { storeId });

          setSessions(Array.isArray(allSessions) ? allSessions : []);
        } catch (error) {
          console.error(error);
          setAnalyticsError(true);
        } finally {
          setAnalyticsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setAnalyticsLoading(false);
      }
    }

    loadDashboard();
  }, [storeId, refreshKey]);

  // Which panels this role sees, in what order, and how they are worded.
  // Every role reads the same endpoints and the same recommendation engine.
  const config = useMemo(() => dashboardConfig(role), [role]);

  // `sessions` holds every session so segment counts cover the full set;
  // the table below only shows the five most recent.
  const recentSessions = sessions.slice(-5).reverse();

  const show = (section: SectionKey) => hasSection(config, section);

  return (
    <>
      <PageHeader title={config.title} subtitle={config.subtitle} />

      {show("estateStats") && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Stores"
            value={storeCount}
            icon={Store}
            accent="analytics"
          />

          <StatCard
            label="Total Shelves"
            value={shelfCount === null ? "—" : shelfCount}
            icon={LayoutGrid}
            accent="behavior"
          />

          <Card className="animate-fade-in p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink-muted">Current User</p>

              <AccentIcon icon={Mail} variant="healthy" />
            </div>

            <p className="mt-3 truncate text-lg font-semibold text-ink">
              {email || "—"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RoleBadge role={role} />

              <StatusBadge variant="healthy" dot>
                Active Session
              </StatusBadge>
            </div>
          </Card>
        </div>
      )}

      {show("systemOverview") && (
        <Card className="mt-6 animate-fade-in p-6">
          <CardHeader
            icon={<AccentIcon icon={ShieldCheck} variant="analytics" />}
            title="System Overview"
            description="Platform configuration and access state."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <OverviewItem
              label="Current Role"
              value={role ? roleLabel(role) : "—"}
              icon={ShieldCheck}
              accent="analytics"
            />

            <OverviewItem
              label="Total Stores"
              value={String(storeCount)}
              icon={Store}
              accent="analytics"
            />

            <OverviewItem
              label="Total Shelves"
              value={shelfCount === null ? "Loading..." : String(shelfCount)}
              icon={LayoutGrid}
              accent="behavior"
            />

            <OverviewItem
              label="Camera Integration"
              value="Not Configured"
              icon={Camera}
              accent="warning"
              badge={<StatusBadge variant="warning">Offline</StatusBadge>}
            />

            <OverviewItem
              label="Authentication"
              value="Secure (JWT)"
              icon={ShieldCheck}
              accent="healthy"
              badge={<StatusBadge variant="healthy">Active</StatusBadge>}
            />
          </div>
        </Card>
      )}

      <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-ink">
          {config.kpiHeading}
        </h2>

        {stores.length > 0 && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="analytics_store"
              className="text-sm text-ink-muted"
            >
              Store
            </label>

            <select
              id="analytics_store"
              value={storeId ?? ""}
              onChange={(event) =>
                setStoreId(
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-analytics-base"
            >
              <option value="">All stores</option>

              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {analyticsLoading ? (
        <Card className="p-6 text-sm text-ink-muted">Loading analytics…</Card>
      ) : analyticsError ? (
        <Card className="p-6 text-sm text-critical-strong">
          Failed to load analytics data.
        </Card>
      ) : (
        <>
          {show("analyticsKpis") && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Shoppers"
                value={analytics.total_shoppers}
                icon={Users}
                accent="analytics"
              />

              <StatCard
                label="Average Dwell Time"
                value={`${analytics.average_dwell_time.toFixed(2)} sec`}
                icon={Clock}
                accent="behavior"
              />

              <StatCard
                label="Shelf A Views"
                value={analytics.left_display_views}
                icon={PanelLeft}
                accent="analytics"
              />

              <StatCard
                label="Shelf B Views"
                value={analytics.right_display_views}
                icon={PanelRight}
                accent="behavior"
              />
            </div>
          )}

          {show("shelfAttention") && (
            <div className="mt-6">
              <DisplayAttentionChart
                shelfAViews={analytics.left_display_views}
                shelfBViews={analytics.right_display_views}
              />
            </div>
          )}

          {show("heatmap") && (
            <HeatmapPanel
              token={token}
              role={role}
              lastProcessed={analytics.last_processed}
              storeId={storeId}
              onProcessed={() => setRefreshKey((key) => key + 1)}
            />
          )}

          {show("segments") && <BehaviorSegments sessions={sessions} />}

          {show("productIntelligence") && (
            <ProductIntelligence
              token={token}
              storeId={storeId}
              framing={{
                scoreTitle: config.scoreTitle,
                scoreDescription: config.scoreDescription,
                adviceTitle: config.adviceTitle,
                adviceDescription: config.adviceDescription,
                categories: config.categories,
              }}
            />
          )}

          {show("reports") && (
            <ReportsPanel
              token={token}
              storeId={storeId}
              storeName={stores.find((s) => s.id === storeId)?.name}
              title={config.reportsTitle}
              description={config.reportsDescription}
            />
          )}

          {show("recentSessions") && (
            <Card className="mt-6 animate-fade-in p-6">
              <CardHeader
                icon={<AccentIcon icon={History} variant="behavior" />}
                title={config.sessionsTitle}
                description={config.sessionsDescription}
                action={
                  sessions.length > 0 ? (
                    <StatusBadge variant="behavior">
                      {sessions.length} total
                    </StatusBadge>
                  ) : undefined
                }
              />

              {sessions.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken/50">
                  <p className="text-sm text-ink-muted">
                    No sessions recorded yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-ink-muted">
                        <th className="py-2 pr-4 font-medium">Shopper ID</th>
                        <th className="py-2 pr-4 font-medium">Dwell Time</th>
                        <th className="py-2 pr-4 font-medium">Region</th>
                        <th className="py-2 pr-4 font-medium">Focus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSessions.map((session) => (
                        <tr
                          key={session.id}
                          className="border-b border-line text-ink last:border-0"
                        >
                          <td className="py-2 pr-4 tabular-nums">
                            {session.shopper_id}
                          </td>
                          <td className="py-2 pr-4 tabular-nums">
                            {session.dwell_time.toFixed(2)} sec
                          </td>
                          <td className="py-2 pr-4">
                            {regionLabel(session.region)}
                          </td>
                          <td className="py-2 pr-4">
                            {zoneLabel(session.focus)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {show("quickLinks") && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {can(role, "viewStores") && (
            <Link href="/stores">
              <Card
                interactive
                className="group flex items-center justify-between p-6"
              >
                <div className="flex items-center gap-4">
                  <AccentIcon icon={Store} variant="analytics" size="lg" />

                  <div>
                    <p className="font-semibold text-ink">
                      {can(role, "manageStores")
                        ? "Manage Stores"
                        : "View Stores"}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {can(role, "manageStores")
                        ? "View, add and edit store locations"
                        : "Browse store locations"}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-ink-subtle transition-transform duration-200 group-hover:translate-x-1" />
              </Card>
            </Link>
          )}

          {can(role, "viewShelves") && (
            <Link href="/shelves">
              <Card
                interactive
                className="group flex items-center justify-between p-6"
              >
                <div className="flex items-center gap-4">
                  <AccentIcon icon={LayoutGrid} variant="behavior" size="lg" />

                  <div>
                    <p className="font-semibold text-ink">Manage Shelves</p>
                    <p className="text-sm text-ink-muted">
                      Configure shelf zones per store
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-ink-subtle transition-transform duration-200 group-hover:translate-x-1" />
              </Card>
            </Link>
          )}
        </div>
      )}
    </>
  );
}
