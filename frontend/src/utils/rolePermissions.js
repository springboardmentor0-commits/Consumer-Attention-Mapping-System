// Role-Based Access Control (RBAC) Permission Utility

export const getRolePermissions = () => {
  const role = localStorage.getItem("userRole") || "Admin";

  const isAdmin = role === "Admin";
  const isStoreManager = role === "Store Manager";
  const isRetailAnalyst = role === "Retail Analyst";
  const isMarketingManager = role === "Marketing Manager";

  return {
    role,
    // Store Actions
    canCreateStore: isAdmin,
    canUpdateStore: isAdmin || isStoreManager,
    canDeleteStore: isAdmin,

    // Shelf Actions
    canCreateShelf: isAdmin || isStoreManager,
    canUpdateShelf: isAdmin || isStoreManager || isMarketingManager,
    canDeleteShelf: isAdmin || isStoreManager,

    // View & Layout Access
    canDesignMap: isAdmin,
    canViewAnalytics: true,
    canViewCctv: true,
    isReadOnly: isRetailAnalyst,
  };
};
