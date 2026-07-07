const ROLE_METADATA = {
  1: {
    name: "Admin",
    access: "Full access",
    canViewStores: true,
    canEditStores: true,
    canViewShelves: true,
    canEditShelves: true,
    summary: "Can manage stores, shelves, and see all dashboard sections.",
    restrictions: "No role restrictions in the UI.",
  },
  2: {
    name: "Store Manager",
    access: "Store and shelf management",
    canViewStores: true,
    canEditStores: true,
    canViewShelves: true,
    canEditShelves: true,
    summary: "Can add stores and shelves and manage daily retail setup.",
    restrictions: "Does not get admin-only controls in this UI.",
  },
  3: {
    name: "Retail Analyst",
    access: "Read-only insights",
    canViewStores: true,
    canEditStores: false,
    canViewShelves: true,
    canEditShelves: false,
    summary: "Can view stores and shelves, but should not make data changes.",
    restrictions: "Add actions are disabled in this UI.",
  },
  4: {
    name: "Marketing Manager",
    access: "View and review",
    canViewStores: true,
    canEditStores: false,
    canViewShelves: true,
    canEditShelves: false,
    summary: "Can review store and shelf information for planning.",
    restrictions: "Create actions are disabled in this UI.",
  },
};

function decodeBase64Url(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

export function getSessionUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(payloadPart));
    const roleId = Number(payload.role);
    const role = ROLE_METADATA[roleId] || {
      name: "Unknown Role",
      access: "Limited access",
      canViewStores: false,
      canEditStores: false,
      canViewShelves: false,
      canEditShelves: false,
      summary: "Role information is not recognized.",
      restrictions: "Permissions could not be determined.",
    };

    return {
      email: payload.sub || "Unknown user",
      roleId,
      role,
    };
  } catch (error) {
    return null;
  }
}

export function canEditStores() {
  const session = getSessionUser();
  return Boolean(session?.role?.canEditStores);
}

export function canViewStores() {
  const session = getSessionUser();
  return Boolean(session?.role?.canViewStores);
}

export function canEditShelves() {
  const session = getSessionUser();
  return Boolean(session?.role?.canEditShelves);
}

export function canViewShelves() {
  const session = getSessionUser();
  return Boolean(session?.role?.canViewShelves);
}

export function getRoleMetadata(roleId) {
  return ROLE_METADATA[Number(roleId)] || ROLE_METADATA[3];
}
