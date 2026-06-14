import apiClient from "../../axiosInstance";

/**
 * Fetch dashboard overview statistics and metrics
 * @param {Object} params Optional query parameters: startDate, endDate (format: YYYY-MM-DD HH:mm:ss)
 * @returns {Promise<Object>} The API response data
 */
export const getDashboard = async (params = {}) => {
  const response = await apiClient.get("/api/report/dashboard", { params });
  return response.data;
};
