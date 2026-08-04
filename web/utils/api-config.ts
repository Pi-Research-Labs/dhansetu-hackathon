import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from "./constants";

// Create single Axios instance for all API calls
export const api: AxiosInstance = axios.create({
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

// Convenience generic helper wrappers using Axios
export const apiClient = {
  get: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.get(url, config);
    return res as unknown as T;
  },
  post: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.post(url, data, config);
    return res as unknown as T;
  },
  put: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.put(url, data, config);
    return res as unknown as T;
  },
  patch: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.patch(url, data, config);
    return res as unknown as T;
  },
  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.delete(url, config);
    return res as unknown as T;
  },
};

// Types for API endpoints
export interface OfficerLoginPayload {
  phone_number: string;
  password: string;
}

export interface OfficerLoginResponse {
  access_token: string;
  token_type?: string;
  officer_id: string;
  officer_name: string;
  district_id?: number | string;
}

export interface AuthMeResponse {
  role: string;
  officer_id?: string;
  officer_name?: string;
  district_id?: number | string;
  user_id?: string;
  name?: string;
  [key: string]: unknown;
}

// Central API functions
export async function officerLogin(payload: OfficerLoginPayload): Promise<OfficerLoginResponse> {
  return await apiClient.post<OfficerLoginResponse>("/auth/officer-login", payload);
}

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  return await apiClient.get<AuthMeResponse>("/auth/me");
}

export const getAuthMe = fetchAuthMe;

export default api;
