import axios from 'axios';

// Base URL for DhanSetu Backend API
export const API_BASE_URL = 'https://dhansetu-api.piresearchlabs.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback helper to retrieve authorization token dynamically from the Zustand store
let getAuthToken: (() => string | null) | null = null;

export const setAuthTokenLoader = (fn: () => string | null) => {
  getAuthToken = fn;
};

// Request interceptor to automatically inject JWT Bearer Token if available
apiClient.interceptors.request.use(
  async (config) => {
    if (getAuthToken) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ==========================================================================
   API Endpoint Wrappers
   ========================================================================== */

/**
 * Authenticates merchant and retrieves session JWT token
 * @param phone_number Merchant's registered phone number
 * @param password Merchant's password
 */
export const authLogin = async (phone_number: string, password: string) => {
  const response = await apiClient.post('/auth/login', { phone_number, password });
  return response.data; // { access_token, token_type, enterprise_id, proprietor_name }
};

/**
 * Verifies active session token and fetches identity details on startup
 */
export const authMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data; // { role, enterprise_id, proprietor_name }
};

/**
 * Fetches core enterprise summary card and forecasts
 * @param id Enterprise ID
 */
export const getEnterprise = async (id: string) => {
  const response = await apiClient.get(`/enterprise/${id}`);
  return response.data; // { card: {...}, live_forecast: [...], latest_alert: {...} }
};

/**
 * Fetches "udhaar book" receivables ageing records
 * @param id Enterprise ID
 */
export const getReceivables = async (id: string) => {
  const response = await apiClient.get(`/enterprise/${id}/receivables`);
  return response.data;
};

/**
 * Fetches average digital vs cash payment shares (including recent 90 days)
 * @param id Enterprise ID
 */
export const getPaymentMix = async (id: string) => {
  const response = await apiClient.get(`/enterprise/${id}/payment-mix`);
  return response.data;
};

/**
 * Fetches daily digital share % history for a github-like activity heatmap
 * @param id Enterprise ID
 */
export const getDigitalHeatmap = async (id: string) => {
  const response = await apiClient.get(`/enterprise/${id}/digital-heatmap`);
  return response.data;
};

/**
 * Fetches historical weekly cashflow entries (Monday start)
 * @param id Enterprise ID
 * @param weeks Trailing weeks limit (1 - 156)
 */
export const getWeeklyCashflow = async (id: string, weeks?: number) => {
  const url = weeks ? `/enterprise/${id}/weekly-cashflow?weeks=${weeks}` : `/enterprise/${id}/weekly-cashflow`;
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Fetches 6-month forecast band data points
 * @param id Enterprise ID
 */
export const getCashflowForecast = async (id: string) => {
  const response = await apiClient.get(`/enterprise/${id}/cashflow-forecast`);
  return response.data;
};

/**
 * Fetches net cashflow inflow per week (last 7 weeks)
 * @param id Enterprise ID
 */
export const getNetInflowHeatmap = async (id: string) => {
  const response = await apiClient.get(`/enterprise/${id}/net-inflow-heatmap`);
  return response.data;
};

/**
 * Serves risk stress prediction scores
 * @param id Enterprise ID
 */
export const getRiskPredict = async (id: string) => {
  const response = await apiClient.get(`/risk/${id}/predict`);
  return response.data;
};

/**
 * Uploads a local voice note audio recording to STT transcription service
 * @param fileUri Local device URI of the audio file (.m4a / .mp3 / .wav)
 * @param channel Source channel ('app' | 'ivr' | 'assisted')
 * @param deviceId Optional identifier for the mobile device
 * @param spokenAt Optional timestamp when note was captured
 */
export const postVoiceEntry = async (
  fileUri: string,
  channel: 'app' | 'ivr' | 'assisted' = 'app',
  deviceId?: string,
  spokenAt?: string
) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: 'note.m4a',
    type: 'audio/m4a',
  } as any);
  formData.append('channel', channel);
  if (deviceId) {
    formData.append('device_id', deviceId);
  }
  if (spokenAt) {
    formData.append('spoken_at', spokenAt);
  }

  const response = await apiClient.post('/voice/entries', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/* ==========================================================================
   Market Intelligence APIs & Types
   ========================================================================== */

export interface MarketCategory {
  sub_type_id: string;          // e.g. "ST02"
  sub_type: string;             // e.g. "Poultry Unit (broiler)"
  sector: string;               // e.g. "POULTRY"
  typical_daily_turnover?: number;
  is_merchant_primary?: boolean; // true if this is the logged-in merchant's category
}

export interface MarketRiskCard {
  risk_type: string;   // e.g. "Demand cliff"
  detail: string;      // e.g. "Festival demand collapse during Shrawan & Navratri"
  severity: 'high' | 'medium' | 'low' | string;
}

export interface MarketChartPoint {
  month: string;       // e.g. "Aug", "Sep"
  price_index: number; // e.g. 92.0
  rainfall_mm: number; // e.g. 380.0
}

export interface MarketIntelligenceDetail {
  sub_type_id: string;
  sub_type: string;
  sector: string;
  enterprise_id?: string | null; // e.g. "ENT-10492" (if merchant-scoped)
  district?: string | null;      // e.g. "Solapur" (if merchant-scoped)
  tracked_commodity: string;
  price_trend_12m_pct: number;
  productivity_outlook: string;
  seasonal_pattern: string;
  chart_data: MarketChartPoint[];
  risks: MarketRiskCard[];
}

/**
 * Fetch Categories (Pass enterpriseId if in Merchant Portal)
 */
export const getMarketCategories = async (enterpriseId?: string): Promise<MarketCategory[]> => {
  const params = enterpriseId ? { enterprise_id: enterpriseId } : {};
  const response = await apiClient.get<MarketCategory[]>('/market-intelligence/categories', { params });
  return response.data;
};

/**
 * Fetch Market Intelligence Details (Supports subType OR enterpriseId)
 */
export const getMarketIntelligence = async (options?: {
  subType?: string;
  enterpriseId?: string;
}): Promise<MarketIntelligenceDetail> => {
  const params: Record<string, string> = {};
  if (options?.subType) params.sub_type = options.subType;
  if (options?.enterpriseId) params.enterprise_id = options.enterpriseId;

  const response = await apiClient.get<MarketIntelligenceDetail>('/market-intelligence', { params });
  return response.data;
};

/* ==========================================================================
   Ledger & Daily Totals APIs & Types
   ========================================================================== */

export interface Transaction {
  entry_id: string;
  enterprise_id: string;
  event_date: string;
  recorded_at: string;
  direction: 'inflow' | 'outflow' | string;
  amount: string; // Note: amount is returned as a string from the backend (e.g. "1250.00")
  category: string;
  tender: string;
  is_household: boolean;
  source: string;
  confidence: string;
  voice_id: string | null;
  transcript: string | null;
  detected_lang: string | null;
  channel: string | null;
}


export interface GetTransactionsResponse {
  transactions: Transaction[];
  total: number; // Unpaged total count of transactions for the filter
}

export interface DailyTotalsResponse {
  enterprise_id: string;
  event_date: string;
  total_inflow: string;
  total_expenses: string; // Backend uses total_expenses
  net: string;
  txn_count: number;
  live_inflow: string;
  live_outflow: string;
  live_txn_count: number;
  has_live_entries: boolean;
  inflow_count: number;
  outflow_count: number;
}

/**
 * Fetch paged, real transactions from the ledger (voided rows & superseded corrections removed)
 * @param id Enterprise ID
 * @param params Optional page, limit, and date_from/date_to filters
 */
export const getTransactions = async (
  id: string,
  params: {
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
  } = {}
): Promise<GetTransactionsResponse> => {
  const response = await apiClient.get<GetTransactionsResponse>(`/enterprise/${id}/transactions`, { params });
  return response.data;
};

export interface PostTransactionRequest {
  direction: 'inflow' | 'outflow' | string;
  amount: number;
  category: string;
  tender?: string;
  voice_id?: string | null;
}

/**
 * Record a new transaction entry (manual or voice-derived)
 * @param enterpriseId Enterprise ID
 * @param data Transaction payload
 */
export const postTransaction = async (
  enterpriseId: string,
  data: PostTransactionRequest
): Promise<Transaction> => {
  const response = await apiClient.post<Transaction>(`/enterprise/${enterpriseId}/transactions`, data);
  return response.data;
};

/**
 * Fetch daily cashflow totals (money in/out) for the enterprise
 * @param id Enterprise ID
 * @param date Optional ISO date string (YYYY-MM-DD), defaults to today
 */
export const getDailyTotals = async (
  id: string,
  date?: string
): Promise<DailyTotalsResponse> => {
  const params = date ? { date } : {};
  const response = await apiClient.get<DailyTotalsResponse>(`/enterprise/${id}/daily-totals`, { params });
  return response.data;
};

