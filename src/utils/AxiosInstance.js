import axios from "axios";

// ✅ Base axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helpers
const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("selected_user");
  window.location.href = "/auth/sign-in";
};

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user"));
    const selectedUser = JSON.parse(localStorage.getItem("selected_user"));

    // ✅ Pick user_id (from selected_user > user)
    const userIdToSend = selectedUser?.user_id || user?.user_id || null;

    // ✅ Attach Bearer token
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.url !== "/auth/refresh/") {
      localStorage.removeItem("access_token");
    }

    // ✅ Ensure user_id always sent in the body — even for GET
    if (userIdToSend) {
      if (config.method === "get") {
        // Some backends expect GET with body (non-standard but allowed)
        config.data = { user_id: userIdToSend };
        config.headers["Content-Type"] = "application/json";
      } else if (config.data instanceof FormData) {
        config.data.append("user_id", userIdToSend);
      } else if (config.data && typeof config.data === "object") {
        config.data = { ...config.data, user_id: userIdToSend };
      } else {
        config.data = { user_id: userIdToSend };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const userIdToSend = JSON.parse(localStorage.getItem("user"))?.user_id || null;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = localStorage.getItem("refresh_token");
        if (!refresh_token) {
          handleLogout();
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}auth/refresh/`,
          { refresh_token, user_id: userIdToSend },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken =
          res.data?.access_token || res.data?.access || res.data?.token;
        const newRefreshToken =
          res.data?.refresh_token || res.data?.refresh || refresh_token;

        if (!newAccessToken) {
          handleLogout();
          return Promise.reject(error);
        }

        saveTokens(newAccessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry with new token
        return axiosInstance(originalRequest);
      } catch {
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
