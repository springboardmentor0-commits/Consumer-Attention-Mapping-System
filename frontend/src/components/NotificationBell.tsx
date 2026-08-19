"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { priorityTone } from "@/lib/tone";
import { can } from "@/lib/permissions";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/api";

function whenLabel(value: string) {
  const parsed = new Date(value);

  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toLocaleString();
}

export function NotificationBell({
  token,
  role,
}: {
  token: string;
  role: string;
}) {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Read state is shared across users, so bulk-clearing is an operational
  // action rather than a personal one. The API enforces this too.
  const canMarkAllRead = can(role, "markAllNotificationsRead");

  async function load() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      // Not store-scoped here: the header sits above the dashboard's store
      // selector, so it reports across every store the user can see.
      const data = await getNotifications(token);
      setItems(data.notifications);
      setUnread(data.unread_count);
    } catch (err) {
      console.error(err);
      setError("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Notifications only change when a video is processed, so the count is
    // fetched on mount rather than polled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Close when clicking outside the panel.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);

    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function handleOpen() {
    const next = !open;
    setOpen(next);

    // Refresh on open so the list reflects any run since mount.
    if (next) await load();
  }

  async function handleRead(notification: Notification) {
    if (notification.read_at) return;

    // Optimistic: reflect the click immediately, reconcile from the server.
    setItems((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, read_at: new Date().toISOString() }
          : item
      )
    );
    setUnread((count) => Math.max(0, count - 1));

    try {
      await markNotificationRead(notification.id, token);
    } catch (err) {
      console.error(err);
      await load();
    }
  }

  async function handleReadAll() {
    try {
      await markAllNotificationsRead(token);
      await load();
    } catch (err) {
      console.error(err);
      setError("Could not mark all as read.");
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        aria-expanded={open}
        className="relative flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics-base/40"
      >
        <Bell className="h-4 w-4" />

        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical-base px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-line bg-surface shadow-card-hover sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>

            {unread > 0 && canMarkAllRead && (
              <button
                type="button"
                onClick={handleReadAll}
                className="text-xs font-medium text-analytics-strong hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">
                Loading…
              </p>
            ) : error ? (
              <p className="px-4 py-6 text-center text-sm text-critical-strong">
                {error}
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">
                No notifications yet. Alerts appear here after a video is
                processed.
              </p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleRead(item)}
                      className={`w-full border-b border-line px-4 py-3 text-left transition-colors duration-150 last:border-0 hover:bg-surface-sunken ${
                        item.read_at ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge variant={priorityTone(item.severity)}>
                          {item.severity}
                        </StatusBadge>

                        {!item.read_at && (
                          <span
                            aria-label="Unread"
                            className="h-2 w-2 shrink-0 rounded-full bg-critical-base"
                          />
                        )}
                      </div>

                      <p className="mt-1.5 text-sm text-ink">{item.message}</p>

                      <p className="mt-1 text-xs text-ink-subtle">
                        {whenLabel(item.created_at)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
