"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Calendar,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { MarketPriceChart } from '@/components/charts/MarketPriceChart';
import { getMarketIntelligence, MarketIntelligenceDetail } from '@/utils/api-config';

export default function MarketScreen() {
  const { lang, enterpriseId } = useMerchantStore();
  const t = L[lang] || L.en;

  const [intel, setIntel] = useState<MarketIntelligenceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (enterpriseId) {
      setLoading(true);
      getMarketIntelligence({
        enterpriseId: enterpriseId || undefined,
      })
        .then((data) => {
          setIntel(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching market intelligence:', err);
          setLoading(false);
        });
    }
  }, [enterpriseId]);

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'high':
        return '#C0392B';
      case 'medium':
        return '#D97706';
      default:
        return '#2E7D32';
    }
  };

  const getSeverityBg = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'high':
        return 'bg-[#F8E6E2]';
      case 'medium':
        return 'bg-[#FBF0D9]';
      default:
        return 'bg-[#E7F2E7]';
    }
  };

  if (loading && !intel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#6F6B5E] mt-3 font-semibold">Loading Market Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-[#1D261F] text-xl font-bold">{t.marketTitle}</h2>
        <p className="text-[#6F6B5E] text-xs leading-normal mt-1">{t.marketSub}</p>
      </div>

      {/* Scoped Info Card */}
      <div className="bg-white border border-[#E7E5DA] rounded-2xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="text-xs">
          <span className="text-[#6F6B5E] font-medium">Industry Segment: </span>
          <span className="font-bold text-[#2E7D32]">{intel?.sub_type}</span>
        </div>
        {intel?.district && (
          <div className="flex items-center gap-1.5 text-xs text-[#6F6B5E]">
            <MapPin className="w-3.5 h-3.5 text-[#6F6B5E]" />
            <span>
              District Centroid: <span className="font-bold text-[#1D261F]">{intel.district}</span>
            </span>
          </div>
        )}
      </div>

      {/* ─── FULL-WIDTH CHART SECTION ─── */}
      <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#1D261F] mb-1">{intel?.tracked_commodity} Market Analytics</h3>
        <MarketPriceChart chartData={intel?.chart_data} />
      </div>

      {/* ─── TWO-COLUMN DETAIL GRID BELOW CHART ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: stats, productivity, seasonal */}
        <div className="flex flex-col gap-6">
          
          {/* Main KPI Card */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tracked Commodity */}
            <div className="bg-white border border-[#E7E5DA] rounded-2xl p-4 shadow-xs flex flex-col justify-between min-h-[96px]">
              <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase leading-none">
                {t.trackedCommodity}
              </span>
              <h3 className="text-[#1D261F] text-base font-extrabold mt-1.5">{intel?.tracked_commodity}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse"></span>
                <span className="text-[9px] font-bold text-[#2E7D32] uppercase tracking-wider">{t.liveFeed}</span>
              </div>
            </div>

            {/* 12-MO Price Trend */}
            <div className="bg-white border border-[#E7E5DA] rounded-2xl p-4 shadow-xs flex flex-col justify-between min-h-[96px]">
              <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase leading-none">
                12-MO Price Trend
              </span>
              {intel && (
                <h3 className={`text-base font-extrabold mt-1.5 flex items-center gap-1 ${
                  intel.price_trend_12m_pct < 0 ? 'text-[#C0392B]' : 'text-[#2E7D32]'
                }`}>
                  {intel.price_trend_12m_pct < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  <span>{intel.price_trend_12m_pct > 0 ? `+${intel.price_trend_12m_pct}%` : `${intel.price_trend_12m_pct}%`}</span>
                </h3>
              )}
              <span className="text-[9px] text-[#6F6B5E] mt-2">vs regional baseline index</span>
            </div>
          </div>

          {/* Productivity Outlook */}
          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <TrendingUp className="w-4.5 h-4.5" />
              <h3 className="text-xs font-bold text-[#1D261F]">{t.productivityTitle}</h3>
            </div>
            <p className="text-xs text-[#6F6B5E] leading-relaxed">{intel?.productivity_outlook}</p>
          </div>

          {/* Seasonal Pattern */}
          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#1565C0]">
              <Calendar className="w-4.5 h-4.5" />
              <h3 className="text-xs font-bold text-[#1D261F]">{t.seasonalTitle}</h3>
            </div>
            <p className="text-xs text-[#6F6B5E] leading-relaxed">{intel?.seasonal_pattern}</p>
          </div>

        </div>

        {/* RIGHT COLUMN: Climate & Market Risks */}
        <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#C0392B]">
            <ShieldAlert className="w-4.5 h-4.5" />
            <h3 className="text-xs font-bold text-[#1D261F]">{t.climateRisksTitle}</h3>
          </div>

          <div className="flex flex-col gap-3.5 mt-1 divide-y divide-[#E7E5DA]">
            {intel?.risks.map((r, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 pt-3 first:pt-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-bold text-[#1D261F]">{r.risk_type}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border`}
                    style={{
                      color: getSeverityColor(r.severity),
                      backgroundColor: getSeverityBg(r.severity).replace('bg-[', '').replace(']', ''),
                      borderColor: `${getSeverityColor(r.severity)}30`,
                    }}
                  >
                    {t.severityLabel(r.severity)}
                  </span>
                </div>
                <p className="text-[11px] text-[#6F6B5E] leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
