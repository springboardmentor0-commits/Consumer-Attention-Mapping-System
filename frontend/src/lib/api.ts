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

  return response.json();
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

export type AnalyticsSummary = {
  total_shoppers: number;
  average_dwell_time: number;
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
  token: string
): Promise<AnalyticsSummary> {
  const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getAnalytics(
  token: string
): Promise<AnalyticsSession[]> {
  const response = await fetch(`${API_BASE_URL}/analytics/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
};

export type AttractivenessResponse = {
  product_name: string;
  attractiveness_score: number;
  // Optional, matching the backend defaults, so the two fields above stay
  // sufficient on their own.
  metrics_used?: ScoringMetrics | null;
  metric_sources?: Record<string, MetricSource> | null;
  zone?: string | null;
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
  token: string
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
    }),
  });

  if (!response.ok) {
    throw new Error(`Recommendation request failed (${response.status})`);
  }

  return response.json();
}