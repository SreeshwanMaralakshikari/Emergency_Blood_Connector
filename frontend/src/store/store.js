import { configureStore } from "@reduxjs/toolkit";
import authReducer  from "./authSlice";
import notifReducer from "./notifSlice";

const store = configureStore({
  reducer: {
    auth:  authReducer,
    notif: notifReducer,
  },
});

export default store;
