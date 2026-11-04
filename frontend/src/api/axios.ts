import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const apiClient = axios.create({
  // Relative by default so a production build works behind the same reverse proxy.
  // The Vite dev server proxies /api to the Laravel app.
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatically attach Sanctum Bearer Token on every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("sms_auth_token");
    if (token && token.trim() && token !== "undefined" && token !== "null" && config.headers) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Handle expired/invalid tokens (401) globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("sms_auth_token");

      // Let AuthContext clear the session and show a toast. A full page reload
      // here would discard the message and any unsaved UI state.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);
