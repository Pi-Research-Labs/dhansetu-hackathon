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

// ==========================================
// Types & Interfaces for Officer API Suite
// ==========================================

// Auth endpoints
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
  enterprise_id?: string;
  proprietor_name?: string;
  [key: string]: unknown;
}

// Worklist endpoint
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
  savings_runway_days?: number;
  credit_headroom?: number;
  bridge_headroom?: number;
  forecast_net_90d_p10?: number | null;
  forecast_net_90d_p50?: number | null;
  forecast_net_90d_p90?: number | null;
  forecast_net_180d_p10?: number | null;
  forecast_net_180d_p50?: number | null;
  forecast_net_180d_p90?: number | null;
  dscr_proj_180d?: number | null;
  reason_1?: string | null;
  reason_2?: string | null;
  reason_3?: string | null;
  margin_gap_90d?: number | null;
  digital_share?: number | null;
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

// Digital Heatmap types
export interface DigitalHeatmapItem {
  enterprise_id: string;
  event_date: string;
  digital_share_pct: number;
  cash_share_pct: number;
  is_zero_txn_day: boolean;
}

// Weekly Cashflow types
export interface WeeklyCashflowItem {
  enterprise_id: string;
  week_start: string;
  week_end: string;
  inflow: number;
  outflow: number;
  net: number;
  zero_txn_days: number;
}

// Cashflow Forecast types
export interface CashflowForecastItem {
  enterprise_id: string;
  origin_date: string;
  horizon_days: number;
  horizon_label: string;
  horizon_end_date: string;
  p10: number;
  p50: number;
  p90: number;
  confidence_score: number;
  confidence_label: "high" | "medium" | "low" | string;
}

// Net Inflow Heatmap types
export interface NetInflowHeatmapItem {
  enterprise_id: string;
  week_start: string;
  week_end: string;
  net_inflow: number;
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

// Voice Review Queue & Confirm types
export interface VoiceReviewQueueItem {
  extraction_id?: string;
  voice_id?: string;
  enterprise_id: string;
  proprietor_name?: string;
  channel?: string;
  detected_lang?: string;
  transcript?: string;
  spoken_at?: string;
  amount?: number;
  direction?: string;
  confidence?: number;
  needs_review?: boolean;
  [key: string]: unknown;
}

export interface PostVoiceReviewPayload {
  reviewed_amount: number;
  direction: "inflow" | "outflow" | string;
  category: string;
  is_household: boolean;
  tender: string;
}

export interface PostVoiceReviewResponse {
  entry_id: string;
  enterprise_id: string;
  event_date: string;
  direction: string;
  amount: number;
}

// Task Outcome types
export interface PostOutcomePayload {
  task_id: string;
  outcome: "stress_confirmed" | "false_positive" | "unreachable" | string;
  intervention?: string;
  note_lang?: string;
}

export interface PostOutcomeResponse {
  outcome_id: string;
}

// Evidence endpoints types
export interface EvidenceDistrictEvent {
  as_of: string;
  district: string;
  sector: string;
  mechanism: string;
  flagged: number;
  total_in_cohort: number;
  pct_of_cohort: number;
  no_buffer: number;
  visit_these_three: string[];
  is_district_event: boolean;
}

export interface EvidenceAlertPrecisionItem {
  risk_tier?: string;
  precision?: number;
  total_alerts?: number;
  confirmed_alerts?: number;
  [key: string]: unknown;
}

export interface EvidenceReasonCodeScorecardItem {
  mechanism?: string;
  predicted_count?: number;
  true_count?: number;
  accuracy?: number;
  [key: string]: unknown;
}

export interface EvidenceLeadTimeResponse {
  episodes: number;
  caught: number;
  median_lead_days: number;
  min_lead_days: number;
  max_lead_days: number;
}

export interface EvidenceForecastAccuracyItem {
  horizon_days?: number;
  mae?: number;
  coverage_pct?: number;
  [key: string]: unknown;
}

export interface EvidenceHeadroomByTierItem {
  risk_tier?: string;
  avg_credit_headroom?: number;
  avg_bridge_headroom?: number;
  [key: string]: unknown;
}

export interface EvidenceDataProvenanceItem {
  enterprise_id: string;
  real_share_pct?: number;
  simulated_share_pct?: number;
  [key: string]: unknown;
}


// ==========================================
// Central API functions for Officers
// ==========================================

// Auth
export async function officerLogin(payload: OfficerLoginPayload): Promise<OfficerLoginResponse> {
  return await apiClient.post<OfficerLoginResponse>("/auth/officer-login", payload);
}

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  return await apiClient.get<AuthMeResponse>("/auth/me");
}

