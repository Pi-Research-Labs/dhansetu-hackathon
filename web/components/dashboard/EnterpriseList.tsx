"use client";

import { Enterprise, formatCurrency } from "@/utils/mockData";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { Building2 } from "lucide-react";

interface EnterpriseListProps {
  enterprises: Enterprise[];
  selectedEnterpriseId: string;
  onSelect: (id: string) => void;
  t: TranslationDictionary;
}

export default function EnterpriseList({
  enterprises,
  selectedEnterpriseId,
  onSelect,
  t,
}: EnterpriseListProps) {
  if (enterprises.length === 0) {
    return (
      <div className="bg-white border border-[#E2E6D8] rounded-xl p-6 text-center text-xs text-[#5F6656] shadow-2xs">
        {t.dash.noMatch}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E6D8] rounded-xl overflow-hidden max-h-[500px] overflow-y-auto divide-y divide-[#E2E6D8]/60 shadow-2xs">
      {enterprises.map((e) => {
        const isSelected = e.id === selectedEnterpriseId;
        const tierBadge =
          e.tier === "GREEN"
            ? "text-[#2E7D32] bg-[#E8F5E9] border-[#2E7D32]/30"
            : e.tier === "AMBER"
            ? "text-[#E65100] bg-[#FFF3E0] border-[#E65100]/30"
            : "text-[#C62828] bg-[#FFEBEE] border-[#C62828]/30";

        return (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className={`w-full text-left p-3 transition-all flex items-center justify-between cursor-pointer ${
              isSelected
                ? "bg-[#E8F5E9] border-l-4 border-l-[#2E7D32]"
                : "hover:bg-[#FAFBF6]"
            }`}
          >
            <div>
              <div className="font-bold text-xs text-[#1A2016] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#5F6656]" />
                <span>{e.name}</span>
              </div>
              <div className="text-[10px] text-[#5F6656] mt-0.5">
                {e.segment} · {e.district}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${tierBadge}`}>
                {e.tier}
              </span>
              <div className="text-[10px] text-[#5F6656] font-mono mt-1">
                90D: {formatCurrency(e.forecast90)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
