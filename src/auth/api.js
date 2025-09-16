import axios from "axios";
import { BASE_URL } from "../utils/AppConstant";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token to each request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
