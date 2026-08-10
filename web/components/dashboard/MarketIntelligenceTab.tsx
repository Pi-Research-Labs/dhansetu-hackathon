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
  Loader2,
  Calendar,
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign,
  ShieldAlert,
  CloudRain,
  Flame,
  Zap,
  Bug,
  Eye,
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

interface TooltipPayloadEntry {
  dataKey: string | number;
  value: string | number;
  [key: string]: unknown;
}

const formatMonthLabel = (value: any) => {
  if (!value || typeof value !== "string") return String(value || "");
  const parts = value.split("-");
  if (parts.length !== 2) return value;

  let monthNum = 0;
  let yearStr = "";

  if (parts[0].length === 4) {
    // YYYY-MM
    yearStr = parts[0];
    monthNum = parseInt(parts[1], 10);
  } else {
    // MM-YYYY
    monthNum = parseInt(parts[0], 10);
    yearStr = parts[1];
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (monthNum >= 1 && monthNum <= 12) {
    const shortMonth = months[monthNum - 1];
    const shortYear = yearStr.slice(-2);
    return `${shortMonth}'${shortYear}`;
  }
  return value;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E2E6D8] p-3 rounded-xl shadow-md text-xs font-sans">
        <p className="font-bold text-[#1A2016] mb-1.5">{formatMonthLabel(label)}</p>
        {payload.map((entry: TooltipPayloadEntry, index: number) => {
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

/* ---------- Risk icon helper ---------- */
function getRiskIcon(riskType: string, className: string) {
  const lower = riskType.toLowerCase();
  if (lower.includes("flood") || lower.includes("rain") || lower.includes("water") || lower.includes("drought")) {
    return <CloudRain className={className} />;
  }
  if (lower.includes("heat") || lower.includes("fire") || lower.includes("temperature")) {
    return <Flame className={className} />;
  }
  if (lower.includes("pest") || lower.includes("disease") || lower.includes("infestation")) {
    return <Bug className={className} />;
  }
  if (lower.includes("price") || lower.includes("market") || lower.includes("demand") || lower.includes("supply")) {
    return <Zap className={className} />;
  }
  return <ShieldAlert className={className} />;
}

interface MarketIntelligenceTabProps {
  initialSubType?: string;
}

export default function MarketIntelligenceTab({ initialSubType }: MarketIntelligenceTabProps = {}) {
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [selectedSubType, setSelectedSubType] = useState<string>("Dairy Producer");
  const [prevSelectedSubType, setPrevSelectedSubType] = useState<string>("Dairy Producer");
  const [intel, setIntel] = useState<MarketIntelligenceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsMobile(true);
    }
  }, []);

  // Sync loading and error states during render-phase when selectedSubType changes
  if (selectedSubType !== prevSelectedSubType) {
    setLoading(true);
    setError(null);
    setPrevSelectedSubType(selectedSubType);
  }

  // 1. Fetch categories list once on mount
  useEffect(() => {
    let isMounted = true;
    fetchMarketCategories()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setCategories(list);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [prevInitialSubType, setPrevInitialSubType] = useState<string | undefined>(undefined);
  const [prevCategories, setPrevCategories] = useState<MarketCategory[]>([]);

  // Sync selectedSubType during render-phase when initialSubType changes
  if (initialSubType !== prevInitialSubType) {
    setPrevInitialSubType(initialSubType);
    if (initialSubType && categories.length > 0) {
      const match = categories.find(
        (cat) => cat.sub_type.toLowerCase() === initialSubType.toLowerCase()
      );
      if (match) {
        setSelectedSubType(match.sub_type);
      }
    }
  }

  // Sync selectedSubType during render-phase when categories load/change
  if (categories !== prevCategories) {
    setPrevCategories(categories);
    if (initialSubType) {
      const match = categories.find(
        (cat) => cat.sub_type.toLowerCase() === initialSubType.toLowerCase()
      );
      if (match) {
        setSelectedSubType(match.sub_type);
      }
    } else {
      const currentIsValid = categories.some((cat) => cat.sub_type === selectedSubType);
      if (!currentIsValid) {
        const hasDairy = categories.some((cat) => cat.sub_type === "Dairy Producer");
        if (hasDairy) {
          setSelectedSubType("Dairy Producer");
        } else if (categories.length > 0) {
          setSelectedSubType(categories[0].sub_type);
        }
      }
    }
  }

  // 2. Fetch market intel whenever selectedSubType changes
  useEffect(() => {
    let isMounted = true;
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

  /* ---------- Severity helpers for risk cards ---------- */
  const severityConfig = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === "high") return {
      gradient: "from-[#C62828]/8 via-[#FFEBEE]/40 to-white",
      border: "border-[#EF9A9A]",
      accentBar: "bg-gradient-to-b from-[#C62828] to-[#E53935]",
      iconColor: "text-[#C62828]",
      badgeBg: "bg-[#C62828]",
      badgeText: "text-white",
      textColor: "text-[#880E4F]",
      dotPulse: "bg-[#C62828]",
      barWidth: "100%",
      barColor: "bg-gradient-to-r from-[#C62828] to-[#E53935]",
      label: "HIGH",
    };
    if (s === "medium") return {
      gradient: "from-[#E65100]/6 via-[#FFF3E0]/40 to-white",
      border: "border-[#FFCC80]",
      accentBar: "bg-gradient-to-b from-[#E65100] to-[#FB8C00]",
      iconColor: "text-[#E65100]",
      badgeBg: "bg-[#E65100]",
      badgeText: "text-white",
      textColor: "text-[#BF360C]",
      dotPulse: "bg-[#E65100]",
      barWidth: "60%",
      barColor: "bg-gradient-to-r from-[#E65100] to-[#FB8C00]",
      label: "MEDIUM",
    };
    return {
      gradient: "from-[#2E7D32]/4 via-[#E8F5E9]/30 to-white",
      border: "border-[#C8E6C9]",
      accentBar: "bg-gradient-to-b from-[#43A047] to-[#66BB6A]",
      iconColor: "text-[#2E7D32]",
      badgeBg: "bg-[#2E7D32]",
      badgeText: "text-white",
      textColor: "text-[#1B5E20]",
      dotPulse: "bg-[#2E7D32]",
      barWidth: "30%",
      barColor: "bg-gradient-to-r from-[#43A047] to-[#66BB6A]",
      label: "LOW",
    };
  };

  return (
    <div className="w-full h-auto lg:h-full flex flex-col min-h-0 overflow-visible lg:overflow-y-auto space-y-5 pb-4 pr-1 lg:[&::-webkit-scrollbar]:w-1 lg:[&::-webkit-scrollbar-thumb]:bg-neutral-400/50 lg:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400/70 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-track]:bg-transparent lg:[scrollbar-width:thin] lg:[scrollbar-color:rgba(163,163,163,0.5)_transparent]">
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
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
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
            {intel?.district && (
              <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#5F6656] uppercase">District:</span>
                <span className="font-mono font-bold text-[#1565C0] uppercase">{intel.district}</span>
              </div>
            )}
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

      {/* Chart — full width */}
      <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col min-h-[370px] shrink-0">
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
        <div className="flex-1 w-full min-h-[300px]">
          {intel?.chart_data && intel.chart_data.length > 0 ? (<ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
            <ComposedChart
              data={intel.chart_data}
              margin={isMobile ? { top: 10, right: 5, left: 5, bottom: 5 } : { top: 15, right: 10, left: 10, bottom: 5 }}
              style={{ outline: "none" }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2EB" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonthLabel}
                tick={{ fill: "#5F6656", fontSize: isMobile ? 8 : 9, fontFamily: "system-ui, sans-serif" }}
                tickLine={{ stroke: "#E2E6D8" }}
                axisLine={{ stroke: "#E2E6D8" }}
              />
              <YAxis
                yAxisId="price"
                orientation="left"
                domain={["dataMin - 5", "dataMax + 5"]}
                width={isMobile ? 28 : 40}
                tick={{ fill: "#2E7D32", fontSize: isMobile ? 8 : 9, fontFamily: "system-ui, sans-serif" }}
                tickLine={{ stroke: "#E2E6D8" }}
                axisLine={{ stroke: "#E2E6D8" }}
                label={isMobile ? undefined : {
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
                width={isMobile ? 28 : 40}
                tick={{ fill: "#1565C0", fontSize: isMobile ? 8 : 9, fontFamily: "system-ui, sans-serif" }}
                tickLine={{ stroke: "#E2E6D8" }}
                axisLine={{ stroke: "#E2E6D8" }}
                label={isMobile ? undefined : {
                  value: "Rainfall (mm)",
                  angle: 90,
                  position: "insideRight",
                  offset: 5,
                  style: { fill: "#1565C0", fontSize: 9, fontWeight: "bold", fontFamily: "sans-serif" },
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#F0F2EB", strokeWidth: 1 }} />
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
                barSize={isMobile ? 10 : 18}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price_index"
                name="Price Index"
                stroke="#2E7D32"
                strokeWidth={2.5}
                dot={{ r: 3, stroke: "#2E7D32", strokeWidth: 1.5, fill: "#fff" }}
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

      {/* ===== Insights Row: Productivity Outlook + Seasonal Pattern ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 shrink-0">
        {/* Productivity Outlook Card */}
        <div className="bg-white border border-[#E2E6D8] rounded-xl shadow-3xs hover:shadow-sm transition-shadow duration-200">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4 border-b border-[#E2E6D8]/60 pb-3">
              <div className="w-7 h-7 rounded-md bg-[#F1F8F2] border border-[#C8E6C9] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-[#1A2016] uppercase tracking-wider">
                  Productivity Outlook
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="bg-[#FAFBF6] border border-[#E2E6D8]/40 rounded-lg p-3.5">
              <p className="text-[12px] text-[#1A2016] leading-relaxed font-medium">
                {intel?.productivity_outlook || "N/A"}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-3.5">
              <Eye className="w-3.5 h-3.5 text-[#8C9385]" />
              <span className="text-[10px] text-[#5F6656]">
                Analysis based on regional production data and climate models
              </span>
            </div>
          </div>
        </div>

        {/* Seasonal Pattern & Demand Card */}
        <div className="bg-white border border-[#E2E6D8] rounded-xl shadow-3xs hover:shadow-sm transition-shadow duration-200">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4 border-b border-[#E2E6D8]/60 pb-3">
              <div className="w-7 h-7 rounded-md bg-[#F0F7FF] border border-[#BBDEFB] flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-[#1565C0]" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-[#1A2016] uppercase tracking-wider">
                  Seasonal Pattern & Demand
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="bg-[#FAFBF6] border border-[#E2E6D8]/40 rounded-lg p-3.5">
              <p className="text-[12px] text-[#1A2016] leading-relaxed font-medium">
                {intel?.seasonal_pattern || "N/A"}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-3.5">
              <Eye className="w-3.5 h-3.5 text-[#8C9385]" />
              <span className="text-[10px] text-[#5F6656]">
                Analysis based on historical seasonal demand cycles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Climate & Market Risk Assessment ===== */}
      <div className="bg-white border border-[#E2E6D8] rounded-xl shadow-3xs shrink-0">
        {/* Section Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E6D8] bg-[#FAFBF6] rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#FFF5F5] border border-[#FFCDD2] flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C62828]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
                Climate & Market Risk Assessment
              </h3>
              <p className="text-[10px] text-[#5F6656] mt-0.5">Identified threats and vulnerability indicators</p>
            </div>
          </div>
          {intel?.risks && intel.risks.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E2E6D8]">
              <span className="text-[10px] font-bold text-[#1A2016]">
                {intel.risks.length} Active Risks
              </span>
            </div>
          )}
        </div>

        {/* Risk Cards */}
        <div className="p-5">
          {intel?.risks && intel.risks.length > 0 ? (
            <div className={`grid gap-4 ${intel.risks.length === 1
              ? "grid-cols-1 max-w-xl"
              : intel.risks.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : intel.risks.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              }`}>
              {intel.risks.map((risk: MarketRiskCard, idx: number) => {
                const s = risk.severity.toLowerCase();

                let borderClass = "border-[#E2E6D8]";
                let iconColor = "text-[#5F6656]";
                let badgeClass = "bg-[#F5F6F2] text-[#5F6656] border-[#E2E6D8]";
                let barColor = "bg-[#E2E6D8]";
                let barWidth = "30%";

                if (s === "high") {
                  borderClass = "border-[#FFCDD2]";
                  iconColor = "text-[#C62828]";
                  badgeClass = "bg-[#FFF5F5] text-[#C62828] border-[#FFCDD2]";
                  barColor = "bg-[#C62828]";
                  barWidth = "100%";
                } else if (s === "medium") {
                  borderClass = "border-[#FFE0B2]";
                  iconColor = "text-[#E65100]";
                  badgeClass = "bg-[#FFF8F0] text-[#E65100] border-[#FFE0B2]";
                  barColor = "bg-[#E65100]";
                  barWidth = "60%";
                } else if (s === "low") {
                  borderClass = "border-[#C8E6C9]";
                  iconColor = "text-[#2E7D32]";
                  badgeClass = "bg-[#F1F8F2] text-[#2E7D32] border-[#C8E6C9]";
                  barColor = "bg-[#2E7D32]";
                  barWidth = "30%";
                }

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-lg border ${borderClass} p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col`}
                  >
                    {/* Risk header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`shrink-0 w-6 h-6 rounded-md bg-[#FAFBF6] border border-[#E2E6D8] flex items-center justify-center`}>
                          {getRiskIcon(risk.risk_type, `w-3 h-3 ${iconColor}`)}
                        </div>
                        <span className="font-bold text-[11px] uppercase tracking-wide text-[#1A2016] leading-tight">
                          {risk.risk_type}
                        </span>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                        {risk.severity}
                      </span>
                    </div>

                    {/* Detail text */}
                    <p className="text-[11px] leading-relaxed text-[#5F6656] flex-1 mb-4">
                      {risk.detail}
                    </p>

                    {/* Severity progress bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium text-[#8C9385]">Severity</span>
                      <div className="flex-1 h-1 bg-[#F5F6F2] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: barWidth }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#F1F8F2] border border-[#C8E6C9] flex items-center justify-center mb-3">
                <ShieldAlert className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <p className="text-[11px] font-bold text-[#1A2016] mb-1">No Active Risks</p>
              <p className="text-[10px] text-[#5F6656] max-w-xs">
                No climate or market risks have been identified for this enterprise type at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
