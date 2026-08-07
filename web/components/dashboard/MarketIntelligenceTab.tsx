"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  fetchMarketCategories,
  fetchMarketIntelligence,
  MarketCategory,
  MarketIntelligenceDetail,
  MarketRiskCard,
} from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2,
  Calendar,
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E2E6D8] p-3 rounded-xl shadow-md text-xs font-sans">
        <p className="font-bold text-[#1A2016] mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => {
          const isPrice = entry.dataKey === "price_index";
          const color = isPrice ? "#2E7D32" : "#1565C0";
          const labelName = isPrice ? "Price Index" : "Rainfall";
          const valueSuffix = isPrice ? "" : " mm";
          return (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-[#5F6656] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                {labelName}
              </span>
              <span className="font-mono font-bold" style={{ color }}>
                {entry.value}{valueSuffix}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function MarketIntelligenceTab() {
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [selectedSubType, setSelectedSubType] = useState<string>("Dairy Producer");
  const [intel, setIntel] = useState<MarketIntelligenceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch categories list once on mount
  useEffect(() => {
    let isMounted = true;
    fetchMarketCategories()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setCategories(list);
          const hasDairy = list.some((cat) => cat.sub_type === "Dairy Producer");
          if (!hasDairy && list.length > 0) {
            setSelectedSubType(list[0].sub_type);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch market intel whenever selectedSubType changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchMarketIntelligence(selectedSubType)
      .then((data) => {
        if (isMounted) {
          setIntel(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch market intelligence", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load market intelligence data");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [selectedSubType]);

  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.sub_type === selectedSubType);
  }, [categories, selectedSubType]);

  if (loading && !intel) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs p-12 text-center text-xs text-[#5F6656] gap-3">
        <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
        <div>
          <h4 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            Loading Market Intelligence Insights...
          </h4>
          <p className="text-[10px] text-[#5F6656] mt-1 font-mono">
            Fetching sector pricing indices, commodity trends, and rainfall indicators
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs p-12 text-center text-xs text-[#C62828] gap-3">
        <AlertTriangle className="w-8 h-8 text-[#C62828]" />
        <div>
          <h4 className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
            Failed to load Market Intelligence
          </h4>
          <p className="text-[10px] text-[#5F6656] mt-1 font-mono mb-4">
            {error}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchMarketIntelligence(selectedSubType)
                .then(setIntel)
                .catch((e) => setError(e?.message || "Failed to load"))
                .finally(() => setLoading(false));
            }}
            className="px-4 py-2 border border-[#C62828] text-[#C62828] rounded-lg text-xs font-bold hover:bg-[#FFEBEE] transition-colors cursor-pointer"
          >
            Retry Fetching Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-y-auto space-y-5 pb-4 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2E7D32]/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin]">
      {/* Dropdown Selector row */}
      <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#5F6656] uppercase tracking-wider">
            Select Category Sub-Type
          </label>
          <div className="relative inline-block w-full md:w-64">
            <select
              value={selectedSubType}
              onChange={(e) => setSelectedSubType(e.target.value)}
              className="w-full appearance-none bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg px-3 py-2 text-xs font-bold text-[#1A2016] focus:outline-none focus:ring-1 focus:ring-[#2E7D32] focus:border-[#2E7D32] cursor-pointer pr-8"
            >
              {categories.map((cat) => (
                <option key={cat.sub_type_id} value={cat.sub_type}>
                  {cat.sub_type}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#5F6656]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {selectedCategory && (
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5F6656] uppercase">Sector:</span>
              <span className="font-mono font-bold text-[#2E7D32] uppercase">{selectedCategory.sector}</span>
            </div>
            <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5F6656] uppercase">ID:</span>
              <span className="font-mono font-bold text-[#5F6656]">{selectedCategory.sub_type_id}</span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch shrink-0">
        {/* Tracked Commodity */}
        <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6656] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Tracked Commodity</span>
          </div>
          <div>
            <div className="text-sm font-bold text-[#1A2016] font-sans leading-snug">
              {intel?.tracked_commodity || "N/A"}
            </div>
            <p className="text-[9.5px] text-[#5F6656] mt-0.5 leading-tight">
              Primary product or index monitored for pricing volatility
            </p>
          </div>
        </div>

        {/* 12-Month Price Trend */}
        <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6656] uppercase tracking-wider">
            {intel && intel.price_trend_12m_pct >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#2E7D32]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#C62828]" />
            )}
            <span>12-Mo Price Trend</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-extrabold font-mono ${intel && intel.price_trend_12m_pct >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                {intel ? `${intel.price_trend_12m_pct > 0 ? "+" : ""}${intel.price_trend_12m_pct}%` : "0%"}
              </span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm ${intel && intel.price_trend_12m_pct >= 0 ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#C62828]"}`}>
                {intel && intel.price_trend_12m_pct >= 0 ? "GROWING" : "DECLINING"}
              </span>
            </div>
            <p className="text-[9.5px] text-[#5F6656] mt-0.5 leading-tight">
              Percentage shift in baseline price index over last 12 months
            </p>
          </div>
        </div>

        {/* Typical Daily Turnover */}
        <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6656] uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-[#E65100]" />
            <span>Typical Daily Turnover</span>
          </div>
          <div>
            <div className="text-xl font-bold text-[#E65100] font-mono">
              {selectedCategory?.typical_daily_turnover ? formatCurrency(selectedCategory.typical_daily_turnover) : "N/A"}
            </div>
            <p className="text-[9.5px] text-[#5F6656] mt-0.5 leading-tight">
              Average daily transactions for enterprise type in local area
            </p>
          </div>
        </div>
      </div>

      {/* Chart & Narrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Chart Panel */}
        <div className="lg:col-span-8 bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between border-b border-[#E2E6D8] pb-2 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
                12-Month Price Index & Rainfall Chart
              </h3>
            </div>
            <span className="text-[9px] font-mono text-[#5F6656] bg-[#FAFBF6] border border-[#E2E6D8] px-2 py-0.5 rounded-sm uppercase">
              Dual-Axis Index
            </span>
          </div>
          
          <div className="flex-1 w-full min-h-[280px]">
            {intel?.chart_data && intel.chart_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart
                  data={intel.chart_data}
                  margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F2EB" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#5F6656", fontSize: 10, fontFamily: "monospace" }}
                    tickLine={{ stroke: "#E2E6D8" }}
                    axisLine={{ stroke: "#E2E6D8" }}
                  />
                  <YAxis
                    yAxisId="price"
                    orientation="left"
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tick={{ fill: "#2E7D32", fontSize: 10, fontFamily: "monospace" }}
                    tickLine={{ stroke: "#E2E6D8" }}
                    axisLine={{ stroke: "#E2E6D8" }}
                    label={{
                      value: "Price Index",
                      angle: -90,
                      position: "insideLeft",
                      offset: -5,
                      style: { fill: "#2E7D32", fontSize: 9, fontWeight: "bold", fontFamily: "sans-serif" },
                    }}
                  />
                  <YAxis
                    yAxisId="rainfall"
                    orientation="right"
                    domain={[0, "auto"]}
                    tick={{ fill: "#1565C0", fontSize: 10, fontFamily: "monospace" }}
                    tickLine={{ stroke: "#E2E6D8" }}
                    axisLine={{ stroke: "#E2E6D8" }}
                    label={{
                      value: "Rainfall (mm)",
                      angle: 90,
                      position: "insideRight",
                      offset: 5,
                      style: { fill: "#1565C0", fontSize: 9, fontWeight: "bold", fontFamily: "sans-serif" },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    wrapperStyle={{ fontSize: 10, fontFamily: "sans-serif", paddingBottom: 10 }}
                  />
                  <Bar
                    yAxisId="rainfall"
                    dataKey="rainfall_mm"
                    name="Rainfall (mm)"
                    fill="#BBDEFB"
                    radius={[2, 2, 0, 0]}
                    barSize={16}
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="price_index"
                    name="Price Index"
                    stroke="#2E7D32"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, stroke: "#2E7D32", strokeWidth: 1.5, fill: "#fff" }}
                    activeDot={{ r: 5, stroke: "#2E7D32", strokeWidth: 2, fill: "#2E7D32" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#5F6656] italic">
                No chart data available
              </div>
            )}
          </div>
        </div>

        {/* Narrative Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Productivity Outlook */}
          <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex-1 flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5F6656] uppercase tracking-wider border-b border-[#E2E6D8] pb-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Productivity Outlook</span>
            </div>
            <div className="text-xs text-[#1A2016] leading-relaxed flex-1 flex items-center">
              <p className="bg-[#FAFBF6] border border-[#E2E6D8]/60 p-3 rounded-lg w-full font-medium italic">
                "{intel?.productivity_outlook || "N/A"}"
              </p>
            </div>
          </div>

          {/* Seasonal Pattern */}
          <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex-1 flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5F6656] uppercase tracking-wider border-b border-[#E2E6D8] pb-1.5 mb-2.5">
              <Calendar className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Seasonal Pattern & Demand</span>
            </div>
            <div className="text-xs text-[#1A2016] leading-relaxed flex-1 flex items-center">
              <p className="bg-[#E3F2FD]/40 border border-[#BBDEFB]/60 p-3 rounded-lg w-full font-medium italic">
                "{intel?.seasonal_pattern || "N/A"}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Climate & Market Risk Cards */}
      <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-[#E2E6D8] pb-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-[#C62828]" />
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            Climate & Market Risk Assessment
          </h3>
        </div>

        {intel?.risks && intel.risks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            {intel.risks.map((risk: MarketRiskCard, idx: number) => {
              const isHigh = risk.severity.toLowerCase() === "high";
              const isMedium = risk.severity.toLowerCase() === "medium";
              
              let bgClass = "bg-[#FAFBF6]";
              let borderClass = "border-[#E2E6D8]";
              let textClass = "text-[#1A2016]";
              let badgeBg = "bg-[#E2E6D8]";
              let badgeText = "text-[#5F6656]";
              
              if (isHigh) {
                bgClass = "bg-[#FFEBEE]/60";
                borderClass = "border-[#FFCDD2]";
                textClass = "text-[#880E4F]";
                badgeBg = "bg-[#FFCDD2]";
                badgeText = "text-[#C62828]";
              } else if (isMedium) {
                bgClass = "bg-[#FFF3E0]/60";
                borderClass = "border-[#FFE0B2]";
                textClass = "text-[#E65100]";
                badgeBg = "bg-[#FFE0B2]";
                badgeText = "text-[#E65100]";
              }
              
              return (
                <div key={idx} className={`p-3 border rounded-xl flex items-start gap-3 transition-colors ${bgClass} ${borderClass}`}>
                  <div className="mt-0.5">
                    <AlertTriangle className={`w-4.5 h-4.5 ${isHigh ? "text-[#C62828]" : isMedium ? "text-[#E65100]" : "text-[#5F6656]"}`} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-tight text-[#1A2016]">
                        {risk.risk_type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${badgeBg} ${badgeText}`}>
                        {risk.severity}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed font-sans ${textClass}`}>
                      {risk.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-[#5F6656] italic text-center p-6 bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg">
            No active risks identified for this enterprise type.
          </div>
        )}
      </div>
    </div>
  );
}
