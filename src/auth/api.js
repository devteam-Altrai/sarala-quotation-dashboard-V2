// import axios from "axios";
// import { AUTH_URL } from "../utils/AppConstant";

// // Create axios instance
// const api = axios.create({
//   baseURL: AUTH_URL,
// });

// // Attach token to each request if available
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;
// import axios from "axios";
// import { AUTH_URL } from "../utils/AppConstant";

// const api = axios.create({
//   baseURL: AUTH_URL,
// });

// // Request Interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response Interceptor (Auto refresh)
// api.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const refresh = localStorage.getItem("refresh");

//       if (!refresh) {
//         console.log("Refresh token missing");
//         return Promise.reject(error);
//       }

//       try {
//         const res = await axios.post(`${AUTH_URL}token/refresh/`, {
//           refresh: refresh,
//         });

//         // Save new access token
//         localStorage.setItem("access", res.data.access);

//         // Retry request with new token
//         originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.log("Refresh token expired → logout");
//         localStorage.clear();
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";
import { AUTH_URL } from "../utils/AppConstant";

const api = axios.create({
  baseURL: AUTH_URL,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Auto refresh)
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        console.log("Refresh token missing");
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${AUTH_URL}token/refresh/`, {
          refresh: refresh,
        });

        // Save new access token
        localStorage.setItem("access", res.data.access);

        // Retry request with new token
        originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.log("Refresh token expired → logout");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
