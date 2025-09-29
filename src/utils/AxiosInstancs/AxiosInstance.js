import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Authorization token if exists
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

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {

      if (error.response.status === 401) {
        console.warn("Unauthorized, logging out...");
        localStorage.removeItem("token");
      }

      if (error.response.status === 403) {
        console.error("Access denied.");
      }
    } else if (error.request) {
      console.error("No response from server. Please try again.");
    } else {
      console.error("Axios error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
