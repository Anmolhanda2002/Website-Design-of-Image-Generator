import axios from "axios";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach access_token
axiosInstance.interceptors.request.use(
  (config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = localStorage.getItem("refresh_token");
        if (!refresh_token) throw new Error("No refresh token found");

        // Step 1: temporarily use refresh_token as access_token
        localStorage.setItem("access_token", refresh_token);

        // Step 2: call refresh API
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh/`,
          { refresh: refresh_token },
          { headers: { "Content-Type": "application/json" } }
        );

        // Step 3: replace tokens in localStorage
        const newAccessToken =
          res.data.access_token || res.data.access || res.data.token;
        const newRefreshToken =
          res.data.refresh_token || res.data.refresh || refresh_token;

        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        // Step 4: retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Keep using refresh token as access_token if needed
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
