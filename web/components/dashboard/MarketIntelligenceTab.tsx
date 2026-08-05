"use client";

import React, { useState, useEffect } from "react";
import {
  getEvidenceDistrictEvents,
  getEvidenceAlertPrecision,
  getEvidenceReasonCodeScorecard,
  getEvidenceLeadTime,
  getEvidenceForecastAccuracy,
  getEvidenceHeadroomByTier,
  EvidenceDistrictEvent,
  EvidenceAlertPrecisionItem,
  EvidenceReasonCodeScorecardItem,
  EvidenceLeadTimeResponse,
  EvidenceForecastAccuracyItem,
  EvidenceHeadroomByTierItem,
} from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import {
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Loader2,
  Database,
} from "lucide-react";

export default function MarketIntelligenceTab() {
  const [loading, setLoading] = useState<boolean>(true);
  const [leadTime, setLeadTime] = useState<EvidenceLeadTimeResponse | null>(null);
  const [districtEvents, setDistrictEvents] = useState<EvidenceDistrictEvent[]>([]);
  const [scorecard, setScorecard] = useState<EvidenceReasonCodeScorecardItem[]>([]);
  const [precision, setPrecision] = useState<EvidenceAlertPrecisionItem[]>([]);
  const [accuracy, setAccuracy] = useState<EvidenceForecastAccuracyItem[]>([]);
  const [headroom, setHeadroom] = useState<EvidenceHeadroomByTierItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getEvidenceLeadTime().catch(() => null),
      getEvidenceDistrictEvents().catch(() => []),
      getEvidenceReasonCodeScorecard().catch(() => []),
      getEvidenceAlertPrecision().catch(() => []),
      getEvidenceForecastAccuracy().catch(() => []),
      getEvidenceHeadroomByTier().catch(() => []),
    ]).then(([lt, de, sc, pr, ac, hr]) => {
      if (isMounted) {
        setLeadTime(lt);
        setDistrictEvents(de || []);
        setScorecard(sc || []);
        setPrecision(pr || []);
        setAccuracy(ac || []);
        setHeadroom(hr || []);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center bg-white border border-[#E2E6D8] rounded-2xl shadow-2xs p-12 text-center text-xs text-[#5F6656] gap-3">
        <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
        <div>
          <h4 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            Loading Market Intelligence Insights...
          </h4>
          <p className="text-[10px] text-[#5F6656] mt-1 font-mono">
            Fetching system efficacy metrics, lead times, and active block-level warnings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-hidden space-y-5 pb-1">
      {/* Top row: Performance efficacy stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch shrink-0">
        {/* Lead warning time */}
        <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6656] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#E65100]" />
            <span>Lead Warning Window</span>
          </div>
          <div>
            <div className="text-xl font-bold text-[#E65100] font-mono">
              {leadTime?.median_lead_days || 0}d
            </div>
            <p className="text-[9.5px] text-[#5F6656] mt-0.5 leading-tight">
              Median warning before cash depletes (episodes: <strong>{leadTime?.episodes || 0}</strong>, caught: <strong>{(Number(leadTime?.caught || 0) / Number(leadTime?.episodes || 1) * 100).toFixed(0)}%</strong>)
            </p>
          </div>
        </div>

        {/* Prediction Precision */}
        <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6656] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Red Tier Precision</span>
          </div>
          <div>
            <div className="text-xl font-bold text-[#2E7D32] font-mono">
              {Number(precision.find((p) => p.risk_tier === "RED")?.precision || 0).toFixed(1)}%
            </div>
            <p className="text-[9.5px] text-[#5F6656] mt-0.5 leading-tight">
              True positive rate of high-risk warning alerts in live field evaluations
            </p>
          </div>
        </div>

        {/* Forecast Mean Absolute Error (MAE) */}
        <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6656] uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>30D Forecast Error</span>
          </div>
          <div>
            <div className="text-xl font-bold text-[#1565C0] font-mono">
              {formatCurrency(accuracy.find((a) => a.horizon_days === 30)?.mae || 0)}
            </div>
            <p className="text-[9.5px] text-[#5F6656] mt-0.5 leading-tight">
              MAE across 30-day forecast horizons (coverage: <strong>{Number(accuracy.find((a) => a.horizon_days === 30)?.coverage_pct || 0).toFixed(0)}%</strong>)
            </p>
          </div>
        </div>

        {/* Average Headroom */}
        <div className="bg-white border border-[#E2E6D8] p-4 rounded-xl shadow-3xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5F6656] uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Green Tier Headroom</span>
          </div>
          <div>
            <div className="text-xl font-bold text-[#2E7D32] font-mono">
              {formatCurrency(headroom.find((h) => h.risk_tier === "GREEN")?.avg_credit_headroom || 0)}
            </div>
            <p className="text-[9.5px] text-[#5F6656] mt-0.5 leading-tight">
              Pre-qualified credit limit headroom average for low-risk stable units
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0 overflow-hidden">
        {/* District Cohort Events */}
        <div className="lg:col-span-7 bg-white border border-[#E2E6D8] p-4 rounded-xl space-y-3 shadow-3xs flex flex-col min-h-0 h-full overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#E2E6D8] pb-2 shrink-0">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
              Active District Cohort Events
            </h3>
          </div>

          {districtEvents.length === 0 ? (
            <div className="text-xs text-[#5F6656] italic text-center p-8 bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg my-auto">
              No active district-wide stress trends detected.
            </div>
          ) : (
            <div className="overflow-auto flex-1 min-h-0 mt-2 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2E7D32]/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin]">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#FAFBF6] border-y border-[#E2E6D8] text-[#5F6656] font-semibold font-mono">
                    <th className="py-2 px-2">District/Sector</th>
                    <th className="py-2 px-2">Mechanism</th>
                    <th className="py-2 px-2 text-center">Flagged Rate</th>
                    <th className="py-2 px-2 text-center">No Buffer</th>
                    <th className="py-2 px-2">Action Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6D8]/60 font-mono text-[10.5px]">
                  {districtEvents.map((event, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFBF6]">
                      <td className="py-2 px-2 font-sans font-medium text-[#1A2016]">
                        {event.district} <span className="text-[9.5px] text-[#5F6656] font-normal capitalize">({event.sector.toLowerCase()})</span>
                      </td>
                      <td className="py-2 px-2 text-[#5F6656] capitalize">
                        {event.mechanism.replace(/_/g, " ")}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-[#C62828]">
                        {event.flagged}/{event.total_in_cohort} ({event.pct_of_cohort}%)
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-[#E65100]">
                        {event.no_buffer}
                      </td>
                      <td className="py-2 px-2 text-[#2E7D32] font-semibold text-[10px]">
                        {event.visit_these_three.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Efficacy Scorecard */}
        <div className="lg:col-span-5 bg-white border border-[#E2E6D8] p-4 rounded-xl space-y-3 shadow-3xs flex flex-col min-h-0 h-full overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#E2E6D8] pb-2 shrink-0">
            <Activity className="w-4 h-4 text-[#2E7D32]" />
            <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
              Mechanism Efficacy Scorecard
            </h3>
          </div>

          <div className="overflow-auto flex-1 min-h-0 mt-2 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#2E7D32]/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin]">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#FAFBF6] border-y border-[#E2E6D8] text-[#5F6656] font-semibold font-mono">
                  <th className="py-2 px-2">Trigger Mechanism</th>
                  <th className="py-2 px-2 text-center">Pred / True</th>
                  <th className="py-2 px-2 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6D8]/60 font-mono text-[10.5px]">
                {scorecard.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFBF6]">
                    <td className="py-2 px-2 font-sans font-medium text-[#1A2016] capitalize">
                      {row.mechanism ? row.mechanism.replace(/_/g, " ") : "All Mechanisms"}
                    </td>
                    <td className="py-2 px-2 text-center text-[#5F6656]">
                      {row.predicted_count} / {row.true_count}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-[#2E7D32]">
                      {row.accuracy ? `${Number(row.accuracy * 100).toFixed(0)}%` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
