"use client";

import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { TranslationDictionary } from "@/utils/translations/dictionary";

interface PortfolioMetricsProps {
  bankableCount: number;
  atRiskCount: number;
  t: TranslationDictionary;
  isLoading?: boolean;
}

export default function PortfolioMetrics({
  bankableCount,
  atRiskCount,
  t,
  isLoading = false,
}: PortfolioMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 shrink-0">
      <div className="bg-white border border-[#E2E6D8] p-2 px-3 rounded-lg flex items-center justify-between shadow-3xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
          <span className="text-[10px] font-semibold text-[#5F6656] truncate">
            {t.dash.bankablePipeline}
          </span>
        </div>
        <div className="text-sm font-bold text-[#2E7D32] font-mono shrink-0 ml-1 flex items-center">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#2E7D32]" /> : bankableCount}
        </div>
      </div>
      <div className="bg-white border border-[#E2E6D8] p-2 px-3 rounded-lg flex items-center justify-between shadow-3xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertTriangle className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
          <span className="text-[10px] font-semibold text-[#5F6656] truncate">
            {t.dash.atRiskExposure}
          </span>
        </div>
        <div className="text-sm font-bold text-[#C62828] font-mono shrink-0 ml-1 flex items-center">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#C62828]" /> : atRiskCount}
        </div>
      </div>
    </div>
  );
}
