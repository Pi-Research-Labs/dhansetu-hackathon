"use client";

import { Enterprise, formatCurrency } from "@/utils/mockData";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { Building2, PhoneCall } from "lucide-react";

interface EnterpriseDetailCardProps {
  enterprise: Enterprise;
  t: TranslationDictionary;
}

export default function EnterpriseDetailCard({
  enterprise,
  t,
}: EnterpriseDetailCardProps) {
  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#1A2016] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2E7D32]" />
              <span>{enterprise.name}</span>
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                enterprise.tier === "GREEN"
                  ? "bg-[#E8F5E9] border-[#2E7D32]/40 text-[#2E7D32]"
                  : enterprise.tier === "AMBER"
                  ? "bg-[#FFF3E0] border-[#E65100]/40 text-[#E65100]"
                  : "bg-[#FFEBEE] border-[#C62828]/40 text-[#C62828]"
              }`}
            >
              {enterprise.tier} RISK TIER
            </span>
          </div>
          <p className="text-xs text-[#5F6656] mt-1 flex items-center gap-2">
            <span>ID: {enterprise.id}</span>
            <span>·</span>
            <span>{enterprise.segment}</span>
            <span>·</span>
            <span>District: {enterprise.district}</span>
            <span>·</span>
            <span className="flex items-center gap-1 font-mono">
              <PhoneCall className="w-3 h-3 text-[#5F6656]" />
              {enterprise.phone}
            </span>
          </p>
        </div>

        {/* Confidence Indicator Pill */}
        <div className="bg-[#FAFBF6] border border-[#E2E6D8] px-3 py-1.5 rounded-xl text-right">
          <div className="text-[10px] text-[#5F6656]">{t.dash.confidence}</div>
          <div className="text-xs font-mono font-bold text-[#2E7D32]">
            {enterprise.confidence.score}% ({enterprise.confidence.label})
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-3 border-t border-[#E2E6D8]">
        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">{t.dash.metrics.avgInflow}</div>
          <div className="text-xs font-mono font-bold text-[#1A2016] mt-0.5">
            {formatCurrency(enterprise.metrics.avgInflow30)}
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">{t.dash.metrics.outInRatio}</div>
          <div
            className={`text-xs font-mono font-bold mt-0.5 ${
              enterprise.metrics.outInRatio > 1.0 ? "text-[#C62828]" : "text-[#2E7D32]"
            }`}
          >
            {enterprise.metrics.outInRatio}x
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">{t.dash.metrics.zeroDays}</div>
          <div className="text-xs font-mono font-bold text-[#1A2016] mt-0.5">
            {enterprise.metrics.zeroDays} Days
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">{t.dash.metrics.runway}</div>
          <div className="text-xs font-mono font-bold text-[#1A2016] mt-0.5">
            {enterprise.metrics.runwayMonths} Mo
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">{t.dash.metrics.dscr}</div>
          <div className="text-xs font-mono font-bold text-[#1565C0] mt-0.5">
            {enterprise.metrics.dscr ? `${enterprise.metrics.dscr}x` : "N/A"}
          </div>
        </div>

        <div className="bg-[#FAFBF6] p-2.5 rounded-lg border border-[#E2E6D8]">
          <div className="text-[10px] text-[#5F6656]">{t.dash.metrics.missedEmi}</div>
          <div
            className={`text-xs font-mono font-bold mt-0.5 ${
              enterprise.metrics.missedEmi > 0 ? "text-[#C62828]" : "text-[#2E7D32]"
            }`}
          >
            {enterprise.metrics.missedEmi}
          </div>
        </div>
      </div>
    </div>
  );
}
