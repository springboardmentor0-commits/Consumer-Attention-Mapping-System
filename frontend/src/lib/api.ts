const API_BASE_URL = "http://127.0.0.1:8000";

export async function registerUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return response.json();
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  console.log("Status:", response.status);

  const data = await response.json();

  console.log("Backend Response:", data);

  return data;
}

export async function createStore(
  name: string,
  location: string,
  token: string
) {
  const response = await fetch(`${API_BASE_URL}/api/stores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      location,
    }),
  });

  return response.json();
}

export async function createShelf(
  storeId: number,
  shelfName: string,
  zoneCoordinates: string,
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/stores/${storeId}/shelves`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shelf_name: shelfName,
        zone_coordinates: zoneCoordinates,
      }),
    }
  );

  return response.json();
}

export async function getStores(token: string) {
  const response = await fetch(`${API_BASE_URL}/api/stores`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Stores request failed (${response.status})`);
  }

  return response.json();
}
export async function getShelves(storeId: number, token: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/stores/${storeId}/shelves`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Returning an unchecked body here meant a 403/404 was stored as the shelf
  // list, and the first array operation on it took down the whole page.
  if (!response.ok) {
    throw new Error(`Shelves request failed (${response.status})`);
  }

  return response.json();
}
export async function updateStore(
  id: number,
  name: string,
  location: string,
  token: string
) {
  const response = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      location,
    }),
  });

  return response.json();
}

export async function deleteStore(
  id: number,
  token: string
) {
  const response = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  // Previously the response was returned unchecked, so a refusal (a store
  // that still has shelves or analytics) looked identical to success: the
  // list simply reloaded unchanged and the user saw nothing happen.
  if (!response.ok) {
    throw new Error(
      typeof body?.detail === "string"
        ? body.detail
        : `Could not delete store (${response.status})`
    );
  }

  return body;
}

export async function updateShelf(
  id: number,
  shelfName: string,
  zoneCoordinates: string,
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/stores/shelves/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shelf_name: shelfName,
        zone_coordinates: zoneCoordinates,
      }),
    }
  );

  return response.json();
}

