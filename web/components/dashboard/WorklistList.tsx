"use client";

import React from "react";
import { WorklistItem } from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { Building2, AlertTriangle, MapPin, Clock, ShieldAlert, Loader2 } from "lucide-react";

interface WorklistListProps {
  items: WorklistItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  t: TranslationDictionary;
  isLoading?: boolean;
  error?: string | null;
}

export default function WorklistList({
  items,
  selectedId,
  onSelect,
  t,
  isLoading = false,
  error = null,
}: WorklistListProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2E6D8] rounded-xl p-8 text-center text-xs text-[#5F6656] shadow-2xs flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-[#2E7D32] animate-spin" />
        <span>Loading Officer Worklist from API...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFEBEE] border border-[#C62828]/30 rounded-xl p-4 text-xs text-[#C62828] shadow-2xs flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Failed to load worklist: {error}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#E2E6D8] rounded-xl p-6 text-center text-xs text-[#5F6656] shadow-2xs">
        {t.dash.noMatch || "No worklist items match your criteria."}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E6D8] rounded-xl overflow-hidden max-h-[560px] overflow-y-auto divide-y divide-[#E2E6D8]/60 shadow-2xs">
      {items.map((item) => {
        const isSelected = item.enterprise_id === selectedId;
        const tierBadge =
          item.risk_tier === "GREEN"
            ? "text-[#2E7D32] bg-[#E8F5E9] border-[#2E7D32]/30"
            : item.risk_tier === "AMBER"
            ? "text-[#E65100] bg-[#FFF3E0] border-[#E65100]/30"
            : "text-[#C62828] bg-[#FFEBEE] border-[#C62828]/30";

        const formattedScore = (item.score * 100).toFixed(1);

        const reasons = [item.reason_1, item.reason_2, item.reason_3].filter(
          (r): r is string => Boolean(r && r.trim())
        );

        return (
          <button
            key={item.enterprise_id}
            onClick={() => onSelect(item.enterprise_id)}
            className={`w-full text-left p-3.5 transition-all cursor-pointer flex flex-col gap-2 ${
              isSelected
                ? "bg-[#E8F5E9]/70 border-l-4 border-l-[#2E7D32]"
                : "hover:bg-[#FAFBF6]"
            }`}
          >
            {/* Header: Name + Risk Tier Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-xs text-[#1A2016] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                  <span>{item.proprietor_name}</span>
                </div>
                <div className="text-[10px] text-[#5F6656] mt-0.5 flex items-center gap-1 font-mono">
                  <span>ID: {item.enterprise_id}</span>
                  <span>·</span>
                  <span>{item.sub_type}</span>
                  <span>·</span>
                  <span>{item.block}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${tierBadge}`}>
                  {item.risk_tier} ({formattedScore}%)
                </span>
              </div>
            </div>

            {/* Metrics Row: Rupees at Risk & Net Buffer Days */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E2E6D8]/40 text-[10px]">
              <div className="bg-[#FAFBF6] px-2 py-1 rounded border border-[#E2E6D8]/60 flex items-center justify-between">
                <span className="text-[#5F6656] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[#C62828]" />
                  At Risk:
                </span>
                <span className="font-mono font-bold text-[#C62828]">
                  {formatCurrency(item.rupees_at_risk || item.projected_shortfall)}
                </span>
              </div>

              <div className="bg-[#FAFBF6] px-2 py-1 rounded border border-[#E2E6D8]/60 flex items-center justify-between">
                <span className="text-[#5F6656] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#E65100]" />
                  Buffer:
                </span>
                <span
                  className={`font-mono font-bold ${
                    item.net_buffer_days < 0 ? "text-[#C62828]" : "text-[#2E7D32]"
                  }`}
                >
                  {item.net_buffer_days}d
                </span>
              </div>
            </div>

            {/* Bottom Row: Key Reasons Tags & Distance */}
            <div className="flex items-center justify-between text-[9.5px] text-[#5F6656] pt-0.5">
              <div className="flex flex-wrap items-center gap-1 max-w-[70%]">
                {reasons.slice(0, 2).map((reason) => (
                  <span
                    key={reason}
                    className="bg-[#F4F5F0] border border-[#E2E6D8] px-1.5 py-0.2 rounded text-[9px] font-medium text-[#5F6656]"
                  >
                    {reason.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-0.5 text-[#5F6656] font-mono">
                <MapPin className="w-3 h-3 text-[#5F6656]" />
                <span>{item.km_from_centre}km</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
