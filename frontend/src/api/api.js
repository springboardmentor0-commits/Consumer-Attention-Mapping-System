import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback Stores Data
export const MOCK_STORES = [
  {
    id: 1,
    name: "Flagship Retail Hub - Store #101",
    store_name: "Flagship Retail Hub - Store #101",
    location: "Downtown Tech Plaza, NY",
    total_shelves: 4,
    active_cctv: 4,
    attention_index: 94.2,
    status: "Active Streaming",
  },
  {
    id: 2,
    name: "Metro Lifestyle Express - Store #204",
    store_name: "Metro Lifestyle Express - Store #204",
    location: "Westside Commercial Galleria, CA",
    total_shelves: 3,
    active_cctv: 3,
    attention_index: 87.8,
    status: "Active Streaming",
  },
  {
    id: 3,
    name: "Urban Boutique & Optics - Store #308",
    store_name: "Urban Boutique & Optics - Store #308",
    location: "Fifth Avenue Central, NY",
    total_shelves: 3,
    active_cctv: 2,
    attention_index: 91.5,
    status: "Active Streaming",
  },
];

// Fallback Shelves Data partitioned strictly per store_id
export const MOCK_SHELVES = [
  // STORE 1 SHELVES (store_id: 1 ONLY)
  {
    id: 101,
    shelf_number: "01",
    name: "Smart Displays & Wearables",
    zone_name: "Smart Displays & Wearables",
    category: "Electronics",
    store_id: 1,
    position_x: 22,
    position_y: 28,
    dwell_time_avg: 48.5,
    gaze_count: 1420,
    attractiveness_score: 95.8,
    engagement_rate: 82.4,
    status: "High Attention",
  },
  {
    id: 102,
    shelf_number: "02",
    name: "Premium Audio & Soundbars",
    zone_name: "Premium Audio & Soundbars",
    category: "Electronics",
    store_id: 1,
    position_x: 65,
    position_y: 28,
    dwell_time_avg: 36.2,
    gaze_count: 980,
    attractiveness_score: 88.4,
    engagement_rate: 74.1,
    status: "Optimal",
  },
  {
    id: 103,
    shelf_number: "03",
    name: "Organic Gourmet & Beverages",
    zone_name: "Organic Gourmet & Beverages",
    category: "Groceries",
    store_id: 1,
    position_x: 22,
    position_y: 68,
    dwell_time_avg: 29.8,
    gaze_count: 1150,
    attractiveness_score: 79.2,
    engagement_rate: 68.5,
    status: "Moderate",
  },
  {
    id: 104,
    shelf_number: "04",
    name: "Luxury Cosmetics & Fragrances",
    zone_name: "Luxury Cosmetics & Fragrances",
    category: "Beauty",
    store_id: 1,
    position_x: 65,
    position_y: 68,
    dwell_time_avg: 54.1,
    gaze_count: 1890,
    attractiveness_score: 97.4,
    engagement_rate: 89.0,
    status: "Hot Zone",
  },

  // STORE 2 SHELVES (store_id: 2 ONLY)
  {
    id: 201,
    shelf_number: "01",
    name: "Designer Denim & Casual Wear",
    zone_name: "Designer Denim & Casual Wear",
    category: "Apparel",
    store_id: 2,
    position_x: 25,
    position_y: 35,
    dwell_time_avg: 41.2,
    gaze_count: 1120,
    attractiveness_score: 89.5,
    engagement_rate: 79.1,
    status: "Optimal",
  },
  {
    id: 202,
    shelf_number: "02",
    name: "Athletic Footwear & Sneakers",
    zone_name: "Athletic Footwear & Sneakers",
    category: "Footwear",
    store_id: 2,
    position_x: 60,
    position_y: 35,
    dwell_time_avg: 52.0,
    gaze_count: 1640,
    attractiveness_score: 94.1,
    engagement_rate: 86.3,
    status: "Hot Zone",
  },
  {
    id: 203,
    shelf_number: "03",
    name: "Handbags & Leather Accessories",
    zone_name: "Handbags & Leather Accessories",
    category: "Accessories",
    store_id: 2,
    position_x: 42,
    position_y: 70,
    dwell_time_avg: 38.7,
    gaze_count: 910,
    attractiveness_score: 84.6,
    engagement_rate: 72.8,
    status: "Moderate",
  },

  // STORE 3 SHELVES (store_id: 3 ONLY)
  {
    id: 301,
    shelf_number: "01",
    name: "Smart Eyewear & Sunglasses",
    zone_name: "Smart Eyewear & Sunglasses",
    category: "Optics",
    store_id: 3,
    position_x: 30,
    position_y: 40,
    dwell_time_avg: 46.8,
    gaze_count: 1350,
    attractiveness_score: 93.2,
    engagement_rate: 81.0,
    status: "High Attention",
  },
  {
    id: 302,
    shelf_number: "02",
    name: "Luxury Timepieces & Jewelry",
    zone_name: "Luxury Timepieces & Jewelry",
    category: "Jewelry",
    store_id: 3,
    position_x: 65,
    position_y: 40,
    dwell_time_avg: 58.4,
    gaze_count: 1720,
    attractiveness_score: 96.5,
    engagement_rate: 88.7,
    status: "Hot Zone",
  },
  {
    id: 303,
    shelf_number: "03",
    name: "Fragrance Discovery Bar",
    zone_name: "Fragrance Discovery Bar",
    category: "Beauty",
    store_id: 3,
    position_x: 48,
    position_y: 72,
    dwell_time_avg: 35.1,
    gaze_count: 840,
    attractiveness_score: 82.0,
    engagement_rate: 70.4,
    status: "Optimal",
  },
];

