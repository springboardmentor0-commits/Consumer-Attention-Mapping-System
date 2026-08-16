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
  left_display_views: number;
  right_display_views: number;
};

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

export type ProductMetrics = {
  product_name: string;
  attention_duration: number;
  interaction_frequency: number;
  pickup_rate: number;
  conversion_rate: number;
  repeat_engagement: number;
};

export type AttractivenessResponse = {
  product_name: string;
  attractiveness_score: number;
};

export type RecommendationResponse = {
  product_name: string;
  attractiveness_score: number;
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

export async function getRecommendation(
  metrics: ProductMetrics,
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
      ...metrics,
      attractiveness_score: attractivenessScore,
    }),
  });

  if (!response.ok) {
    throw new Error(`Recommendation request failed (${response.status})`);
  }

  return response.json();
}