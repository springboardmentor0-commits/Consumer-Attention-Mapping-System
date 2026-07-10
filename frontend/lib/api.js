import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL: API_BASE_URL });

// Attach the stored access token to every request, if present.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("cams_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email, password) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const { data } = await api.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  window.localStorage.setItem("cams_access_token", data.access_token);
  window.localStorage.setItem("cams_refresh_token", data.refresh_token);
  return data;
}

export function logout() {
  window.localStorage.removeItem("cams_access_token");
  window.localStorage.removeItem("cams_refresh_token");
}