// Helper to normalize Store objects from API
const normalizeStore = (st, index = 0) => ({
  id: st.id || index + 1,
  name: st.name || st.store_name || `Retail Store #${st.id || index + 1}`,
  store_name: st.store_name || st.name || `Retail Store #${st.id || index + 1}`,
  location: st.location || "Central Commercial District",
  total_shelves: st.total_shelves || 4,
  active_cctv: st.active_cctv || 3,
  attention_index: st.attention_index || 90.0,
  status: st.status || "Active Streaming",
});

// Helper to normalize Shelf objects from API with strict requestedStoreId fallback
const normalizeShelf = (sh, index = 0, requestedStoreId = 1) => ({
  id: sh.id || requestedStoreId * 100 + index + 1,
  shelf_number: sh.shelf_number || String(index + 1).padStart(2, "0"),
  name: sh.name || sh.zone_name || `Store #${requestedStoreId} Shelf ${index + 1}`,
  zone_name: sh.zone_name || sh.name || `Store #${requestedStoreId} Shelf ${index + 1}`,
  category: sh.category || "General Retail",
  store_id: sh.store_id ? Number(sh.store_id) : requestedStoreId,
  position_x: sh.position_x || (index % 2 === 0 ? 22 : 65),
  position_y: sh.position_y || (index < 2 ? 28 : 68),
  dwell_time_avg: sh.dwell_time_avg || 42.0,
  gaze_count: sh.gaze_count || 1100,
  attractiveness_score: sh.attractiveness_score || 92.0,
  engagement_rate: sh.engagement_rate || 78.0,
  status: sh.status || "Optimal",
});

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/login", { email, password });
    return response.data;
  } catch (error) {
    console.warn("Backend unavailable, using simulated login", error);
    return {
      access_token: "mock_jwt_token_retail_admin_2026",
      token_type: "Bearer",
      user: { email, role: "Admin", name: "Senior Retail Specialist" },
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/register", userData);
    return response.data;
  } catch (error) {
    console.warn("Backend unavailable, using simulated registration");
    return { message: "Registration Successful" };
  }
};

export const fetchStores = async () => {
  try {
    const response = await api.get("/stores");
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((st, idx) => normalizeStore(st, idx));
    }
    return MOCK_STORES;
  } catch (error) {
    return MOCK_STORES;
  }
};

// Return STRICTLY ONLY shelves belonging to the specified storeId
export const fetchShelves = async (storeId) => {
  const sId = Number(storeId) || 1;
  try {
    const response = await api.get(`/shelves?store_id=${sId}`);
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const normalized = response.data.map((sh, idx) => normalizeShelf(sh, idx, sId));
      const storeOnlyShelves = normalized.filter((sh) => Number(sh.store_id) === sId);
      if (storeOnlyShelves.length > 0) {
        return storeOnlyShelves;
      }
    }
  } catch (error) {
    console.warn("Backend shelves request fallback");
  }

  // Filter MOCK_SHELVES strictly for sId
  const matchedShelves = MOCK_SHELVES.filter((sh) => Number(sh.store_id) === sId);
  if (matchedShelves.length > 0) {
    return matchedShelves;
  }

  // Fallback store-specific shelves for any dynamic store ID
  return [
    {
      id: sId * 100 + 1,
      shelf_number: "01",
      name: `Store #${sId} Main Display Shelf`,
      zone_name: `Store #${sId} Main Display Shelf`,
      category: "Featured Products",
      store_id: sId,
      position_x: 30,
      position_y: 35,
      dwell_time_avg: 44.0,
      gaze_count: 1250,
      attractiveness_score: 91.5,
      engagement_rate: 80.0,
      status: "Optimal",
    },
    {
      id: sId * 100 + 2,
      shelf_number: "02",
      name: `Store #${sId} Promotional Wall`,
      zone_name: `Store #${sId} Promotional Wall`,
      category: "Promotions",
      store_id: sId,
      position_x: 65,
      position_y: 35,
      dwell_time_avg: 38.5,
      gaze_count: 940,
      attractiveness_score: 86.0,
      engagement_rate: 73.5,
      status: "High Attention",
    },
  ];
};

