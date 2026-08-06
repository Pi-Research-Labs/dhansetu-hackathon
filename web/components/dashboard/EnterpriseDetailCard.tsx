"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  EnterpriseCard,
  fetchMapTileBlobUrl,
  getNetInflowHeatmap,
  NetInflowHeatmapItem,
} from "@/utils/api-config";
import { formatCurrency, formatCurrencyCompact } from "@/utils/formatters";
import { Enterprise } from "@/types/enterprise";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import {
  Building2,
  MapPin,
  ShieldAlert,
  CreditCard,
  Clock,
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Minimize2,
  Loader2,
  TrendingUp,
  AlertCircle,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";

interface EnterpriseDetailCardProps {
  card?: EnterpriseCard | null;
  enterprise?: Enterprise;
  t?: TranslationDictionary;
}

export default function EnterpriseDetailCard({
  card,
  enterprise,
  t,
}: EnterpriseDetailCardProps) {
  // Extract values prioritizing raw API card properties
  const id = card?.enterprise_id || enterprise?.id || "";
  const name = card?.business_name || card?.proprietor_name || enterprise?.name || "";
  const proprietor = card?.proprietor_name || enterprise?.name || "";
  const district = (card?.district as string) || enterprise?.district || "District";
  const tier = (card?.risk_tier || enterprise?.tier || "AMBER").toUpperCase();
  const rawScore = card?.score ?? enterprise?.score ?? 0;
  const scorePct = rawScore <= 1 ? (rawScore * 100).toFixed(1) : rawScore.toFixed(1);

  // 1. Next 3 months net (proj.)
  const forecast90d = card?.forecast_net_90d_p50 ?? enterprise?.forecast90 ?? 0;

  // 2. Next 6 months net (proj.)
  const forecast180d = card?.forecast_net_180d_p50 ?? enterprise?.forecast180 ?? 0;

  // 3. Savings runway
  const savingsRunwayDays =
    card?.savings_runway_days ??
    card?.net_buffer_days ??
    (enterprise?.metrics?.runwayMonths ? Math.round(enterprise.metrics.runwayMonths * 30) : 0);
  const runwayDisplay = `${(savingsRunwayDays / 30).toFixed(1)} mo`;

  // 4. Missed EMIs (90d)
  const missedEmi = enterprise?.metrics?.missedEmi ?? 0;
  const hasLoan = Boolean(enterprise?.metrics?.loan && enterprise.metrics.loan > 0) || card?.dscr_proj_180d !== null;
  const noLoanText = t?.dash?.noLoan || "no loan";
  const missedEmiDisplay = hasLoan ? `${missedEmi}` : noLoanText;

  // 5. DSCR (projected)
  const rawDscr = card?.dscr_proj_180d ?? enterprise?.metrics?.dscr ?? null;
  const parsedDscr = rawDscr !== null && rawDscr !== undefined ? parseFloat(String(rawDscr)) : NaN;
  const dscrVal = isNaN(parsedDscr) ? null : parsedDscr;
  const dscrDisplay = dscrVal !== null ? dscrVal.toFixed(2) : noLoanText;

  // 6. Digital visibility
  const digitalShareRaw = enterprise?.metrics?.digitalShare ?? 0.85;
  const digitalShareNum = typeof digitalShareRaw === "number" ? digitalShareRaw : parseFloat(String(digitalShareRaw)) || 0.85;
  // digital_share is a fraction and should be <=1, but ~19% of live rows run
  // slightly over (up to ~1.09) — a data-quality quirk upstream, not a UI
  // bug. 1.5 gives real fractions (even the noisy over-1 ones) headroom to
  // still be read as "fraction, multiply by 100" rather than
  // "already a percent", and the outer clamp catches the rest.
  const digitalVisibilityPct = Math.min(
    100,
    Math.max(0, Math.round(digitalShareNum <= 1.5 ? digitalShareNum * 100 : digitalShareNum))
  );

  // Secondary metrics
  const creditHeadroom = card?.credit_headroom ?? enterprise?.metrics.creditHeadroom ?? 0;
  const bridgeHeadroom = card?.bridge_headroom ?? enterprise?.metrics.savings ?? 0;
  const marginGap = card?.margin_gap_90d ?? null;

  // Interactive Map State
  const [zoom, setZoom] = useState<number>(15);
  const [mapTileUrl, setMapTileUrl] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(true);
  const [isExpandedMap, setIsExpandedMap] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Net Cashflow Heatmap State & Aggregate Window Filter (Default: 7 Weeks)
  const [heatmapData, setHeatmapData] = useState<NetInflowHeatmapItem[]>([]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState<boolean>(false);
  const [timePeriod, setTimePeriod] = useState<7 | 14>(7);
  const [isPeriodOpen, setIsPeriodOpen] = useState<boolean>(false);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  // Heatmap Hover Tooltip States
  const [hoveredItem, setHoveredItem] = useState<NetInflowHeatmapItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadTile() {
      setIsLoadingMap(true);
      setMapError(null);

      try {
        const size = isExpandedMap ? "640x380" : "450x250";
        const url = await fetchMapTileBlobUrl(id, zoom, size);
        if (isMounted) {
          setMapTileUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (err) {
        if (isMounted) {
          setMapError(err instanceof Error ? err.message : "Map tile unavailable");
        }
      } finally {
        if (isMounted) {
          setIsLoadingMap(false);
        }
      }
    }

    loadTile();

    return () => {
      isMounted = false;
    };
  }, [id, zoom, isExpandedMap]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (mapTileUrl) {
        URL.revokeObjectURL(mapTileUrl);
      }
    };
  }, [mapTileUrl]);

  // Fetch Net Cashflow Heatmap (backend returns exactly the 7 or 14 week window)
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoadingHeatmap(true);
    });

    getNetInflowHeatmap(id, timePeriod)
      .then((data) => {
        if (isMounted) {
          setHeatmapData(data || []);
        }
      })
      .catch(() => {
        if (isMounted) setHeatmapData([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHeatmap(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, timePeriod]);

  // Auto-scroll heatmap to the most recent trailing week when period changes
  useEffect(() => {
    if (heatmapScrollRef.current && heatmapData.length > 0) {
      heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth;
    }
  }, [heatmapData]);

  // Handle smooth horizontal scrolling via buttons
  const scrollHeatmap = (direction: "left" | "right") => {
    if (heatmapScrollRef.current) {
      const scrollAmount = direction === "left" ? -120 : 120;
      heatmapScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const tierBadge =
    tier === "GREEN"
      ? "bg-[#E8F5E9] border-[#2E7D32]/40 text-[#2E7D32]"
      : tier === "AMBER"
      ? "bg-[#FFF3E0] border-[#E65100]/40 text-[#E65100]"
      : "bg-[#FFEBEE] border-[#C62828]/40 text-[#C62828]";

  const translatedTier = t?.tiers?.[tier as "GREEN" | "AMBER" | "RED"] || tier;
  const riskTierLabel = t?.dash?.riskTier || "RISK TIER";

  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs space-y-4">
      {/* Main Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Enterprise Details Text Column */}
        <div
          className={`space-y-2.5 ${
            isExpandedMap ? "md:col-span-12" : "md:col-span-7 lg:col-span-8"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#1A2016] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2E7D32]" />
              <span>{name}</span>
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tierBadge}`}>
              {translatedTier.toUpperCase()} {riskTierLabel} ({scorePct}%)
            </span>
          </div>

          <p className="text-xs text-[#5F6656] flex flex-wrap items-center gap-2">
            <span className="font-mono font-medium">
              {t?.dash?.proprietor || "Proprietor"}: {proprietor}
            </span>
            <span>·</span>
            <span className="font-mono">{t?.dash?.id || "ID"}: {id}</span>
            <span>·</span>
            <span>
              {t?.dash?.district || "District"}: {district}
            </span>
          </p>

          {/* Quick Headroom & Margin Pills */}
          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            {creditHeadroom > 0 && (
              <div className="bg-[#E8F5E9] border border-[#2E7D32]/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
                <CreditCard className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span className="text-[#5F6656]">
                  {t?.dash?.creditHeadroom || "Credit Headroom"}:{" "}
                </span>
                <strong className="text-[#2E7D32]">{formatCurrency(creditHeadroom)}</strong>
              </div>
            )}

            <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#E65100]" />
              <span className="text-[#5F6656]">
                {t?.dash?.bridgeHeadroom || "Bridge Headroom"}:{" "}
              </span>
              <strong className="text-[#2E7D32]">{formatCurrency(bridgeHeadroom)}</strong>
            </div>

            {marginGap !== null && (
              <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C62828]" />
                <span className="text-[#5F6656]">
                  {t?.dash?.marginGap90d || "90D Margin Gap"}:{" "}
                </span>
                <strong className="text-[#C62828]">{marginGap}%</strong>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Map Tile Container */}
        <div
          className={`transition-all duration-300 ${
            isExpandedMap ? "md:col-span-12" : "md:col-span-5 lg:col-span-4"
          }`}
        >
          <div
            className={`relative w-full rounded-xl overflow-hidden border border-[#E2E6D8] bg-[#1A2016] shadow-inner transition-all duration-300 flex items-center justify-center ${
              isExpandedMap ? "h-72 sm:h-80" : "h-36 sm:h-40"
            }`}
          >
            {isLoadingMap && (
              <div className="absolute inset-0 bg-[#1A2016]/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-white gap-1.5">
                <Loader2 className="w-5 h-5 text-[#4CAF50] animate-spin" />
                <span className="text-[10px] font-mono font-semibold">Loading map...</span>
              </div>
            )}

            {mapTileUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={mapTileUrl}
                alt={`Location map for ${name}`}
                className="w-full h-full object-cover transition-all"
              />
            ) : mapError ? (
              <div className="text-center p-2 text-white/70 text-[10px] font-mono flex flex-col items-center gap-1">
                <MapPin className="w-4 h-4 text-[#C62828]" />
                <span>Map Tile Unavailable</span>
              </div>
            ) : null}

            {/* Interactive Map Controls */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-[#1A2016]/85 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-md">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(prev + 1, 19))}
                disabled={zoom >= 19 || isLoadingMap}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all disabled:opacity-40 cursor-pointer"
                title="Zoom In (+)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(prev - 1, 12))}
                disabled={zoom <= 12 || isLoadingMap}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all disabled:opacity-40 cursor-pointer"
                title="Zoom Out (-)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoom(15)}
                disabled={zoom === 15 || isLoadingMap}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all disabled:opacity-40 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <div className="w-px h-3.5 bg-white/30 my-auto" />

              <button
                type="button"
                onClick={() => setIsExpandedMap(!isExpandedMap)}
                className="p-1 rounded bg-white/10 hover:bg-white/30 text-white transition-all cursor-pointer"
                title={isExpandedMap ? "Collapse View" : "Expand Map View"}
              >
                {isExpandedMap ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Core Metrics & Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3 border-t border-[#E2E6D8] items-stretch">
        {/* 1. Next 3 months net (proj.) */}
        <div className="bg-[#FAFBF6] p-2.5 rounded-xl border border-[#E2E6D8] flex flex-col justify-between h-full space-y-2">
          <div className="flex items-start gap-1.5 min-w-0">
            <TrendingUp className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#5F6656] font-semibold leading-tight min-w-0 break-words">
              {t?.dash?.metrics?.m3 || "Next 3 months net (proj.)"}
            </div>
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              forecast90d < 0 ? "text-[#C62828]" : "text-[#1A2016]"
            }`}
          >
            {formatCurrency(forecast90d)}
          </div>
        </div>

        {/* 2. Next 6 months net (proj.) */}
        <div className="bg-[#FAFBF6] p-2.5 rounded-xl border border-[#E2E6D8] flex flex-col justify-between h-full space-y-2">
          <div className="flex items-start gap-1.5 min-w-0">
            <TrendingUp className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#5F6656] font-semibold leading-tight min-w-0 break-words">
              {t?.dash?.metrics?.m6 || "Next 6 months net (proj.)"}
            </div>
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              forecast180d < 0 ? "text-[#C62828]" : "text-[#1A2016]"
            }`}
          >
            {formatCurrency(forecast180d)}
          </div>
        </div>

        {/* 3. Savings runway */}
        <div className="bg-[#FAFBF6] p-2.5 rounded-xl border border-[#E2E6D8] flex flex-col justify-between h-full space-y-2">
          <div className="flex items-start gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 text-[#E65100] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#5F6656] font-semibold leading-tight min-w-0 break-words">
              {t?.dash?.metrics?.runway || "Savings runway"}
            </div>
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              savingsRunwayDays < 30 ? "text-[#C62828]" : "text-[#1A2016]"
            }`}
          >
            {runwayDisplay}
          </div>
        </div>

        {/* 4. Missed EMIs (90d) */}
        <div className="bg-[#FAFBF6] p-2.5 rounded-xl border border-[#E2E6D8] flex flex-col justify-between h-full space-y-2">
          <div className="flex items-start gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-[#C62828] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#5F6656] font-semibold leading-tight min-w-0 break-words">
              {t?.dash?.metrics?.missedEmi || "Missed EMIs (90d)"}
            </div>
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              missedEmi >= 1 ? "text-[#C62828]" : "text-[#1A2016]"
            }`}
          >
            {missedEmiDisplay}
          </div>
        </div>

        {/* 5. DSCR (projected) */}
        <div className="bg-[#FAFBF6] p-2.5 rounded-xl border border-[#E2E6D8] flex flex-col justify-between h-full space-y-2">
          <div className="flex items-start gap-1.5 min-w-0">
            <Activity className="w-3.5 h-3.5 text-[#1565C0] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#5F6656] font-semibold leading-tight min-w-0 break-words">
              {t?.dash?.metrics?.dscr || "DSCR (projected)"}
            </div>
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              dscrVal !== null && dscrVal < 1.25 ? "text-[#E65100]" : "text-[#1A2016]"
            }`}
          >
            {dscrDisplay}
          </div>
        </div>

        {/* 6. Digital visibility */}
        <div className="bg-[#FAFBF6] p-2.5 rounded-xl border border-[#E2E6D8] flex flex-col justify-between h-full space-y-2">
          <div className="flex items-start gap-1.5 min-w-0">
            <CreditCard className="w-3.5 h-3.5 text-[#2E7D32] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#5F6656] font-semibold leading-tight min-w-0 break-words">
              {t?.dash?.metrics?.digital || "Digital visibility"}
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-[#2E7D32]">
            {digitalVisibilityPct}%
          </div>
        </div>

        {/* 7. Trailing Digital Heatmap Scroll Widget (Spanning 4 columns on row 2, matching KPI card height) */}
        <div className="bg-[#FAFBF6] px-2.5 py-2 rounded-xl border border-[#E2E6D8] col-span-2 sm:col-span-3 lg:col-span-4 flex flex-col justify-between min-w-0 h-full relative">
          {/* Header Row: Title, Period Selector Toggle & Legend */}
          <div className="flex items-center justify-between text-[10px] text-[#5F6656] leading-none mb-1 gap-1">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <Calendar className="w-3 h-3 text-[#2E7D32] shrink-0" />
              <span className="truncate">{t?.dash?.heatmapTitle || "Digital Activity Heatmap"}</span>

              {/* Time Period Selector Overlay Button */}
              <button
                type="button"
                onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                className="px-1.5 py-0.5 rounded border border-[#E2E6D8] text-[9px] font-mono font-bold text-[#2E7D32] bg-white hover:bg-[#FAFBF6] flex items-center gap-0.5 cursor-pointer shadow-2xs transition-all"
                title={t?.dash?.heatmapTimeHorizon || "Select Heatmap Time Horizon"}
              >
                <span>{t?.dash?.heatmapWeeks ? t.dash.heatmapWeeks(timePeriod) : `${timePeriod}W`}</span>
                <ChevronDown className="w-3 h-3 text-[#5F6656]" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[8.5px] font-mono shrink-0">
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-xs bg-[#2E7D32] inline-block" /> {t?.dash?.heatmapPositive || "Positive"}</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-xs bg-[#C62828] inline-block" /> {t?.dash?.heatmapNegative || "Negative"}</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-xs bg-[#E0E2D8] inline-block" /> {t?.dash?.heatmapZero || "No activity"}</span>
            </div>
          </div>

          {/* Time Period Selection Modal / Popover Overlay */}
          {isPeriodOpen && (
            <div className="absolute inset-0 bg-[#1A2016]/85 backdrop-blur-xs z-30 rounded-xl p-2.5 flex flex-col justify-center text-white shadow-xl">
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-[11px] font-bold font-mono text-[#E8F5E9] flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#4CAF50]" /> {t?.dash?.heatmapTimeHorizon || "Heatmap Time Horizon"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPeriodOpen(false)}
                  className="text-white/70 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 w-full">
                {[7, 14].map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => {
                      setTimePeriod(weeks as 7 | 14);
                      setIsPeriodOpen(false);
                    }}
                    className={`py-1.5 px-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border text-center ${
                      timePeriod === weeks
                        ? "bg-[#2E7D32] border-[#4CAF50] text-white shadow-sm"
                        : "bg-white/10 border-white/20 text-white/90 hover:bg-white/25"
                    }`}
                  >
                    {t?.dash?.heatmapWeeks ? t.dash.heatmapWeeks(weeks) : `${weeks} Weeks`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoadingHeatmap ? (
            <div className="flex items-center justify-center py-1 text-[10px] text-[#5F6656] font-mono gap-1.5">
              <Loader2 className="w-3 h-3 text-[#2E7D32] animate-spin" />
              <span>{t?.dash?.heatmapLoading || "Loading Heatmap..."}</span>
            </div>
          ) : heatmapData.length > 0 ? (
            <div className="flex items-center gap-1 relative min-w-0 w-full">
              {/* Left Scroll Button - visible only for the 14-week view */}
              {timePeriod > 7 && (
                <button
                  type="button"
                  onClick={() => scrollHeatmap("left")}
                  className="p-0.5 rounded bg-white border border-[#E2E6D8] text-[#5F6656] hover:text-[#1A2016] hover:bg-[#FAFBF6] shadow-2xs cursor-pointer shrink-0 transition-all z-10"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}

              {/* Unified Scrollable Tiles Track */}
              <div
                ref={heatmapScrollRef}
                className={`overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center gap-1.5 py-0.5 flex-1 min-w-0 ${
                  timePeriod === 7 ? "justify-between" : ""
                }`}
              >
                {heatmapData.map((item) => {
                  const net = item.net_inflow || 0;

                  let bgCol = "bg-[#E0E2D8]";
                  let textCol = "text-[#5F6656]";
                  if (net > 0) {
                    bgCol = "bg-[#2E7D32]";
                    textCol = "text-white";
                  } else if (net < 0) {
                    bgCol = "bg-[#C62828]";
                    textCol = "text-white";
                  }

                  const shortWeek = item.week_start ? item.week_start.slice(5) : "";

                  return (
                    <div
                      key={item.week_start}
                      className="flex-1 min-w-[40px] sm:min-w-[56px] max-w-[88px] flex flex-col items-center shrink-0 group relative cursor-pointer"
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div
                        className={`w-full h-4.5 rounded-xs flex items-center justify-center text-[7.5px] sm:text-[8.5px] font-mono font-bold px-0.5 ${bgCol} ${textCol} transition-transform group-hover:scale-105`}
                      >
                        {formatCurrencyCompact(net)}
                      </div>
                      <span className="text-[7.5px] font-mono text-[#5F6656] leading-none mt-0.5 whitespace-nowrap">
                        {shortWeek}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right Scroll Button - visible only for the 14-week view */}
              {timePeriod > 7 && (
                <button
                  type="button"
                  onClick={() => scrollHeatmap("right")}
                  className="p-0.5 rounded bg-white border border-[#E2E6D8] text-[#5F6656] hover:text-[#1A2016] hover:bg-[#FAFBF6] shadow-2xs cursor-pointer shrink-0 transition-all z-10"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-[#5F6656] italic py-0.5 font-mono">
              {t?.dash?.heatmapNoData || "No weekly cashflow data recorded for this enterprise."}
            </div>
          )}

          {/* Floating Hover Tooltip Detail Overlay (Follows Mouse Cursor) */}
          {hoveredItem && (
            <div
              style={{
                position: "fixed",
                left: `${mousePos.x + 12}px`,
                top: `${mousePos.y + 12}px`,
                zIndex: 9999,
                pointerEvents: "none",
              }}
              className="bg-[#1A2016]/95 backdrop-blur-md border border-white/20 text-white p-2.5 rounded-lg shadow-xl text-[10px] font-mono space-y-1"
            >
              <div className="text-[9.5px] text-[#A2E6D8] font-bold pb-0.5 border-b border-white/10 mb-1">
                {hoveredItem.week_start} – {hoveredItem.week_end}
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/70">{t?.dash?.heatmapStatus || "Status"}:</span>
                <span
                  className={
                    hoveredItem.net_inflow > 0
                      ? "text-[#81C784] font-bold"
                      : hoveredItem.net_inflow < 0
                      ? "text-[#FF8A80] font-bold"
                      : "text-white/80 font-bold"
                  }
                >
                  {hoveredItem.net_inflow > 0
                    ? t?.dash?.heatmapPositive || "Positive"
                    : hoveredItem.net_inflow < 0
                    ? t?.dash?.heatmapNegative || "Negative"
                    : t?.dash?.heatmapZero || "No activity"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-white/70">{t?.dash?.heatmapNetCashflow || "Net Cashflow"}:</span>
                <strong className="text-white">{formatCurrency(hoveredItem.net_inflow)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




