import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // try {
      //   await axios.post(
      //     `${API_URL}/auth/refresh`,
      //     {},
      //     { withCredentials: true },
      //   );
      //   return api(originalRequest);
      // } catch {
      //   if (typeof window !== "undefined") {
      //     window.location.href = "/login";
      //   }
      // }
    }

    return Promise.reject(error);
  },
);
