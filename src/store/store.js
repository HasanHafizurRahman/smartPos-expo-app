import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./features/auth/authSlice";
import menuReducer, { clearMenu } from "./features/menu/menuSlice";
import companyReducer, { clearCompanyConfig } from "./features/company/companySlice";
import { registerUnauthorizedCallback } from "../services/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    company: companyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Register unauthorized callback to wipe store and state on 403
registerUnauthorizedCallback(() => {
  store.dispatch(logout());
  store.dispatch(clearMenu());
  store.dispatch(clearCompanyConfig());
});

export default store;
