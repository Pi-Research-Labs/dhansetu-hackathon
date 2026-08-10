import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SupportedLang } from '@/i18n/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authLogin,
  authMe,
  getEnterprise,
  getPaymentMix,
  getWeeklyCashflow,
  getDigitalHeatmap,
  getNetInflowHeatmap,
  getCashflowForecast,
  getReceivables,
  getRiskPredict,
  setAuthTokenLoader,
  getDailyTotals,
  DailyTotalsResponse,
} from '@/utils/api-config';

export interface Entry {
  id: string;
  type: 'income' | 'expense' | 'savdep' | 'savwd' | 'emi' | 'newloan';
  amount: number;
  note: string;
  date: string;
  /** false until the server has accepted this entry. Entries are written
   *  locally first so recording still works with no signal -- rural
   *  connectivity is exactly when a merchant is standing at the shop. */
  synced?: boolean;
  /** entry_id returned by the backend, once synced */
  serverId?: string;
  /** How this entry was created */
  source?: 'manual' | 'voice' | 'sms';
  /** Dedup key for SMS-sourced entries to prevent duplicate detection */
  dedupKey?: string;
}

export interface TodaysTotals {
  date: string;
  total_inflow: number;
  total_outflow: number;
  live_inflow: number;
  live_outflow: number;
}

export interface MerchantStore {
  // Language
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  hasChosenLang: boolean;
  setHasChosenLang: (val: boolean) => void;

