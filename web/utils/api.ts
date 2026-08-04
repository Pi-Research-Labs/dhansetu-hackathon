import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from "./constants";

// Create single Axios instance for all API calls
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach authentication token if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors and return response data
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    let errorMessage = "An unexpected error occurred.";

    if (error.response) {
      // Server responded with non-2xx status
      const data = error.response.data as { message?: string; error?: string };
      errorMessage = data?.message || data?.error || `Error ${error.response.status}`;

      if (error.response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "Network error. Please check your internet connection.";
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

// Convenience typed helper wrappers
export const apiClient = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.get(url, config);
    return res as unknown as T;
  },
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.post(url, data, config);
    return res as unknown as T;
  },
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.put(url, data, config);
    return res as unknown as T;
  },
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.patch(url, data, config);
    return res as unknown as T;
  },
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.delete(url, config);
    return res as unknown as T;
  },
};
