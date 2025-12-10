import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { "Content-Type": "application/json" },
});

/* ------------------------ Helpers ------------------------ */
const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("selected_user");

  window.location.href = "/auth/sign-in"; // redirect
};

/* ------------------------ Request Interceptor ------------------------ */
axiosInstance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access_token");

    if (access && access !== "undefined" && access !== "null") {
      config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------- Response Interceptor ---------------------- */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if 401 and not retried yet → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh_token");

      // No refresh_token → Logout
      if (!refresh) {
        logoutUser();
        return Promise.reject(error);
      }

      try {
        // Hit refresh API
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}auth/access/`,
          { refresh_token: refresh },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccess = res.data?.data?.access_token;
        const newRefresh = res.data?.data?.refresh_token; // API may return updated refresh
//  console.log("asdf",newRefresh)
        if (!newAccess) {
          logoutUser();
          return Promise.reject(error);
        }

        // Save new tokens
        saveTokens(newAccess, newRefresh ?? refresh);

        // Retry failed request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);

      } catch (err) {
        // Refresh token expired → logout
        logoutUser();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
