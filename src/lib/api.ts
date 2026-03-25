import axios from "axios";
import { store } from "@/redux/store";
import { refreshTokenSuccess, refreshTokenFailure, logout } from "@/redux/slices/auth-slice";

import https from "https";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  // Allow self-signed certificates for local development in Node.js
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});


let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest = originalRequest?.url?.includes("/Auth/login");
    const isRefreshRequest = originalRequest?.url?.includes("/Auth/refresh-token");

    if (error.response?.status === 401 && !originalRequest?._retry && !isLoginRequest && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((accessToken: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${baseUrl}/api/Auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        const expiresAt = response.data.expiresAt;

        store.dispatch(refreshTokenSuccess({ accessToken: newAccessToken, expiresAt }));

        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(refreshTokenFailure());
        processQueue(refreshError, null);
        store.dispatch(logout());
        if (typeof window !== "undefined") {
           // We must clear NextAuth session so it doesn't revive the expired token!
           import("next-auth/react").then(({ signOut }) => {
             signOut({ callbackUrl: "/login" });
           }).catch(() => {
             window.location.href = "/login";
           });
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }

    }

    return Promise.reject(error);
  }
);

export default api;
