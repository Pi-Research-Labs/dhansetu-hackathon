"use client";

import React from "react";
import { LatestAlert, RiskPredictionResponse } from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import { Enterprise } from "@/types/enterprise";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { ShieldAlert, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

interface RiskAndAdvicePanelProps {
  enterprise: Enterprise;
  latestAlert?: LatestAlert | null;
  prediction?: RiskPredictionResponse | null;
  t: TranslationDictionary;
}

export default function RiskAndAdvicePanel({
  enterprise,
  latestAlert,
  prediction,
  t,
}: RiskAndAdvicePanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Risk Warnings & Alert Panel */}
      <div className="bg-white border border-[#E2E6D8] p-4.5 rounded-2xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E6D8] pb-2.5">
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#C62828]" />
            <span>{t.dash.riskAlerts}</span>
          </h3>
          {latestAlert && (
            <span className="text-[10px] font-mono text-[#C62828] bg-[#FFEBEE] px-2 py-0.5 rounded font-bold border border-[#C62828]/20">
              Alert: {latestAlert.alert_id}
            </span>
          )}
        </div>

        {/* Active Alert Shortfall Info */}
        {latestAlert && (
          <div className="bg-[#FFEBEE] border border-[#FFCDD2] p-3 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#C62828]">
              <span>Projected Shortfall</span>
              <span className="font-mono">{formatCurrency(latestAlert.projected_shortfall)}</span>
            </div>
            <p className="text-[11px] text-[#5F6656] font-mono">
              Raised on {latestAlert.raised_at} · Expected week of {latestAlert.shortfall_week_of}
            </p>
          </div>
        )}

        {/* Risk Reasons List */}
        {enterprise.reasons.length === 0 && !latestAlert ? (
          <div className="text-xs text-[#5F6656] p-3 bg-[#FAFBF6] rounded-xl border border-[#E2E6D8] text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
            <span>{t.dash.noAlerts}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {enterprise.reasons.map((r, idx) => (
              <div key={idx} className="bg-[#FFEBEE]/70 border border-[#FFCDD2] p-2.5 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#C62828]">{r.tag}</div>
                  <div className="text-[11px] text-[#5F6656] mt-0.5">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Risk Model Prediction Stats */}
        {prediction && (
          <div className="pt-2 border-t border-[#E2E6D8] text-[10.5px] font-mono text-[#5F6656] grid grid-cols-2 gap-2">
            <div>
              <span>Stress Prob: </span>
              <strong className="text-[#C62828]">{(prediction.prob_stress * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span>Fused Score: </span>
              <strong className="text-[#1A2016]">{(prediction.fused_score * 100).toFixed(1)}%</strong>
            </div>
          </div>
        )}
      </div>

      {/* Action Guidance & Recommended Steps */}
      <div className="bg-white border border-[#E2E6D8] p-4.5 rounded-2xl shadow-2xs space-y-3">
        <div className="border-b border-[#E2E6D8] pb-2.5">
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2E7D32]" />
            <span>{t.dash.suggestedActions}</span>
          </h3>
        </div>

        {latestAlert?.actions && latestAlert.actions.length > 0 ? (
          <div className="space-y-2">
            {latestAlert.actions.map((act) => (
              <div key={act.rank} className="bg-[#E8F5E9] border border-[#C8E6C9] p-2.5 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#2E7D32] capitalize">
                    Rank #{act.rank}: {t.actionKeys[act.action_key] || act.action_key.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-[#1A2016] mt-0.5">
                    Mechanism: {t.mechanisms[act.mechanism] || act.mechanism.replace(/_/g, " ")} (Audience: {act.audience})
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
