import axios from "axios";

// Create axios instance with base configuration
export const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add authentication token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }

    // Handle 403 Forbidden - show permission error
    if (error.response?.status === 403) {
      console.error("Insufficient permissions");
      // You can dispatch a toast notification here
    }

    // Handle 400 Bad Request - validation errors
    if (error.response?.status === 400) {
      console.error("Validation error:", error.response.data.message);
      // You can dispatch a toast notification here
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("Server error occurred");
      // You can dispatch a toast notification here
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error - please check your connection");
      // You can dispatch a toast notification here
    }

    return Promise.reject(error);
  }
);

export default adminApi;
