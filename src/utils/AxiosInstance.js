import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// === Request Interceptor: Attach access_token ===
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

// === Response Interceptor: Handle expired token ===
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if Unauthorized (401) and we haven't retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refresh_token = localStorage.getItem("refresh_token");
        if (!refresh_token) {
          throw new Error("No refresh token found");
        }

        // Call refresh API
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh/`,
          { refresh_token },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        // Save new tokens
        const { access_token: newAccessToken, refresh_token: newRefreshToken } =
          response.data.data;

        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        // Update Authorization header and retry the request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails → logout user
        console.error("Token refresh failed:", refreshError);

        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/auth/sign-in"; // force logout
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
