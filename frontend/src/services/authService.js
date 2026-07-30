const API_URL = "http://127.0.0.1:8000";

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  localStorage.setItem("access_token", data.access_token);

  // Stored under both keys: ProtectedRoute.jsx / AdminDashboard.jsx read
  // "role", while this previously only set "user_role" — that mismatch
  // meant admin routes always redirected back to login.
  localStorage.setItem("role", data.role);
  localStorage.setItem("user_role", data.role);

  return data;
}