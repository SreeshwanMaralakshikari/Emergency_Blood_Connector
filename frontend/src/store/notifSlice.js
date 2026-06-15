//stores unread notification count globally so the navbar bell badge stays in sync
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

export const fetchUnreadCount = createAsyncThunk(
  "notif/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/notification-api/unread-count");
      return res.data?.unreadCount ?? 0;
    } catch {
      return rejectWithValue(0);
    }
  }
);

const notifSlice = createSlice({
  name: "notif",
  initialState: {
    unreadCount: 0,
  },
  reducers: {
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
    clearUnread: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });
  },
});

export const { decrementUnread, clearUnread } = notifSlice.actions;
export const selectUnreadCount = (state) => state.notif.unreadCount;
export default notifSlice.reducer;
