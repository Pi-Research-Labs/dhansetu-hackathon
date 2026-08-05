import { create } from 'zustand';
import { SupportedLang } from '@/i18n/translations';
import {
  authLogin,
  getEnterprise,
  getPaymentMix,
  getWeeklyCashflow,
  getDigitalHeatmap,
  getNetInflowHeatmap,
  getCashflowForecast,
  setAuthTokenLoader,
} from '@/utils/api-config';

export interface Entry {
  id: string;
  type: 'income' | 'expense' | 'savdep' | 'savwd' | 'emi' | 'newloan';
  amount: number;
  note: string;
  date: string;
}

export interface MarketRisk {
  tag: string;
  severity: 'high' | 'medium' | 'low';
  desc: string;
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
  weeklyHistory: { week: string; inflow: number; outflow: number; net: number }[];
  // New data arrays
  digitalHeatmap: Array<{ enterprise_id: string; event_date: string; digital_share_pct: number; cash_share_pct: number; is_zero_txn_day: boolean }>;
  netInflowHeatmap: Array<{ enterprise_id: string; week_start: string; week_end: string; net_inflow: number }>;
  cashflowForecast: Array<{ enterprise_id: string; horizon_days: number; horizon_label: string; p10: number; p50: number; p90: number; confidence_score: number; confidence_label: string }>;


  // Risk Flags & Advice
  flags: { key: string; tag: string; detail: string }[];
  advice: string[];

  // Entries ledger
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id' | 'date'>) => void;
}

export const useMerchantStore = create<MerchantStore>((set, get) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  hasChosenLang: false,
  setHasChosenLang: (hasChosenLang) => set({ hasChosenLang }),

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
  flags: [],
  advice: [],
  entries: [],

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
      flags: [],
      advice: [],
      entries: [],
    });
  },

  // Fetch Merchant Dashboard Metrics & Charts
  fetchMerchantData: async () => {
    const enterpriseId = get().enterpriseId;
    if (!enterpriseId) return;

    try {
      // Call endpoints in parallel for fast loading
      const [entData, paymentMix, weeklyData, digitalData, netInflowData, forecastData] = await Promise.all([
        getEnterprise(enterpriseId),
        getPaymentMix(enterpriseId),
        getWeeklyCashflow(enterpriseId, 26),
        getDigitalHeatmap(enterpriseId),
        getNetInflowHeatmap(enterpriseId),
        getCashflowForecast(enterpriseId),
      ]);

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
      const formatWeek = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      };

      const weeklyHistory = (weeklyData || []).map((item: any) => ({
        week: formatWeek(item.week_start),
        inflow: item.inflow,
        outflow: item.outflow,
        net: item.net,
      }));

      // Update Zustand state fields
      set({
        name: card.business_name || card.proprietor_name || get().proprietorName || 'DhanSetu Merchant',
        segment: card.sector || 'General Retail',
        district: paymentMix.district || 'District Centroid',
        gstin: card.enterprise_id || get().enterpriseId || 'GSTIN-PENDING',
        tier: card.risk_tier || 'GREEN',
        score: Math.round((card.score || 0) * 100),

        // Financial Metrics
        net90: card.forecast_net_90d_p50 || card.forecast_net_90d_p50 === 0 ? card.forecast_net_90d_p50 : 0,
        savings: card.savings ?? card.savings_balance ?? (card.net_buffer_days > 0 ? card.net_buffer_days * 3500 : 85000),
        runwayMonths: card.savings_runway_days ? card.savings_runway_days / 30 : (card.net_buffer_days ? card.net_buffer_days / 30 : 0),
        missedEmi: card.missed_emi ?? card.missed_emi_count ?? (card.net_buffer_days < -10 ? 2 : 0),
        loan: card.loan ?? card.loan_outstanding ?? (card.bridge_headroom > 0 ? 350000 : 0),
        emi: card.emi ?? card.monthly_emi ?? 0,

        // Payment Shares
        upiShare: paymentMix.avg_digital_share ?? 0.5,
        appShare: paymentMix.avg_wallet_share ?? 0.1,
        cashShare: paymentMix.avg_cash_share ?? 0.4,

        weeklyHistory,
        digitalHeatmap: digitalData,
        netInflowHeatmap: netInflowData,
        cashflowForecast: forecastData,
        flags,
        advice: adviceList,
      });
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    }
  },

  // Local additions to transaction entry list
  addEntry: (newEntry) => set((state) => ({
    entries: [
      {
        ...newEntry,
        id: `e_${Date.now()}`,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      },
      ...state.entries,
    ],
  })),
}));

// Wire up the token loader to feed the Axios instance on demand
setAuthTokenLoader(() => useMerchantStore.getState().token);
