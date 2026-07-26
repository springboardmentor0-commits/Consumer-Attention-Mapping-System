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

export async function getAnalyticsSummary(token: string) {
  const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getAnalytics(token: string) {
  const response = await fetch(`${API_BASE_URL}/analytics/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}