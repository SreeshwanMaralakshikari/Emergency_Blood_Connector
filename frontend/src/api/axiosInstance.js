// src/api/axiosInstance.js
// All API calls go through this instance.
// withCredentials: true sends the HTTP-only JWT cookie on every request.

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

export default axiosInstance;