export async function deleteShelf(
  id: number,
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/stores/shelves/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// -------------------- Analytics (Milestone 2) --------------------

// Analytics rows carry a store, so most reads can be scoped to one. Passing
// null means "every store", which is also what surfaces sessions recorded
// before analytics carried a store id.
export type ShelfRecord = {
  id: number;
  shelf_name: string;
  zone_coordinates: string;
  store_id: number | null;
};

export type AnalyticsScope = {
  storeId?: number | null;
  shelfId?: number | null;
};

function scopeQuery(scope: AnalyticsScope = {}): string {
  const params = new URLSearchParams();

  if (scope.storeId != null) params.set("store_id", String(scope.storeId));
  if (scope.shelfId != null) params.set("shelf_id", String(scope.shelfId));

  const query = params.toString();

  return query ? `?${query}` : "";
}

export type AnalyticsSummary = {
  total_shoppers: number;
  average_dwell_time: number;
  // When the pipeline last wrote analytics. Null until a video is processed.
  last_processed?: string | null;
  // Stored/served under the original keys — see get_summary() in
  // backend/app/crud/analytics.py. The UI labels them Shelf A / Shelf B.
  left_display_views: number;
  right_display_views: number;
};

// Zone values the vision pipeline persists — these must match LEFT_ZONE /
// RIGHT_ZONE in backend/app/services/vision/shelf_mapper.py, since they are
// what the analytics rows are filtered by.
export const LEFT_ZONE = "Left Display";
export const RIGHT_ZONE = "Right Display";

export const SHELF_ZONES = [LEFT_ZONE, RIGHT_ZONE];

// Stored zone value mapped to the label shown in the UI. The stored values
// are unchanged; only the labels differ.
const ZONE_LABELS: Record<string, string> = {
  [LEFT_ZONE]: "Shelf A",
  [RIGHT_ZONE]: "Shelf B",
};

export const WALKING_AISLE_LABEL = "Walking Aisle";

// The centre band is stored as "Unknown" because shelf_mapper leaves it
// unmapped — see regionLabel below.
export const AISLE_REGION = "Unknown";

// The three regions the pipeline can write, paired with what users see. These
// are the keys a shelf_map is built from, so they must stay the stored values.
export const PROCESSING_ZONES: { region: string; label: string }[] = [
  { region: LEFT_ZONE, label: "Shelf A" },
  { region: AISLE_REGION, label: WALKING_AISLE_LABEL },
  { region: RIGHT_ZONE, label: "Shelf B" },
];

// Labels a zone value. Anything unrecognised ("No attention", "Unknown") is
// passed through so focus values keep their original meaning.
export function zoneLabel(value: string): string {
  return ZONE_LABELS[value] ?? value;
}

// A session whose region never resolved to a shelf zone stayed in the centre
// band of the frame, which shelf_mapper leaves unmapped on purpose — that is
// the walking aisle, not an unknown location.
export function regionLabel(region: string): string {
  return region === "Unknown" ? WALKING_AISLE_LABEL : zoneLabel(region);
}

export type AnalyticsSession = {
  id: number;
  shopper_id: number;
  region: string;
  focus: string;
  dwell_time: number;
  path_length: number;
  shelf_visits: number;
  gaze_shifts: number;
  segment: string | null;
  entry_time: string;
  exit_time: string;
  timestamp: string;
};

export async function getAnalyticsSummary(
  token: string,
  scope: AnalyticsScope = {}
): Promise<AnalyticsSummary> {
  const response = await fetch(
    `${API_BASE_URL}/analytics/summary${scopeQuery(scope)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Analytics summary request failed (${response.status})`);
  }

  return response.json();
}

export async function getAnalytics(
  token: string,
  scope: AnalyticsScope = {}
): Promise<AnalyticsSession[]> {
  const response = await fetch(
    `${API_BASE_URL}/analytics/${scopeQuery(scope)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Analytics request failed (${response.status})`);
  }

  return response.json();
}

// -------------------- Heatmaps (Milestone 3) --------------------

// GET /heatmaps/store returns either a JPEG (FileResponse) or a JSON
// body {"message": "..."} when the heatmap file has not been generated yet,
// so the content type is what tells the two cases apart.
export type HeatmapResult =
  | { status: "ready"; imageUrl: string }
  | { status: "pending"; message: string };

export async function fetchStoreHeatmap(
  token: string
): Promise<HeatmapResult> {
  // Timestamp defeats the browser cache so a regenerated heatmap is picked up.
  const response = await fetch(
    `${API_BASE_URL}/heatmaps/store?t=${Date.now()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Heatmap request failed (${response.status})`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    const body: { message?: string } = await response.json();

    return {
      status: "pending",
      message: body.message ?? "Heatmap has not been generated yet.",
    };
  }

  const blob = await response.blob();

  return {
    status: "ready",
    imageUrl: URL.createObjectURL(blob),
  };
}

// -------------------- Product intelligence (Milestone 3) --------------------

// The five inputs the backend scoring formula consumes. Always fully resolved
// to numbers by the time the backend answers, whatever their source was.
export type ScoringMetrics = {
  attention_duration: number;
  interaction_frequency: number;
  pickup_rate: number;
  conversion_rate: number;
  repeat_engagement: number;
};

// Where the backend took each input from. "analytics" = measured by the
// vision pipeline, "generated" = derived from attention duration by the
// scoring engine, "unavailable" = no analytics recorded yet.
export type MetricSource =
  | "analytics"
  | "generated"
  | "manual"
  | "unavailable";

