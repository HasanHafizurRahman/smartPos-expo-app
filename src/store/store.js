import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./features/auth/authSlice";
import menuReducer from "./features/menu/menuSlice";
import { registerUnauthorizedCallback } from "../services/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Register unauthorized callback to wipe store and state on 403
registerUnauthorizedCallback(() => {
  store.dispatch(logout());
});

export default store;
