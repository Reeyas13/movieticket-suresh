import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../axios";

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  error: null,
  loading: false,
  sidebarOpen: false,
  token: "",
};

// Async thunk for login
export const login = createAsyncThunk(
  "/auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      console.log(formData);
      const res = await api.post(`/api/auth/login`, formData, {
        withCredentials: true,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const logoutapi = createAsyncThunk(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/auth/logout`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const register = createAsyncThunk(
  "/auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      //multipart/form-data
      const res = await api.post(`/api/auth/register`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.error = null;
      state.token = "";
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload?.user?.role;
        state.token = action?.payload?.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.token = "";
        state.error = action.payload || "Login failed";
      })
      .addCase(logoutapi.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutapi.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.token = "";
        state.error = null;
      })
      .addCase(logoutapi.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.token = "";
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { logout, toggleSidebar } = authSlice.actions;
export default authSlice.reducer;
