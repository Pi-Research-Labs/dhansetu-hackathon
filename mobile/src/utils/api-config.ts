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

/**
 * Records a typed ledger entry on the server (POST /enterprise/{id}/transactions).
 *
 * The ledger only knows inflow/outflow, while the app's entry picker offers six
 * types, so the caller maps them (see LEDGER_MAPPING in AddEntryScreen) and
 * passes the resolved direction plus a category that keeps the original
 * meaning -- an EMI and a fodder purchase are both outflows, but the category
 * is what tells them apart later.
 *
 * `source` is NOT sent: the backend derives it from the token so a client
 * cannot claim to be something it isn't.
 */
export const postLedgerEntry = async (
  enterpriseId: string,
  entry: {
    direction: 'inflow' | 'outflow';
    amount: number;
    category: string;
    event_date?: string;
    tender?: string | null;
    is_household?: boolean;
    /** links the row to the utterance it came from, so the transaction list
     *  can show what was said beside the amount */
    voice_id?: string;
  }
) => {
  const res = await apiClient.post(`/enterprise/${enterpriseId}/transactions`, entry);
  return res.data;
};
