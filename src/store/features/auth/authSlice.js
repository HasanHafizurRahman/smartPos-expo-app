import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { getCurrentUser, getUserById } from "../../../services/api/settings/userApi";

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Thunk: fetch current user & their details (including photoUrl)
export const loadCurrentUser = createAsyncThunk(
  "auth/loadCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const currResp = await getCurrentUser();
      if (!currResp.data.success) {
        return rejectWithValue("Failed to fetch current user");
      }
      const userId = currResp.data.obj.userId;
      const userResp = await getUserById(userId);
      if (!userResp.data.success) {
        return rejectWithValue("Failed to fetch user by ID");
      }
      // Save details to secure store for offline caching
      await SecureStore.setItemAsync("user", JSON.stringify(userResp.data.obj));
      return userResp.data.obj;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load user");
    }
  }
);

// Thunk: perform full logout on server and locally
export const performLogout = createAsyncThunk(
  "auth/performLogout",
  async (_, { dispatch }) => {
    try {
      // Lazy load to prevent potential circular dependency
      const { logoutApi } = require("../../../services/api/authApi");
      await logoutApi();
    } catch (err) {
      console.log("Server logout failed, proceeding with local logout", err);
    } finally {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("tokenExpiry");
    }
  }
);

// Thunk: initialize auth status from storage
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { dispatch }) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const expiry = await SecureStore.getItemAsync("tokenExpiry");
      const userStr = await SecureStore.getItemAsync("user");

      if (token) {
        // Validate local token expiry (if not NaN)
        if (expiry && !isNaN(Number(expiry)) && Date.now() > Number(expiry)) {
          await SecureStore.deleteItemAsync("authToken");
          await SecureStore.deleteItemAsync("user");
          await SecureStore.deleteItemAsync("tokenExpiry");
          return null;
        }

        let user = null;
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch (e) {
            console.log("Error parsing user cached string", e);
          }
        }

        // Fetch fresh user profile in background
        dispatch(loadCurrentUser());

        return { token, user };
      }
    } catch (err) {
      console.log("Error checking secure store on app launch", err);
    }
    return null;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      // For compatibility
      if (action.payload) {
        state.token = action.payload;
      }
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      SecureStore.deleteItemAsync("authToken");
      SecureStore.deleteItemAsync("user");
      SecureStore.deleteItemAsync("tokenExpiry");
    },
    setAuth(state, action) {
      const { token, user, expires_in } = action.payload;
      state.user = user;
      state.token = token;

      SecureStore.setItemAsync("authToken", token);
      if (user) {
        SecureStore.setItemAsync("user", JSON.stringify(user));
      }
      if (expires_in) {
        const expiryTime = Date.now() + expires_in * 1000;
        SecureStore.setItemAsync("tokenExpiry", expiryTime.toString());
      }
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitialized = true;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true;
      })
      .addCase(loadCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Could not load user profile";
      })
      .addCase(performLogout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const {
  login,
  setUser,
  logout,
  setAuth,
  setLoading,
  setError,
} = authSlice.actions;

export default authSlice.reducer;
