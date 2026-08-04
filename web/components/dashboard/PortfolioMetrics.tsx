"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { TranslationDictionary } from "@/utils/translations/dictionary";

interface PortfolioMetricsProps {
  bankableCount: number;
  atRiskCount: number;
  t: TranslationDictionary;
}

export default function PortfolioMetrics({
  bankableCount,
  atRiskCount,
  t,
}: PortfolioMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white border border-[#E2E6D8] p-3.5 rounded-xl shadow-2xs">
        <div className="text-[11px] text-[#5F6656] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>{t.dash.bankablePipeline}</span>
        </div>
        <div className="text-lg font-bold text-[#2E7D32] font-mono mt-1">
          {bankableCount} Units
        </div>
      </div>
      <div className="bg-white border border-[#E2E6D8] p-3.5 rounded-xl shadow-2xs">
        <div className="text-[11px] text-[#5F6656] flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-[#C62828]" />
          <span>{t.dash.atRiskExposure}</span>
        </div>
        <div className="text-lg font-bold text-[#C62828] font-mono mt-1">
          {atRiskCount} Units
        </div>
      </div>
    </div>
  );
}
