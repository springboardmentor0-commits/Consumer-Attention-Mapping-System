import api from "../services/api";

const ANALYTICS_BASE = "/analytics";

export async function fetchSummary(hours = 24) {
  const response = await api.get(`${ANALYTICS_BASE}/summary`, {
    params: { hours },
  });
  return response.data;
}

export async function fetchProductRankings(hours = 24) {
  const response = await api.get(`${ANALYTICS_BASE}/products`, {
    params: { hours },
  });
  return response.data;
}

export async function fetchHeatmap(hours = 24) {
  const response = await api.get(`${ANALYTICS_BASE}/heatmap`, {
    params: { hours },
  });
  return response.data;
}

export async function fetchTraffic(hours = 24) {
  const response = await api.get(`${ANALYTICS_BASE}/traffic`, {
    params: { hours },
  });
  return response.data;
}

export async function fetchRecommendations(hours = 24) {
  const response = await api.get(`${ANALYTICS_BASE}/recommendations`, {
    params: { hours },
  });
  return response.data;
}

export async function fetchAttentionData(hours = 24) {
  const response = await api.get(`${ANALYTICS_BASE}/attention`, {
    params: { hours },
  });
  return response.data;
}

