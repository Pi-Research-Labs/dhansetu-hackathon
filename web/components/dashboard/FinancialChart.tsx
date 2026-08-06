"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";
import {
  LiveForecastItem,
  getWeeklyCashflow,
  getCashflowForecast,
  WeeklyCashflowItem,
  CashflowForecastItem,
} from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import { Enterprise } from "@/types/enterprise";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { TrendingUp, Clock, Loader2, ShieldCheck } from "lucide-react";

interface FinancialChartProps {
  enterprise: Enterprise;
  liveForecast?: LiveForecastItem[] | null;
  t: TranslationDictionary;
}

export default function FinancialChart({ enterprise, liveForecast, t }: FinancialChartProps) {
  const [activeTab, setActiveTab] = useState<"forecast" | "history">("forecast");

  // Live API States
  const [weeklyCashflow, setWeeklyCashflow] = useState<WeeklyCashflowItem[]>([]);
  const [cashflowForecast, setCashflowForecast] = useState<CashflowForecastItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(false);

  const enterpriseId = enterprise?.id;

  // Fetch live API data for Weekly Cashflow (History) and Cashflow Forecast (Forecast)
  useEffect(() => {
    if (!enterpriseId) return;

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        setIsLoadingHistory(true);
        setIsLoadingForecast(true);
      }
    });

    // 1. GET /enterprise/{id}/weekly-cashflow (trailing 26 weeks)
    getWeeklyCashflow(enterpriseId, 26)
      .then((data) => {
        if (isMounted) setWeeklyCashflow(data || []);
      })
      .catch(() => {
        if (isMounted) setWeeklyCashflow([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    // 2. GET /enterprise/{id}/cashflow-forecast (6-horizon forecast)
    getCashflowForecast(enterpriseId)
      .then((data) => {
        if (isMounted) setCashflowForecast(data || []);
      })
      .catch(() => {
        if (isMounted) setCashflowForecast([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingForecast(false);
      });

    return () => {
      isMounted = false;
    };
  }, [enterpriseId]);

  // Construct Forecast Graph Data: Prioritize getCashflowForecast -> liveForecast prop -> enterprise.monthlyForecast fallback
  const forecastData = useMemo(() => {
    if (cashflowForecast && cashflowForecast.length > 0) {
      return cashflowForecast.map((item) => ({
        month: item.horizon_label || `${item.horizon_days}D`,
        forecast: item.p50,
        lower: item.p10,
        upper: item.p90,
        endDate: item.horizon_end_date,
      }));
    }

    if (liveForecast && liveForecast.length > 0) {
      return liveForecast.map((item) => ({
        month: `${item.horizon_days}D`,
        forecast: item.p50,
        lower: item.p10,
        upper: item.p90,
        endDate: item.horizon_end_date,
      }));
    }

    return enterprise.monthlyForecast.map((val, idx) => ({
      month: `M${idx + 1}`,
      forecast: val,
      lower: enterprise.forecastBand[idx]?.[0] || val * 0.7,
      upper: enterprise.forecastBand[idx]?.[1] || val * 1.3,
      endDate: "",
    }));
  }, [cashflowForecast, liveForecast, enterprise]);

  // Construct History Graph Data: Prioritize weeklyCashflow -> enterprise.history fallback
  const historyData = useMemo(() => {
    if (weeklyCashflow && weeklyCashflow.length > 0) {
      return weeklyCashflow.map((item) => ({
        w: item.week_start ? item.week_start.slice(5) : "",
        fullWeek: `${item.week_start} to ${item.week_end}`,
        inflow: item.inflow,
        outflow: item.outflow,
        net: item.net,
        zeroDays: item.zero_txn_days,
      }));
    }

    return enterprise.history.map((item) => ({
      w: item.w,
      fullWeek: item.w,
      inflow: item.inflow,
      outflow: item.outflow,
      net: item.net,
      zeroDays: 0,
    }));
  }, [weeklyCashflow, enterprise]);

  // Extract Confidence Score from live Cashflow Forecast if available
  const activeConfidenceScore = cashflowForecast?.[0]?.confidence_score;
  const activeConfidenceLabel = cashflowForecast?.[0]?.confidence_label;

  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs">
      <div className="flex flex-wrap items-center justify-between border-b border-[#E2E6D8] pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-[#2E7D32] text-white shadow-2xs"
                : "bg-[#FAFBF6] text-[#5F6656] border border-[#E2E6D8] hover:text-[#1A2016]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.dash.historyTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("forecast")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "forecast"
                ? "bg-[#2E7D32] text-white shadow-2xs"
                : "bg-[#FAFBF6] text-[#5F6656] border border-[#E2E6D8] hover:text-[#1A2016]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.dash.forecastTab}</span>
          </button>
        </div>

        {/* Right Info Header / Confidence Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-[#5F6656] font-mono">
          {activeTab === "forecast" ? (
            isLoadingForecast ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 text-[#2E7D32] animate-spin" />
                <span>Fetching API Forecast...</span>
              </span>
            ) : activeConfidenceScore !== undefined ? (
              <span className="bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {activeConfidenceLabel ? activeConfidenceLabel.toUpperCase() : "LIVE"} Confidence (
                  {Math.round(activeConfidenceScore * 100)}%)
                </span>
              </span>
            ) : (
              <span className="hidden sm:inline">Projected net cash flow with confidence band</span>
            )
          ) : isLoadingHistory ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 text-[#2E7D32] animate-spin" />
              <span>Fetching API History...</span>
            </span>
          ) : (
            <span className="hidden sm:inline">
              {weeklyCashflow.length > 0
                ? `Trailing ${weeklyCashflow.length} Weeks Inflows / Outflows`
                : "Weekly inflows / outflows with net line"}
            </span>
          )}
        </div>
      </div>

      {/* Recharts Graph Container */}
      <div className="h-60 w-full">
        {activeTab === "forecast" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#5F6656" }} />
              <YAxis tick={{ fontSize: 10, fill: "#5F6656" }} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#E2E6D8",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val: unknown, name?: unknown) => [
                  formatCurrency(Number(val)),
                  name === "forecast"
                    ? "Expected Cash Flow"
                    : name === "upper"
                    ? "Best Case (if things go well)"
                    : "Worst Case (if things go bad)",
                ]}
              />
              <ReferenceLine y={0} stroke="#C62828" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#2E7D32" fillOpacity={0.15} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />
              <Line type="monotone" dataKey="forecast" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="w" tick={{ fontSize: 10, fill: "#5F6656" }} />
              <YAxis tick={{ fontSize: 10, fill: "#5F6656" }} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#E2E6D8",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val: unknown, name?: unknown) => [
                  formatCurrency(Number(val)),
                  name === "inflow"
                    ? "Inflow"
                    : name === "outflow"
                    ? "Outflow"
                    : "Net Cash",
                ]}
              />
              <ReferenceLine y={0} stroke="#E2E6D8" />
              <Bar dataKey="inflow" fill="#2E7D32" opacity={0.4} barSize={7} name="inflow" />
              <Bar dataKey="outflow" fill="#C62828" opacity={0.35} barSize={7} name="outflow" />
              <Line dataKey="net" stroke="#1A2016" strokeWidth={2} dot={false} name="net" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

