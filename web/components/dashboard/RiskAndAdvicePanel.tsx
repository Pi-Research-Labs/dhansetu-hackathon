"use client";

import { Enterprise } from "@/utils/mockData";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { ShieldAlert, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface RiskAndAdvicePanelProps {
  enterprise: Enterprise;
  t: TranslationDictionary;
}

export default function RiskAndAdvicePanel({
  enterprise,
  t,
}: RiskAndAdvicePanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Risk Warnings */}
      <div className="bg-white border border-[#E2E6D8] p-4.5 rounded-2xl shadow-2xs">
        <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-[#C62828]" />
          <span>{t.dash.riskAlerts}</span>
        </h3>

        {enterprise.reasons.length === 0 ? (
          <div className="text-xs text-[#5F6656] p-3 bg-[#FAFBF6] rounded-xl border border-[#E2E6D8] text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span>{t.dash.noAlerts}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {enterprise.reasons.map((r, idx) => (
              <div key={idx} className="bg-[#FFEBEE] border border-[#FFCDD2] p-2.5 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#C62828]">{r.tag}</div>
                  <div className="text-[11px] text-[#5F6656] mt-0.5">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Guidance */}
      <div className="bg-white border border-[#E2E6D8] p-4.5 rounded-2xl shadow-2xs">
        <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#2E7D32]" />
          <span>{t.dash.suggestedActions}</span>
        </h3>

        <div className="space-y-2">
          {enterprise.adviceKeys.map((key, idx) => (
            <div key={idx} className="bg-[#E8F5E9] border border-[#C8E6C9] p-2.5 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <p className="text-xs text-[#1A2016] leading-relaxed">
                {t.advice[key] || "Maintain current operations & ensure timely EMI repayment."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
