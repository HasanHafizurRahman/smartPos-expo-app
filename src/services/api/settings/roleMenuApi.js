import apiClient from "../../axiosInstance";

/**
 * Fetch hierarchical menu permissions tree for a given role ID
 * @param {number|string} roleId
 * @returns {Promise<Object>}
 */
export const findAccessByRoleId = (roleId) => {
  return apiClient.get(`/api/rp/role-menu/find-access-by-role-id/${roleId}`);
};

/**
 * Save access menu permissions tree updates for a role
 * @param {Object} data - payload with roleId, roleName, and parentMenuList tree
 * @returns {Promise<Object>}
 */
export const saveAccess = (data) => {
  return apiClient.put("/api/rp/role-menu/save-access", data);
};
