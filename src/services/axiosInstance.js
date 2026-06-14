import axios from "axios";
import * as SecureStore from "expo-secure-store";

const apiClient = axios.create({
  baseURL: "http://118.179.144.13:8069",
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorizedCallback = null;

export const registerUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token && !config.url.includes("/auth/login")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to fetch auth token from SecureStore", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      try {
        await SecureStore.deleteItemAsync("authToken");
        await SecureStore.deleteItemAsync("user");
        await SecureStore.deleteItemAsync("tokenExpiry");
      } catch (e) {
        console.error("Error clearing secure store on 403", e);
      }
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
