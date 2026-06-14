import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCompanyInitData,
  getCompanyConfigData,
  updateCompanyConfigData,
} from "../../../services/api/company/companyConfigApi";

const initialState = {
  config: {}, // simplified key-value map
  configData: [], // structured grid data
  isLoading: false,
  configDataLoading: false,
  error: null,
};

// Fetch basic/summary config (e.g. POS_PRODUCT_PRICE_BASED_ON_STOCK_MRP, COMPANY_NAME)
export const loadCompanyConfigInit = createAsyncThunk(
  "company/loadCompanyConfigInit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCompanyInitData();
      if (response.success || response.data?.success) {
        const data = response.data?.obj ?? response.obj;
        return data;
      }
      return rejectWithValue(response.message || response.data?.message || "Failed to load summary config");
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load company config summary");
    }
  }
);

// Fetch detailed configuration grid data
export const loadCompanyConfigGrid = createAsyncThunk(
  "company/loadCompanyConfigGrid",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCompanyConfigData();
      if (response.success || response.data?.success) {
        const data = response.data?.obj ?? response.obj;
        return data;
      }
      return rejectWithValue(response.message || response.data?.message || "Failed to load detailed config");
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load detailed config");
    }
  }
);

// Update detailed configuration grid data
export const updateCompanyConfigGrid = createAsyncThunk(
  "company/updateCompanyConfigGrid",
  async (configList, { dispatch, rejectWithValue }) => {
    try {
      const response = await updateCompanyConfigData({ configList });
      if (response.success || response.data?.success) {
        // Reload init data to keep system in sync
        dispatch(loadCompanyConfigInit());
        // Reload grid
        dispatch(loadCompanyConfigGrid());
        return true;
      }
      return rejectWithValue(response.message || response.data?.message || "Failed to update configuration");
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update configuration");
    }
  }
);

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanyConfig(state) {
      state.config = {};
      state.configData = [];
      state.isLoading = false;
      state.configDataLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadCompanyConfigInit
      .addCase(loadCompanyConfigInit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCompanyConfigInit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config = action.payload || {};
      })
      .addCase(loadCompanyConfigInit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Could not load summary config";
      })
      // loadCompanyConfigGrid
      .addCase(loadCompanyConfigGrid.pending, (state) => {
        state.configDataLoading = true;
        state.error = null;
      })
      .addCase(loadCompanyConfigGrid.fulfilled, (state, action) => {
        state.configDataLoading = false;
        state.configData = action.payload || [];
      })
      .addCase(loadCompanyConfigGrid.rejected, (state, action) => {
        state.configDataLoading = false;
        state.error = action.payload || "Could not load config grid";
      });
  },
});

export const { clearCompanyConfig } = companySlice.actions;
export default companySlice.reducer;
