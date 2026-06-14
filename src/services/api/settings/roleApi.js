import apiClient from "../../axiosInstance";

/**
 * Fetch paginated list of user roles
 * @param {Object} params - pageNo, pageSize, sortDirection, search
 * @returns {Promise<Object>}
 */
export const getRolesList = (params) => {
  return apiClient.get("/api/rp/role/list", { params });
};

/**
 * Fetch all roles in the system (e.g. for selection dropdowns)
 * @returns {Promise<Object>}
 */
export const findAllRoles = () => {
  return apiClient.get("/api/rp/role/find-all");
};

/**
 * Create a new user role
 * @param {Object} data - roleName, roleDescription, isAdmin, isSuperAdmin
 * @returns {Promise<Object>}
 */
export const saveRole = (data) => {
  return apiClient.post("/api/rp/role/save", data);
};

/**
 * Update an existing user role
 * @param {Object} data - id, roleName, roleDescription, isAdmin, isSuperAdmin, roleCode
 * @returns {Promise<Object>}
 */
export const updateRole = (data) => {
  return apiClient.put("/api/rp/role/update", data);
};

/**
 * Delete a user role by ID
 * @param {number|string} id - The ID of the target role
 * @returns {Promise<Object>}
 */
export const deleteRole = (id) => {
  return apiClient.delete("/api/rp/role/delete", { params: { id } });
};
