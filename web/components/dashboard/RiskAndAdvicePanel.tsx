"use client";

import React from "react";
import { LatestAlert, RiskPredictionResponse } from "@/utils/api-config";
import { formatCurrency } from "@/utils/formatters";
import { Enterprise } from "@/types/enterprise";
import { ActionParams, TranslationDictionary } from "@/utils/translations/dictionary";
import { ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Info, TrendingUp } from "lucide-react";

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
  // Round to 3dp before scaling, because v_officer_worklist does
  // ROUND(fused_score, 3) in SQL and this panel reads the raw value from
  // /risk/{id}/predict. Without this the same enterprise reads 42/100 in the
  // list and 41/100 on the card (0.415 vs 0.4148) — one number, two answers,
  // on screen at the same time.
  const roundedFused = Math.round((prediction?.fused_score ?? 0) * 1000) / 1000;

  // Tier cutoffs come from risk_assessments.tier_cutoffs ("AMBER>=0.38;RED>=0.58"),
  // so the band word beside the overall score is the same verdict as the tier
  // badge rather than an independently invented scale.
  const overallPct = roundedFused * 100;
  const overallBand =
    overallPct >= 58 ? t.tiers.RED : overallPct >= 38 ? t.tiers.AMBER : t.tiers.GREEN;
  const overallColor = overallPct >= 58 ? "#C62828" : overallPct >= 38 ? "#E65100" : "#2E7D32";

  const stressPct = (prediction?.prob_stress ?? 0) * 100;
  const stressBand =
    stressPct >= 50 ? t.dash.scoreBandHigh : stressPct >= 20 ? t.dash.scoreBandModerate : t.dash.scoreBandLow;
  const stressColor = stressPct >= 50 ? "#C62828" : stressPct >= 20 ? "#E65100" : "#2E7D32";

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
            {/* Labels are the officer-facing wording, not the column names:
                "Stress Prob"/"Fused Score" are model vocabulary and a field
                officer has no reason to know them. Tooltip copy lives in the
                dictionary like the rest of the dashboard, so it translates
                with the language switcher instead of staying English. */}
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-0.5 group relative cursor-help">
                <span>{t.dash.scoreStressLabel}</span>
                <Info className="w-3 h-3 text-[#5F6656] shrink-0" />
                <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-56 p-2 bg-[#1A2016] text-white text-[10px] font-sans rounded-lg shadow-lg z-50 normal-case leading-normal font-normal">
                  {t.dash.scoreStressTooltip}
                  <span className="absolute top-full left-3 border-[5px] border-transparent border-t-[#1A2016]"></span>
                </span>
              </span>
              <span className="flex items-baseline gap-1.5">
                <strong className="text-sm" style={{ color: stressColor }}>
                  {Math.round(prediction.prob_stress * 100)}%
                </strong>
                <span className="text-[10px] font-semibold" style={{ color: stressColor }}>
                  {stressBand}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <span className="flex items-center gap-0.5 group relative cursor-help">
                <span>{t.dash.scoreOverallLabel}</span>
                <Info className="w-3 h-3 text-[#5F6656] shrink-0" />
                <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-56 p-2 bg-[#1A2016] text-white text-[10px] font-sans rounded-lg shadow-lg z-50 normal-case leading-normal font-normal text-left">
                  {t.dash.scoreOverallTooltip}
                  <span className="absolute top-full right-3 border-[5px] border-transparent border-t-[#1A2016]"></span>
                </span>
              </span>
              <span className="flex items-baseline gap-1.5">
                {/* "/100" rather than "%": a percentage invites "percent of
                    what?", and the worklist already scores out of 100, so the
                    two screens now read the same. The band word is the tier
                    the badge above shows, so the number and the tier can't
                    look like two unrelated verdicts. */}
                <strong className="text-sm" style={{ color: overallColor }}>
                  {Math.round(overallPct)}
                  <span className="text-[10px] font-normal text-[#5F6656]">/100</span>
                </strong>
                <span className="text-[10px] font-semibold" style={{ color: overallColor }}>
                  {overallBand}
                </span>
              </span>
            </div>
            {/* Neither number says which way is good on its own — a field
                officer shouldn't have to infer it from the colour. */}
            <div className="col-span-2 text-[9.5px] text-[#5F6656] flex items-center gap-1 pt-0.5 border-t border-[#E2E6D8]/60">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>{t.dash.scoreDirectionHint}</span>
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
            {/* The rule engine already attaches real numbers to each action
                (amount at risk, days of runway, months to cover) — the card
                used to drop them and print "Mechanism: margin_squeeze
                (Audience: both)" instead, which is scorer vocabulary, not
                something to say to a merchant. Guidance sentences consume
                those params; "Rank #N" becomes plain ordering. */}
            {latestAlert.actions.map((act, idx) => {
              const guidance = t.dash.actionGuidance[act.action_key];
              const title = t.actionKeys[act.action_key] || act.action_key.replace(/_/g, " ");
              return (
                <div key={act.rank} className="bg-[#E8F5E9] border border-[#C8E6C9] p-2.5 rounded-xl flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#2E7D32] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#2E7D32]">{title}</div>
                    <div className="text-[11px] text-[#1A2016] mt-0.5 leading-relaxed">
                      {guidance ? guidance(act.params as ActionParams) : t.mechanisms[act.mechanism] || act.mechanism.replace(/_/g, " ")}
                    </div>
                    <div className="text-[9.5px] text-[#5F6656] mt-1 border border-[#C8E6C9] bg-white/60 rounded-full px-1.5 py-0.5 inline-block">
                      {t.dash.actionAudience[act.audience] || act.audience}
                    </div>
                  </div>
                </div>
              );
            })}
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
