"use client";

import { useState } from "react";
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
import { Enterprise, formatCurrency } from "@/utils/mockData";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { TrendingUp, Clock } from "lucide-react";

interface FinancialChartProps {
  enterprise: Enterprise;
  t: TranslationDictionary;
}

export default function FinancialChart({ enterprise, t }: FinancialChartProps) {
  const [activeTab, setActiveTab] = useState<"forecast" | "history">("forecast");

  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs">
      <div className="flex items-center justify-between border-b border-[#E2E6D8] pb-3 mb-4">
        <div className="flex items-center gap-2">
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
        </div>

        <div className="text-[11px] text-[#5F6656] hidden sm:block">
          {activeTab === "forecast"
            ? "Projected monthly net cash flow with confidence band"
            : "Weekly inflows / outflows with net line"}
        </div>
      </div>

      {/* Recharts Graph */}
      <div className="h-60 w-full">
        {activeTab === "forecast" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={enterprise.monthlyForecast.map((val, idx) => ({
                month: `M${idx + 1}`,
                forecast: val,
                lower: enterprise.forecastBand[idx]?.[0] || val * 0.7,
                upper: enterprise.forecastBand[idx]?.[1] || val * 1.3,
              }))}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#5F6656" }} />
              <YAxis tick={{ fontSize: 10, fill: "#5F6656" }} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#E2E6D8",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val: unknown) => [formatCurrency(Number(val)), "Net Forecast"]}
              />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#2E7D32" fillOpacity={0.12} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />
              <Line type="monotone" dataKey="forecast" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3.5 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={enterprise.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="w" tick={{ fontSize: 10, fill: "#5F6656" }} />
              <YAxis tick={{ fontSize: 10, fill: "#5F6656" }} tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#E2E6D8",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <ReferenceLine y={0} stroke="#E2E6D8" />
              <Bar dataKey="inflow" fill="#2E7D32" opacity={0.4} barSize={7} name="Inflow" />
              <Bar dataKey="outflow" fill="#C62828" opacity={0.35} barSize={7} name="Outflow" />
              <Line dataKey="net" stroke="#1A2016" strokeWidth={2} dot={false} name="Net Cash" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
