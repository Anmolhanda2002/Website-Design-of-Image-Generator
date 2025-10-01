import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // CRA syntax
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("sdf",process.env.REACT_APP_API_URL);

// Interceptors...
export default axiosInstance;