export const getAuthMe = fetchAuthMe;

// Worklist
export async function getWorklist(): Promise<WorklistItem[]> {
  return await apiClient.get<WorklistItem[]>("/worklist");
}

// Enterprise Core
export async function getEnterpriseDetails(enterpriseId: string): Promise<EnterpriseDetailsResponse> {
  return await apiClient.get<EnterpriseDetailsResponse>(`/enterprise/${enterpriseId}`);
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

export async function getReceivables(enterpriseId: string): Promise<ReceivableItem[]> {
  return await apiClient.get<ReceivableItem[]>(`/enterprise/${enterpriseId}/receivables`);
}

export async function getPaymentMix(enterpriseId: string): Promise<PaymentMixResponse> {
  return await apiClient.get<PaymentMixResponse>(`/enterprise/${enterpriseId}/payment-mix`);
}

export async function getDigitalHeatmap(enterpriseId: string): Promise<DigitalHeatmapItem[]> {
  return await apiClient.get<DigitalHeatmapItem[]>(`/enterprise/${enterpriseId}/digital-heatmap`);
}

export async function getWeeklyCashflow(enterpriseId: string, weeks?: number): Promise<WeeklyCashflowItem[]> {
  const query = weeks ? `?weeks=${weeks}` : "";
  return await apiClient.get<WeeklyCashflowItem[]>(`/enterprise/${enterpriseId}/weekly-cashflow${query}`);
}

export async function getCashflowForecast(enterpriseId: string): Promise<CashflowForecastItem[]> {
  return await apiClient.get<CashflowForecastItem[]>(`/enterprise/${enterpriseId}/cashflow-forecast`);
}

export async function getNetInflowHeatmap(enterpriseId: string, weeks?: 7 | 14): Promise<NetInflowHeatmapItem[]> {
  const query = weeks ? `?weeks=${weeks}` : "";
  return await apiClient.get<NetInflowHeatmapItem[]>(`/enterprise/${enterpriseId}/net-inflow-heatmap${query}`);
}

// Risk Prediction
export async function getRiskPrediction(enterpriseId: string): Promise<RiskPredictionResponse> {
  return await apiClient.get<RiskPredictionResponse>(`/risk/${enterpriseId}/predict`);
}

// Voice Review
export async function getVoiceReviewQueue(): Promise<VoiceReviewQueueItem[]> {
  return await apiClient.get<VoiceReviewQueueItem[]>("/voice/review-queue");
}

export async function postVoiceReview(extractionId: string, payload: PostVoiceReviewPayload): Promise<PostVoiceReviewResponse> {
  return await apiClient.post<PostVoiceReviewResponse>(`/voice/review/${extractionId}`, payload);
}

// Task Outcome
export async function postTaskOutcome(payload: PostOutcomePayload): Promise<PostOutcomeResponse> {
  return await apiClient.post<PostOutcomeResponse>("/outcome", payload);
}

// Evidence APIs
export async function getEvidenceDistrictEvents(): Promise<EvidenceDistrictEvent[]> {
  return await apiClient.get<EvidenceDistrictEvent[]>("/evidence/district-events");
}

export async function getEvidenceAlertPrecision(): Promise<EvidenceAlertPrecisionItem[]> {
  return await apiClient.get<EvidenceAlertPrecisionItem[]>("/evidence/alert-precision");
}

export async function getEvidenceReasonCodeScorecard(): Promise<EvidenceReasonCodeScorecardItem[]> {
  return await apiClient.get<EvidenceReasonCodeScorecardItem[]>("/evidence/reason-code-scorecard");
}

export async function getEvidenceLeadTime(): Promise<EvidenceLeadTimeResponse> {
  return await apiClient.get<EvidenceLeadTimeResponse>("/evidence/lead-time");
}

export async function getEvidenceForecastAccuracy(): Promise<EvidenceForecastAccuracyItem[]> {
  return await apiClient.get<EvidenceForecastAccuracyItem[]>("/evidence/forecast-accuracy");
}

export async function getEvidenceHeadroomByTier(): Promise<EvidenceHeadroomByTierItem[]> {
  return await apiClient.get<EvidenceHeadroomByTierItem[]>("/evidence/headroom-by-tier");
}

export async function getEvidenceDataProvenance(): Promise<EvidenceDataProvenanceItem[]> {
  return await apiClient.get<EvidenceDataProvenanceItem[]>("/evidence/data-provenance");
}

export default api;
