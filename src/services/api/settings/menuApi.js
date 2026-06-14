import apiClient from "../../axiosInstance";

export const getRoleMenuAccessForUser = (userId) =>
  apiClient.get(`/api/rp/user-menu-action/access-by`, { params: { userId } });