  // Auth State
  isAuthenticated: boolean;
  token: string | null;
  enterpriseId: string | null;
  proprietorName: string | null;
  login: (phone: string, token: string, enterpriseId: string, proprietorName: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  fetchMerchantData: () => Promise<void>;

  // Merchant details
  name: string;
  segment: string;
  district: string;
  phone: string;
  gstin: string;
  tier: 'GREEN' | 'AMBER' | 'RED';
  score: number;

  // Financial metrics
  net90: number;
  savings: number;
  runwayMonths: number;
  missedEmi: number;
  loan: number;
  emi: number;
  upiShare: number;
  appShare: number;
  cashShare: number;

  // Weekly historical data
  weeklyHistory: { week: string; weekLabel: string; dateRange: string; inflow: number; outflow: number; net: number }[];
  // New data arrays
  digitalHeatmap: Array<{ enterprise_id: string; event_date: string; digital_share_pct: number; cash_share_pct: number; is_zero_txn_day: boolean }>;
  netInflowHeatmap: Array<{ enterprise_id: string; week_start: string; week_end: string; net_inflow: number }>;
  cashflowForecast: Array<{ enterprise_id: string; horizon_days: number; horizon_label: string; p10: number; p50: number; p90: number; confidence_score: number; confidence_label: string }>;
  receivables: any[];
  riskPrediction: any | null;
  todaysTotals: TodaysTotals;

  // Risk Flags & Advice
  flags: { key: string; tag: string; detail: string }[];
  advice: string[];

  // Unread alerts indicator
  hasUnreadAlerts: boolean;
  markAlertsAsRead: () => void;

  // SMS Auto-Detect
  smsAutoDetectEnabled: boolean;
  setSmsAutoDetectEnabled: (enabled: boolean) => void;
  smsDetectedCount: number;
  incrementSmsDetectedCount: () => void;
  smsHistoricalScanDone: boolean;
  setSmsHistoricalScanDone: (done: boolean) => void;
  /** Check if a dedup key already exists in recent entries */
  hasDedupKey: (key: string) => boolean;

  // Entries ledger
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id' | 'date'>) => string;
  markEntrySynced: (localId: string, serverId: string) => void;
}

export const useMerchantStore = create<MerchantStore>()(
  persist(
    (set, get) => ({
      lang: 'en',
  setLang: (lang) => {
    set({ lang });
    AsyncStorage.setItem('@dhansetu_lang', lang).catch((e) => console.log('Error saving lang', e));
  },
  hasChosenLang: false,
  setHasChosenLang: (hasChosenLang) => {
    set({ hasChosenLang });
    AsyncStorage.setItem('@dhansetu_has_chosen_lang', hasChosenLang ? 'true' : 'false').catch((e) => console.log('Error saving chosen lang', e));
  },

  // Auth Initial State
  isAuthenticated: false,
  token: null,
  enterpriseId: null,
  proprietorName: null,

  // Merchant Details Initial State
  name: 'Loading Business...',
  segment: 'General Retail',
  district: 'India',
  phone: '',
  gstin: '',
  tier: 'GREEN',
  score: 100,

  // Financial Metrics Initial State
  net90: 0,
  savings: 0,
  runwayMonths: 0,
  missedEmi: 0,
  loan: 0,
  emi: 0,
  upiShare: 0.33,
  appShare: 0.33,
  cashShare: 0.34,

  // Lists
  weeklyHistory: [],
  digitalHeatmap: [],
  netInflowHeatmap: [],
  cashflowForecast: [],
  receivables: [],
  riskPrediction: null,
  flags: [],
  advice: [],
  hasUnreadAlerts: true,
  entries: [],
  todaysTotals: {
    date: new Date().toISOString().split('T')[0],
    total_inflow: 0,
    total_outflow: 0,
    live_inflow: 0,
    live_outflow: 0,
  },

  // Login Action
  login: async (phone, token, enterpriseId, proprietorName) => {
    set({
      isAuthenticated: true,
      token,
      enterpriseId,
      proprietorName,
      phone,
      gstin: enterpriseId,
    });
    try {
      await AsyncStorage.setItem('@dhansetu_token', token);
    } catch (e) {
      console.log('Error saving auth token', e);
    }
    // Immediately fetch details for this merchant enterprise
    await get().fetchMerchantData();
  },

  // Logout Action
  logout: () => {
    set({
      isAuthenticated: false,
      token: null,
      enterpriseId: null,
      proprietorName: null,
      name: 'Logged Out',
      weeklyHistory: [],
      receivables: [],
      riskPrediction: null,
      flags: [],
      advice: [],
      entries: [],
    });
    // AsyncStorage.removeItem('@dhansetu_token').catch((e) => console.log('Error removing auth token', e));
  },

  markAlertsAsRead: () => {
    set({ hasUnreadAlerts: false });
  },

  // SMS Auto-Detect State
  smsAutoDetectEnabled: true,
  setSmsAutoDetectEnabled: (enabled) => {
    set({ smsAutoDetectEnabled: enabled });
    AsyncStorage.setItem('@dhansetu_sms_auto_detect', enabled ? 'true' : 'false').catch((e) => console.log('Error saving sms toggle', e));
  },
  smsDetectedCount: 0,
  incrementSmsDetectedCount: () => set((state) => ({ smsDetectedCount: state.smsDetectedCount + 1 })),
  smsHistoricalScanDone: false,
  setSmsHistoricalScanDone: (done) => {
    set({ smsHistoricalScanDone: done });
    AsyncStorage.setItem('@dhansetu_sms_scan_done', done ? 'true' : 'false').catch((e) => console.log('Error saving scan flag', e));
  },
  hasDedupKey: (key) => {
    const entries = get().entries;
    return entries.some((e) => e.dedupKey === key);
  },

  // Restore Session Action
  restoreSession: async () => {
    // Wait for store rehydration if it hasn't finished yet
    if (!useMerchantStore.persist.hasHydrated()) {
      await new Promise<void>((resolve) => {
        const unsub = useMerchantStore.persist.onFinishHydration(() => {
          unsub();
          resolve();
        });
      });
    }

    try {
      const savedToken = get().token;
      if (!savedToken) return false;

      const data = await authMe();

      set({
        isAuthenticated: true,
        token: savedToken,
        enterpriseId: data.enterprise_id,
        proprietorName: data.proprietor_name,
        phone: data.phone_number || '',
        gstin: data.enterprise_id,
      });

      // Load all data
      await get().fetchMerchantData();
      return true;
    } catch (error) {
      console.log('Restore session failed:', error);
      set({
        isAuthenticated: false,
        token: null,
        enterpriseId: null,
        proprietorName: null,
        receivables: [],
        riskPrediction: null,
      });
      return false;
    }
  },

  // Fetch Merchant Dashboard Metrics & Charts
  fetchMerchantData: async () => {
    const enterpriseId = get().enterpriseId;
    if (!enterpriseId) return;

    try {
      // Call endpoints in parallel for fast loading
      const [entData, paymentMix, weeklyData, digitalData, netInflowData, forecastData, receivablesData, riskPredictData, dailyTotalsRaw] = await Promise.all([
        getEnterprise(enterpriseId),
        getPaymentMix(enterpriseId),
        getWeeklyCashflow(enterpriseId, 26),
        getDigitalHeatmap(enterpriseId),
        getNetInflowHeatmap(enterpriseId),
        getCashflowForecast(enterpriseId),
        getReceivables(enterpriseId).catch(() => []),
        getRiskPredict(enterpriseId).catch(() => null),
        getDailyTotals(enterpriseId).catch(() => null),
      ]);

      const dailyTotalsData: TodaysTotals = dailyTotalsRaw ? {
        date: dailyTotalsRaw.event_date,
        total_inflow: parseFloat(dailyTotalsRaw.total_inflow) || 0,
        total_outflow: parseFloat(dailyTotalsRaw.total_expenses) || 0,
        live_inflow: parseFloat(dailyTotalsRaw.live_inflow) || 0,
        live_outflow: parseFloat(dailyTotalsRaw.live_outflow) || 0,
      } : {
        date: new Date().toISOString().split('T')[0],
        total_inflow: 0,
        total_outflow: 0,
        live_inflow: 0,
        live_outflow: 0,
      };

      const card = entData.card || {};
      const latestAlert = entData.latest_alert;

      // Map backend reason codes to localized early warning flags
      const reasonMapping: Record<string, { tag: string; detail: string }> = {
        margin_squeeze: {
          tag: 'Margin Squeeze',
          detail: card.margin_gap_90d
            ? `Severe pressure on input costs compressing operating margins (margin gap: ${card.margin_gap_90d}%).`
            : 'Severe pressure on input costs compressing operating margins.',
        },
        working_capital_erosion: {
          tag: 'Working Capital Erosion',
          detail: 'Declining cash buffers relative to ongoing operating expenses.',
        },
        debt_overhang: {
          tag: 'Debt Overhang',
          detail: 'Elevated total debt service burden relative to projected net cashflows.',
        },
        repayment_stress: {
          tag: 'Repayment Stress',
          detail: card.missed_emi
            ? `${card.missed_emi} missed EMI(s) in the last 90 days. High risk of default.`
            : 'Failing to meet repayment schedules due to localized income drops.',
        },
        spend_exceeds: {
          tag: 'Spend Exceeds Earnings',
          detail: 'Outflows exceeding inflows over recent trailing periods.',
        },
        thin_buffer: {
          tag: 'Thin Savings Buffer',
          detail: card.net_buffer_days
            ? `Cash runway covers only ${Math.max(0, card.net_buffer_days / 30).toFixed(1)} months of typical outflows.`
            : 'Savings cover less than a single month of typical outflows.',
        },
      };

      const flags: { key: string; tag: string; detail: string }[] = [];
      if (card.reason_1 && reasonMapping[card.reason_1]) {
        flags.push({ key: card.reason_1, ...reasonMapping[card.reason_1] });
      }
      if (card.reason_2 && reasonMapping[card.reason_2]) {
        flags.push({ key: card.reason_2, ...reasonMapping[card.reason_2] });
      }
      if (card.reason_3 && reasonMapping[card.reason_3]) {
        flags.push({ key: card.reason_3, ...reasonMapping[card.reason_3] });
      }

      // Default fallback warning flag
      if (flags.length === 0 && card.risk_tier !== 'GREEN') {
        flags.push({
          key: 'cashflow_variance',
          tag: 'Cashflow Stress',
          detail: 'Cashflow variance detected compared to historical baseline. Monitor closely.',
        });
      }

      // Map recommended actions
      const adviceList: string[] = [];
      if (latestAlert && latestAlert.actions) {
        latestAlert.actions.forEach((act: any) => {
          const actionSuggestions: Record<string, string> = {
            prebook_input: 'Pre-book inputs at fixed rates to shield margins from commodity price spikes.',
            liquidate_noncore: 'Liquidate low-yielding non-core assets to augment working capital reserves.',
            defer_expansion: 'Postpone non-essential capital expenditures and scale back inventory buffers.',
            refinance_debt: 'Consolidate short-term loans or discuss tenure extension with your nodal banker.',
            collect_receivables: 'Accelerate collection of outstanding customer receivables (udhaar book).',
          };
          if (actionSuggestions[act.action_key]) {
            adviceList.push(actionSuggestions[act.action_key]);
          }
        });
      }

      // Fallback advice if none returned
      if (adviceList.length === 0) {
        adviceList.push(
          'Monitor cash inflows closely and optimize supplier payment terms to preserve working capital.',
          'Build up a liquid savings reserve during surplus weeks to cushion against seasonal downturns.',
          'Discuss flexible credit lines with your cooperative bank or nodal officer.'
        );
      }

      // Map weekly history
      const getWeekOfMonthAndRange = (dateStr: string) => {
        const startDate = new Date(dateStr);
        if (isNaN(startDate.getTime())) {
          return {
            week: dateStr,
            weekLabel: `Week of ${dateStr}`,
            dateRange: dateStr,
          };
        }

        const weekNum = Math.ceil(startDate.getDate() / 7);
        const monthName = startDate.toLocaleDateString('en-IN', { month: 'long' });
        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
        const weekOrdinal = ordinals[weekNum - 1] || 'First';
        const weekLabel = `${weekOrdinal} week of ${monthName}`;

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
        const startStr = startDate.toLocaleDateString('en-IN', formatOptions);
        const endStr = endDate.toLocaleDateString('en-IN', formatOptions);
        const dateRange = `${startStr} to ${endStr}`;

        const weekShort = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        return {
          week: weekShort,
          weekLabel,
          dateRange,
        };
      };

      const weeklyHistory = (weeklyData || []).map((item: any) => {
        const info = getWeekOfMonthAndRange(item.week_start);
        return {
          ...info,
          inflow: Math.round(parseFloat(item.inflow) || 0),
          outflow: Math.round(parseFloat(item.outflow) || 0),
          net: Math.round(parseFloat(item.net) || 0),
        };
      });

      // Update Zustand state fields
      set({
        name: card.business_name || card.proprietor_name || get().proprietorName || 'DhanSetu Merchant',
        segment: card.sector || 'General Retail',
        district: paymentMix.district || 'District Centroid',
        gstin: card.enterprise_id || get().enterpriseId || 'GSTIN-PENDING',
        tier: card.risk_tier || 'GREEN',
        score: Math.round((card.score || 0) * 100),

        // Financial Metrics
        net90: parseFloat(card.forecast_net_90d_p50) || 0,
        savings: card.savings !== undefined ? parseFloat(card.savings) : 
                (card.savings_balance !== undefined ? parseFloat(card.savings_balance) : 
                (parseFloat(card.net_buffer_days) > 0 ? parseFloat(card.net_buffer_days) * 3500 : 85000)),
        runwayMonths: Number((card.savings_runway_days ? parseFloat(card.savings_runway_days) / 30 : (card.net_buffer_days ? parseFloat(card.net_buffer_days) / 30 : 0)).toFixed(2)),
        missedEmi: card.missed_emis_90d ?? card.missed_emi ?? (parseFloat(card.net_buffer_days) < -10 ? 2 : 0),
        loan: parseFloat(card.informal_debt ?? card.loan) || (parseFloat(card.bridge_headroom) > 0 ? 350000 : 0),
        emi: parseFloat(card.emi ?? card.monthly_emi ?? card.suggested_max_emi) || 0,

        // Payment Shares
        upiShare: paymentMix.avg_digital_share ?? 0.5,
        appShare: paymentMix.avg_wallet_share ?? 0.1,
        cashShare: paymentMix.avg_cash_share ?? 0.4,

        weeklyHistory,
        digitalHeatmap: digitalData,
        netInflowHeatmap: netInflowData,
        cashflowForecast: forecastData,
        receivables: (receivablesData || []).map((item: any) => ({
          ...item,
          total: parseFloat(item.total) || 0,
          written_off: parseFloat(item.written_off) || 0,
          write_off_pct: parseFloat(item.write_off_pct) || 0,
        })),
        riskPrediction: riskPredictData || null,
        flags,
        advice: adviceList,
        hasUnreadAlerts: flags.length > 0,
        todaysTotals: dailyTotalsData,
      });
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    }
  },

  // Local additions to transaction entry list
  // Returns the local id so the caller can mark it synced once the server
  // accepts it. Local-first on purpose: the entry is on screen immediately
  // and survives a failed request, rather than being lost with the network.
  addEntry: (newEntry) => {
    const localId = `e_${Date.now()}`;
    set((state) => ({
      entries: [
        {
          ...newEntry,
          id: localId,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          synced: false,
        },
        ...state.entries,
      ],
    }));
    return localId;
  },

  markEntrySynced: (localId, serverId) => set((state) => ({
    entries: state.entries.map((e) =>
      e.id === localId ? { ...e, synced: true, serverId } : e
    ),
  })),
}), {
  name: 'dhansetu-merchant-storage',
  storage: createJSONStorage(() => AsyncStorage),
}));

// Wire up the token loader to feed the Axios instance on demand
setAuthTokenLoader(() => useMerchantStore.getState().token);