// Request body for POST /attractiveness/score. Scoring is fully automatic, so
// only the product and its shelf are sent — every metric is resolved server
// side. The endpoint still accepts metric fields from older clients.
export type ProductMetrics = {
  product_name: string;
  zone: string | null;
  // Scopes the score to one store's analytics. Null pools every store.
  store_id?: number | null;
  shelf_id?: number | null;
};

export type AttractivenessResponse = {
  product_name: string;
  attractiveness_score: number;
  // Optional, matching the backend defaults, so the two fields above stay
  // sufficient on their own.
  metrics_used?: ScoringMetrics | null;
  metric_sources?: Record<string, MetricSource> | null;
  zone?: string | null;
  store_id?: number | null;
  analytics_sessions?: number | null;
  // When the pipeline last recorded a session for this zone.
  analytics_updated_at?: string | null;
};

// Shape returned by POST /recommendations/ — see generate_product_recommendation
// in backend/app/services/recommendations.py.
export type RecommendationResponse = {
  product: string;
  shelf: string;
  score: number;
  priority: string;
  recommendations: string[];
};

export async function calculateAttractiveness(
  metrics: ProductMetrics,
  token: string
): Promise<AttractivenessResponse> {
  const response = await fetch(`${API_BASE_URL}/attractiveness/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(metrics),
  });

  if (!response.ok) {
    throw new Error(`Attractiveness request failed (${response.status})`);
  }

  return response.json();
}

// Recommendations key off shelf, product and score only — the individual
// metrics are internal to the scoring engine now.
export async function getRecommendation(
  productName: string,
  shelfZone: string | null,
  attractivenessScore: number,
  token: string,
  scope: AnalyticsScope = {}
): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/recommendations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product_name: productName,
      shelf_zone: shelfZone,
      attractiveness_score: attractivenessScore,
      store_id: scope.storeId ?? null,
      shelf_id: scope.shelfId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Recommendation request failed (${response.status})`);
  }

  return response.json();
}
// -------------------- Camera pipeline --------------------

// Result of POST /api/camera/process. The pipeline is an on-demand trigger,
// not a live stream: it processes one source to completion and returns what
// it wrote.
export type ProcessVideoResult = {
  status: string;
  source: string;
  frames_processed: number;
  sessions_written: number;
  session_write_failures: number;
  store_id?: number | null;
  uploaded?: boolean;
  heatmap_generated: boolean;
  segmentation_ran: boolean;
  duration_seconds: number;
  last_processed?: string | null;
};

// Video formats the backend accepts — mirrors ALLOWED_EXTENSIONS in
// backend/app/api/camera.py.
export const ACCEPTED_VIDEO_TYPES = ".mp4,.avi,.mov,.mkv,.webm";

/**
 * Upload a video for one store and process it.
 *
 * This is on-demand batch processing, not a live stream: the whole clip is
 * processed, then analytics for that store are refreshed. Sent as multipart so
 * the file travels with the store id and shelf mapping in one request.
 *
 * Passing no file falls back to a video already staged on the server.
 */
export async function processVideo(
  storeId: number,
  token: string,
  options: {
    file?: File | null;
    source?: string;
    shelfMap?: Record<string, number>;
    maxSeconds?: number;
  } = {}
): Promise<ProcessVideoResult> {
  const form = new FormData();

  form.append("store_id", String(storeId));

  if (options.file) {
    form.append("file", options.file);
  } else if (options.source) {
    form.append("source", options.source);
  }

  if (options.shelfMap && Object.keys(options.shelfMap).length > 0) {
    form.append("shelf_map", JSON.stringify(options.shelfMap));
  }

  if (options.maxSeconds != null) {
    form.append("max_seconds", String(options.maxSeconds));
  }

  const response = await fetch(`${API_BASE_URL}/api/camera/process`, {
    method: "POST",
    // No Content-Type header: the browser sets the multipart boundary itself.
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof body?.detail === "string"
        ? body.detail
        : `Processing failed (${response.status})`
    );
  }

  return body;
}

