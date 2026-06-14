import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRoleMenuAccessForUser } from "../../../services/api/settings/menuApi";

export const loadUserMenu = createAsyncThunk(
  "menu/loadUserMenu",
  async (userId, { rejectWithValue }) => {
    if (!userId) return rejectWithValue("No userId provided");
    try {
      const resp = await getRoleMenuAccessForUser(userId);
      if (!resp?.data?.success) {
        return rejectWithValue(resp?.data?.message || "Failed to load menu");
      }

      const parentMenuList = resp.data.obj?.parentMenuList || [];

      const allowedNamesSet = new Set();
      const checkedItems = [];

      function recurse(list) {
        list.forEach((item) => {
          if (!item.isChecked) return; // skip unchecked menus

          checkedItems.push(item);

          if (item.menuName) {
            allowedNamesSet.add(item.menuName.trim().toLowerCase());
          }
          if (Array.isArray(item.childMenuList) && item.childMenuList.length) {
            recurse(item.childMenuList);
          }
        });
      }

      recurse(parentMenuList);

      return {
        items: checkedItems,
        allowedPaths: [],
        allowedNames: Array.from(allowedNamesSet),
      };
    } catch (err) {
      return rejectWithValue(err.message || "Error fetching menu");
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    items: [],
    allowedPaths: [],
    allowedNames: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearMenu(state) {
      state.items = [];
      state.allowedPaths = [];
      state.allowedNames = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserMenu.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserMenu.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.allowedPaths = action.payload.allowedPaths;
        state.allowedNames = action.payload.allowedNames;
      })
      .addCase(loadUserMenu.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
