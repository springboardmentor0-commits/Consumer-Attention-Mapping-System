// TypeScript interfaces matching the CAMS API contract exactly

export type UserRole =
  | "super_admin"
  | "store_manager"
  | "retail_analyst"
  | "marketing_manager";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface Zone {
  zone_id: number | string;
  name: string;
  coordinates: number[][];
}

export interface Store {
  layout_id: string;
  name: string;
  zones: Zone[];
}

export interface Shelf {
  id: string;
  store_id: string;
  zone_id?: string | null;
  name: string;
  aisle_number: string;
  shelf_level: number;
  coordinates: Record<string, number>;
  width_cm: number;
  height_cm: number;
  product_categories: string[];
  planogram_url?: string | null;
  created_at: string;
}

export interface Camera {
  id: string;
  store_id: string;
  zone_id?: string | null;
  shelf_id?: string | null;
  name: string;
  camera_type: string;
  rtsp_url: string;
  ip_address: string;
  location_description?: string | null;
  mount_height_cm?: number | null;
  field_of_view_degrees?: number | null;
  resolution: string;
  fps: number;
  status: "active" | "inactive" | "maintenance" | "error";
  last_heartbeat?: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  data?: T;
  detail?: string;
  error?: string;
}
