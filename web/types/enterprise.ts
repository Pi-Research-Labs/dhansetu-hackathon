/**
 * Enterprise view model interface used across dashboard components
 */
export interface EnterpriseReason {
  key: string;
  tag: string;
  detail: string;
}

export interface EnterpriseMetrics {
  avgInflow30: number;
  outInRatio: number;
  zeroDays: number;
  volatility: number;
  trend: number;
  savings: number;
  runwayMonths: number;
  missedEmi: number;
  loan: number;
  emi: number;
  upiShare: number;
  appShare: number;
  digitalShare: number;
  dscr: number | null;
  creditHeadroom: number;
  suggestedEmi: number;
}

export interface EnterpriseHistoryItem {
  w: string;
  net: number;
  inflow: number;
  outflow: number;
}

export interface Enterprise {
  id: string;
  name: string;
  segment: string;
  district: string;
  phone: string;
  tier: "GREEN" | "AMBER" | "RED";
  score: number;
  confidence: { score: number; label: string };
  forecastBand: [number, number][];
  reasons: EnterpriseReason[];
  adviceKeys: string[];
  forecast90: number;
  forecast180: number;
  netNow90: number;
  monthlyForecast: number[];
  metrics: EnterpriseMetrics;
  history: EnterpriseHistoryItem[];
}
