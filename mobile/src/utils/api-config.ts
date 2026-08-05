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
