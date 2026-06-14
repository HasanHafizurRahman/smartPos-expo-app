import apiClient from "../axiosInstance";

export const loginApi = async (username, password) => {
  const response = await apiClient.post("/auth/login", { username, password });
  return response.data;
};

export const logoutApi = async () => {
  console.log("[logoutApi] calling POST /api/system/logout");
  const response = await apiClient.post("/api/system/logout");
  console.log(
    "[logoutApi] response.status:",
    response.status,
    "response.data:",
    response.data
  );
  return response.data;
};