// -------------------- Reports & Export (Milestone 4) --------------------

export type ReportZone = {
  zone: string;
  shelf: string;
  attractiveness_score: number;
  priority: string;
  recommendations: string[];
  sessions: number;
  average_dwell_seconds: number;
  last_updated?: string | null;
  metrics_used: ScoringMetrics;
  metric_sources: Record<string, MetricSource>;
};

// Derived from the recommendation engine's High-priority band — the project
// has no dedicated alerting system yet.
export type ReportAlert = {
  shelf: string;
  severity: string;
  attractiveness_score: number;
  message: string;
};

export type StoreReport = {
  store: { id: number; name: string; location: string };
  shelf_id: number | null;
  summary: {
    total_shoppers: number;
    average_dwell_time: number;
    shelf_a_views: number;
    shelf_b_views: number;
    last_processed?: string | null;
  };
  zones: ReportZone[];
  segments: Record<string, number>;
  alerts: ReportAlert[];
  generated_at: string;
};

export type ReportFormat = "pdf" | "csv";

function reportQuery(storeId: number, shelfId?: number | null): string {
  const params = new URLSearchParams({ store_id: String(storeId) });

  if (shelfId != null) params.set("shelf_id", String(shelfId));

  return params.toString();
}

export async function getStoreReport(
  storeId: number,
  token: string,
  shelfId?: number | null
): Promise<StoreReport> {
  const response = await fetch(
    `${API_BASE_URL}/reports/?${reportQuery(storeId, shelfId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof body?.detail === "string"
        ? body.detail
        : `Report request failed (${response.status})`
    );
  }

  return body;
}

/**
 * Download an export.
 *
 * The endpoints need a JWT, so the file cannot be fetched by pointing a link
 * at the URL — it is fetched with the usual auth header and handed to the
 * browser as a blob instead.
 */
export async function downloadReport(
  storeId: number,
  format: ReportFormat,
  token: string,
  shelfId?: number | null
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/reports/${format}?${reportQuery(storeId, shelfId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let detail = `Export failed (${response.status})`;

    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // Non-JSON error body; keep the status-based message.
    }

    throw new Error(detail);
  }

  // Prefer the filename the backend set in Content-Disposition.
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `store_${storeId}_report.${format}`;

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Revoke on the next tick so the click has started the download.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return filename;
}

// -------------------- Notifications (Milestone 4) --------------------

// Persisted alert-worthy findings. These are the High-priority band the
// recommendation engine already produces, written down when analytics change
// so there is a history rather than only a current state.
export type Notification = {
  id: number;
  store_id: number;
  shelf_id: number | null;
  category: string;
  severity: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

export type NotificationList = {
  store_id: number | null;
  unread_count: number;
  notifications: Notification[];
};

function notificationQuery(storeId?: number | null, unreadOnly = false): string {
  const params = new URLSearchParams();

  if (storeId != null) params.set("store_id", String(storeId));
  if (unreadOnly) params.set("unread_only", "true");

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function getNotifications(
  token: string,
  storeId?: number | null
): Promise<NotificationList> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationQuery(storeId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Notifications request failed (${response.status})`);
  }

  return response.json();
}

export async function getUnreadCount(
  token: string,
  storeId?: number | null
): Promise<number> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/unread-count${notificationQuery(storeId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Unread count request failed (${response.status})`);
  }

  const body: { unread_count: number } = await response.json();

  return body.unread_count;
}

export async function markNotificationRead(
  id: number,
  token: string
): Promise<Notification> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${id}/read`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Could not mark notification read (${response.status})`);
  }

  return response.json();
}

export async function markAllNotificationsRead(
  token: string,
  storeId?: number | null
): Promise<number> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/read-all${notificationQuery(storeId)}`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Could not mark notifications read (${response.status})`);
  }

  const body: { unread_count: number } = await response.json();

  return body.unread_count;
}
