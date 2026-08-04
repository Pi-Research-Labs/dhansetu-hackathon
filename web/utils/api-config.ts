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
      const data = error.response.data as { message?: string; error?: string; detail?: string };
      errorMessage = data?.message || data?.detail || data?.error || `Error ${error.response.status}`;

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

// Types for Auth endpoints
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

// Worklist endpoint type
export interface WorklistItem {
  officer_id: string;
  officer_name: string;
  officer_lang: string;
  enterprise_id: string;
  proprietor_name: string;
  sub_type: string;
  block: string;
  preferred_lang: string;
  preferred_channel: string;
  as_of: string;
  risk_tier: "AMBER" | "RED" | "GREEN" | string;
  score: number;
  net_buffer_days: number;
  reason_1?: string | null;
  reason_2?: string | null;
  reason_3?: string | null;
  low_visibility: boolean;
  credit_headroom: number;
  bridge_headroom: number;
  alert_id: string;
  projected_shortfall: number;
  shortfall_week_of: string;
  deadline_date: string;
  rupees_at_risk: number;
  km_from_centre: number;
}

// Enterprise Detail types
export interface LiveForecastItem {
  enterprise_id: string;
  origin_date: string;
  horizon_days: number;
  p10: number;
  p50: number;
  p90: number;
  horizon_end_date: string;
}

export interface AlertAction {
  rank: number;
  mechanism: string;
  action_key: string;
  audience: string;
  lang: string;
  params: Record<string, unknown>;
}

export interface LatestAlert {
  alert_id: string;
  raised_at: string;
  projected_shortfall: number;
  shortfall_week_of: string;
  actions: AlertAction[];
}

export interface EnterpriseCard {
  enterprise_id: string;
  proprietor_name: string;
  business_name?: string;
  risk_tier: string;
  score: number;
  model_prob_stress?: number;
  rule_score?: number;
  buffer_days?: number;
  net_buffer_days?: number;
  credit_headroom?: number;
  bridge_headroom?: number;
  forecast_net_90d_p10?: number | null;
  forecast_net_90d_p50?: number | null;
  forecast_net_90d_p90?: number | null;
  reason_1?: string | null;
  reason_2?: string | null;
  reason_3?: string | null;
  margin_gap_90d?: number | null;
  [key: string]: unknown;
}

export interface EnterpriseDetailsResponse {
  card: EnterpriseCard;
  live_forecast?: LiveForecastItem[];
  latest_alert?: LatestAlert | null;
}

// Receivables (Udhaar Book) types
export interface ReceivableItem {
  enterprise_id: string;
  proprietor_name: string;
  sector: string;
  counterparty_type: string;
  invoices: number;
  total: number;
  outstanding?: number | null;
  written_off: number;
  avg_days_to_cash: number;
  worst_days_to_cash: number;
  write_off_pct: number;
}

// Payment Mix types
export interface PaymentMixResponse {
  enterprise_id: string;
  proprietor_name: string;
  sector: string;
  district: string;
  preferred_channel: string;
  avg_upi_share: number;
  avg_wallet_share: number;
  avg_digital_share: number;
  avg_cash_share: number;
  recent_90d_digital_share: number;
  recent_90d_cash_share: number;
}

// Risk Prediction types
export interface RiskPredictionResponse {
  enterprise_id: string;
  as_of: string;
  risk_tier: string;
  prob_stress: number;
  prob_missed_repayment: number;
  fused_score: number;
  forecast_net_90d_p10?: number | null;
  forecast_net_90d_p50?: number | null;
  forecast_net_90d_p90?: number | null;
  reason_1?: string | null;
  reason_2?: string | null;
  reason_3?: string | null;
  model_id: string;
  rule_version: string;
  features?: Record<string, unknown>;
  source: string;
}

// Task Outcome types
export interface PostOutcomePayload {
  task_id: string;
  outcome: "stress_confirmed" | "false_positive" | "unreachable";
  intervention?: string;
  note_lang?: string;
}

export interface PostOutcomeResponse {
  outcome_id: string;
}

// Central API functions
export async function officerLogin(payload: OfficerLoginPayload): Promise<OfficerLoginResponse> {
  return await apiClient.post<OfficerLoginResponse>("/auth/officer-login", payload);
}

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  return await apiClient.get<AuthMeResponse>("/auth/me");
}

export const getAuthMe = fetchAuthMe;

export async function getWorklist(): Promise<WorklistItem[]> {
  return await apiClient.get<WorklistItem[]>("/worklist");
}

export async function getEnterpriseDetails(enterpriseId: string): Promise<EnterpriseDetailsResponse> {
  return await apiClient.get<EnterpriseDetailsResponse>(`/enterprise/${enterpriseId}`);
}

export async function getReceivables(enterpriseId: string): Promise<ReceivableItem[]> {
  return await apiClient.get<ReceivableItem[]>(`/enterprise/${enterpriseId}/receivables`);
}

export async function getPaymentMix(enterpriseId: string): Promise<PaymentMixResponse> {
  return await apiClient.get<PaymentMixResponse>(`/enterprise/${enterpriseId}/payment-mix`);
}

export async function getRiskPrediction(enterpriseId: string): Promise<RiskPredictionResponse> {
  return await apiClient.get<RiskPredictionResponse>(`/risk/${enterpriseId}/predict`);
}

export async function postTaskOutcome(payload: PostOutcomePayload): Promise<PostOutcomeResponse> {
  return await apiClient.post<PostOutcomeResponse>("/outcome", payload);
}

export async function fetchMapTileBlobUrl(enterpriseId: string, zoom = 15, size = "400x400"): Promise<string> {
  const token = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
  const res = await fetch(`${API_BASE_URL}enterprise/${enterpriseId}/map-tile?zoom=${zoom}&size=${size}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Map tile HTTP error ${res.status}`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export default api;
