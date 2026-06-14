import apiClient from "../../axiosInstance";

export const getUserById = (id) =>
  apiClient.get("/api/user/find-by-id", { params: { id } });

export const getCurrentUser = () =>
  apiClient.get("/api/user/find-curr-user");
