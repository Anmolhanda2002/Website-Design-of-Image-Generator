import axios from "axios";

// ✅ Create a centralized Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helper to safely save tokens
const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

// ✅ Helper to clean logout
const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = "/auth/sign-in";
};

// ✅ Request interceptor — attach token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // Only attach if token exists and is non-empty
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove bad tokens
      localStorage.removeItem("access_token");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor — handle 401 & refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Only handle 401 once
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = localStorage.getItem("refresh_token");

        if (!refresh_token || refresh_token === "undefined" || refresh_token === "null") {
          console.warn("⚠️ No valid refresh token found, logging out...");
          handleLogout();
          return Promise.reject(error);
        }

        // Request new tokens using refresh token
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}auth/refresh/`,
          { refresh_token },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken =
          res.data?.access_token || res.data?.access || res.data?.token;
        const newRefreshToken =
          res.data?.refresh_token || res.data?.refresh || refresh_token;

        if (!newAccessToken) {
          console.error("❌ Refresh API did not return a valid access token");
          handleLogout();
          return Promise.reject(error);
        }

        // Save and retry
        saveTokens(newAccessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
