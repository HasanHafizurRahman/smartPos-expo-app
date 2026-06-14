import apiClient from "../../axiosInstance";

/**
 * Fetch summary configuration during application initialization
 * @returns {Promise<Object>}
 */
export const getCompanyInitData = () => {
  return apiClient.get("/api/company/config/init-data");
};

/**
 * Fetch active company logo image
 * @returns {Promise<Object>}
 */
export const getCompanyLogo = () => {
  return apiClient.get("/api/company/get-company-logo", { responseType: "blob" });
};

/**
 * Upload company logo image
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadCompanyLogo = (formData) => {
  return apiClient.put("/api/company/add-company-logo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Fetch current favicon file
 * @returns {Promise<Object>}
 */
export const getFavicon = () => {
  return apiClient.get("/api/company/get-fav-icon", { responseType: "blob" });
};

/**
 * Upload company favicon
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadFavicon = (formData) => {
  return apiClient.put("/api/company/add-fav-icon", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Fetch detailed configuration grid list
 * @returns {Promise<Object>}
 */
export const getCompanyConfigData = () => {
  return apiClient.get("/api/company/config-data");
};

/**
 * Update configuration grid records
 * @param {Object} data - payload with configList array
 * @returns {Promise<Object>}
 */
export const updateCompanyConfigData = (data) => {
  return apiClient.put("/api/company/config-data", data);
};
