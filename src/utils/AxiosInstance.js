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
  // Uncomment if you want auto-logout on token failure
  // localStorage.removeItem("access_token");
  // localStorage.removeItem("refresh_token");
  // localStorage.removeItem("user");
  // localStorage.removeItem("selected_user");
  // window.location.href = "/auth/sign-in";
};

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user"));
    const selectedUser = JSON.parse(localStorage.getItem("selected_user"));

    // ✅ Determine role and user_id
    const userRoles = user?.roles || [];
    const isManager = userRoles.some(
      (role) => role.toLowerCase() === "manager"
    );

    
    const userIdToSend =
      isManager && (selectedUser?.user_id || user?.user_id) ? (selectedUser?.user_id || user?.user_id) : null;

    // ✅ Attach Bearer token if available
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.url !== "/auth/refresh/") {
      localStorage.removeItem("access_token");
    }

    // ✅ Only send user_id if Manager
    if (userIdToSend) {
      if (config.method === "get") {
        // Some APIs allow GET with data; use query param if not
        config.data = { user_id: userIdToSend };
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

// ✅ Response Interceptor (Auto Refresh Token)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const user = JSON.parse(localStorage.getItem("user"));
    const userIdToSend = user?.user_id || null;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh_token = localStorage.getItem("refresh_token");
        if (!refresh_token) {
          handleLogout();
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}auth/access/`, // ✅ Updated endpoint
          { refresh_token, user_id: userIdToSend },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = res.data?.data?.access_token;
        if (!newAccessToken) {
          handleLogout();
          return Promise.reject(error);
        }

        // ✅ Save new tokens
        saveTokens(newAccessToken, refresh_token);

        // ✅ Retry failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        handleLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