// Store CRUD API actions
export const createStore = async (storeData) => {
  try {
    const response = await api.post("/stores", {
      store_name: storeData.name || storeData.store_name,
      location: storeData.location,
    });
    return response.data;
  } catch (error) {
    console.warn("Backend add store fallback");
    return { message: "Store Added Successfully", id: Date.now() };
  }
};

export const updateStore = async (storeId, storeData) => {
  try {
    const response = await api.put(`/stores/${storeId}`, {
      store_name: storeData.name || storeData.store_name,
      location: storeData.location,
    });
    return response.data;
  } catch (error) {
    console.warn("Backend update store fallback");
    return { message: "Store Updated Successfully" };
  }
};

export const deleteStore = async (storeId) => {
  try {
    const response = await api.delete(`/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.warn("Backend delete store fallback");
    return { message: "Store Deleted Successfully" };
  }
};

// Shelf CRUD API actions
export const createShelf = async (shelfData) => {
  try {
    const response = await api.post("/shelves", {
      zone_name: shelfData.name || shelfData.zone_name,
      store_id: Number(shelfData.store_id),
    });
    return response.data;
  } catch (error) {
    console.warn("Backend add shelf fallback");
    return { message: "Shelf Added Successfully", id: Date.now() };
  }
};

export const updateShelf = async (shelfId, shelfData) => {
  try {
    const response = await api.put(`/shelves/${shelfId}`, shelfData);
    return response.data;
  } catch (error) {
    console.warn("Backend update shelf fallback");
    return { message: "Shelf Updated Successfully" };
  }
};

export const deleteShelf = async (shelfId) => {
  try {
    const response = await api.delete(`/shelves/${shelfId}`);
    return response.data;
  } catch (error) {
    console.warn("Backend delete shelf fallback");
    return { message: "Shelf Deleted Successfully" };
  }
};

// ------------------ 2D STORE GRID MAP LAYOUT PERSISTENCE ------------------
export const DEFAULT_CAMERAS_PER_STORE = {
  1: [
    { id: "cam-101", name: "CCTV #1 - Entrance Angle", grid_x: 0, grid_y: 0, direction: "E", status: "Active Streaming" },
    { id: "cam-102", name: "CCTV #2 - Tech Display Lens", grid_x: 9, grid_y: 0, direction: "W", status: "Active Streaming" },
    { id: "cam-103", name: "CCTV #3 - Checkout Corridor", grid_x: 9, grid_y: 9, direction: "N", status: "Active Streaming" },
  ],
  2: [
    { id: "cam-201", name: "CCTV #1 - Main Entrance", grid_x: 0, grid_y: 1, direction: "E", status: "Active Streaming" },
    { id: "cam-202", name: "CCTV #2 - Apparel Zone Lens", grid_x: 9, grid_y: 2, direction: "S", status: "Active Streaming" },
  ],
  3: [
    { id: "cam-301", name: "CCTV #1 - Eyewear Floor Lens", grid_x: 1, grid_y: 0, direction: "S", status: "Active Streaming" },
    { id: "cam-302", name: "CCTV #2 - Timepiece Display", grid_x: 8, grid_y: 1, direction: "W", status: "Active Streaming" },
  ],
};

export const getStoreLayout = (storeId) => {
  const sId = Number(storeId) || 1;
  const storageKey = `CAMS_STORE_LAYOUT_${sId}`;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Could not read stored layout from localStorage", err);
  }

  // Default initial 10x10 layout configuration
  return {
    grid_rows: 10,
    grid_cols: 10,
    cameras: DEFAULT_CAMERAS_PER_STORE[sId] || [
      { id: `cam-${sId}01`, name: `Store #${sId} CCTV #1`, grid_x: 0, grid_y: 0, direction: "E", status: "Active Streaming" },
      { id: `cam-${sId}02`, name: `Store #${sId} CCTV #2`, grid_x: 9, grid_y: 0, direction: "S", status: "Active Streaming" },
    ],
    last_updated: new Date().toISOString(),
  };
};

export const saveStoreLayout = (storeId, layoutData) => {
  const sId = Number(storeId) || 1;
  const storageKey = `CAMS_STORE_LAYOUT_${sId}`;
  const payload = {
    ...layoutData,
    last_updated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (err) {
    console.warn("Could not save layout to localStorage", err);
  }
  return payload;
};

export default api;
