"use client";

import React from "react";
import { PaymentMixResponse } from "@/utils/api-config";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { Wallet, Smartphone, Banknote, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

interface PaymentMixCardProps {
  data?: PaymentMixResponse | null;
  isLoading?: boolean;
  t?: TranslationDictionary;
}

export default function PaymentMixCard({ data, isLoading = false, t }: PaymentMixCardProps) {
  const tMix = t?.dash;

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs text-center text-xs text-[#5F6656]">
        {tMix?.loadingPaymentMix || "Loading Payment Mix breakdown..."}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate percentages (handling potential string conversion issues safely)
  const upiVal = data.avg_upi_share * 100;
  const walletVal = data.avg_wallet_share * 100;
  const cashVal = data.avg_cash_share * 100;
  const digitalVal = data.avg_digital_share * 100;

  const upiPct = upiVal.toFixed(1);
  const walletPct = walletVal.toFixed(1);
  const digitalPct = digitalVal.toFixed(1);
  const cashPct = cashVal.toFixed(1);

  const recentDigitalPct = (data.recent_90d_digital_share * 100).toFixed(1);
  const recentCashPct = (data.recent_90d_cash_share * 100).toFixed(1);

  const digitalShift = data.recent_90d_digital_share - data.avg_digital_share;
  const shiftPctStr = (digitalShift * 100).toFixed(1);
  const isPositiveShift = digitalShift >= 0;

  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs space-y-4">
      {/* Header section with badge */}
      <div className="flex items-center justify-between border-b border-[#E2E6D8] pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#2E7D32]" />
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            {tMix?.paymentMixTitle || "Ledger Payment Channels & Digital Shift"}
          </h3>
        </div>

        <div className="text-[10.5px] font-mono text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#2E7D32]/30 font-bold">
          {tMix?.preferredChannel || "Channel"}: {data.preferred_channel.toUpperCase()}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Panel 1: Stacked Segmented Progress Bar & Legend */}
        <div className="bg-[#FAFBF6] border border-[#E2E6D8] p-3.5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="text-[11px] font-semibold text-[#5F6656]">
            {tMix?.overallDistribution || "Overall Payment Distribution"}
          </div>

          {/* Segmented Stacked Progress Bar */}
          <div className="h-3.5 w-full rounded-full bg-[#E2E6D8] overflow-hidden flex shadow-inner">
            {upiVal > 0 && (
              <div
                style={{ width: `${upiVal}%` }}
                className="bg-[#2E7D32] h-full transition-all"
                title={`UPI: ${upiPct}%`}
              />
            )}
            {walletVal > 0 && (
              <div
                style={{ width: `${walletVal}%` }}
                className="bg-[#1565C0] h-full transition-all"
                title={`Wallet: ${walletPct}%`}
              />
            )}
            {cashVal > 0 && (
              <div
                style={{ width: `${cashVal}%` }}
                className="bg-[#E65100] h-full transition-all"
                title={`Cash: ${cashPct}%`}
              />
            )}
          </div>

          {/* Legend detailing the distribution */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="bg-white p-1 rounded-lg border border-[#E2E6D8]/60">
              <div className="text-[#5F6656] flex items-center justify-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                {tMix?.upiLabel || "UPI"}
              </div>
              <div className="font-mono font-bold text-[#2E7D32] mt-0.5">{upiPct}%</div>
            </div>

            <div className="bg-white p-1 rounded-lg border border-[#E2E6D8]/60">
              <div className="text-[#5F6656] flex items-center justify-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
                {tMix?.walletLabel || "Wallet"}
              </div>
              <div className="font-mono font-bold text-[#1565C0] mt-0.5">{walletPct}%</div>
            </div>

            <div className="bg-white p-1 rounded-lg border border-[#E2E6D8]/60">
              <div className="text-[#5F6656] flex items-center justify-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E65100]" />
                {tMix?.cashLabel || "Cash"}
              </div>
              <div className="font-mono font-bold text-[#E65100] mt-0.5">{cashPct}%</div>
            </div>
          </div>
        </div>

        {/* Panel 2: Trailing 90D Shift */}
        <div className="bg-[#FAFBF6] border border-[#E2E6D8] p-3.5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="text-[11px] font-semibold text-[#1A2016] flex items-center justify-between">
            <span>{tMix?.trailing90DShift || "Trailing 90D Digital Shift"}</span>
            <span
              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                isPositiveShift
                  ? "text-[#2E7D32] bg-[#E8F5E9] border-[#2E7D32]/20"
                  : "text-[#C62828] bg-[#FFEBEE] border-[#C62828]/20"
              }`}
            >
              {isPositiveShift ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {isPositiveShift ? "+" : ""}
                {tMix?.shiftText ? tMix.shiftText(shiftPctStr) : `${shiftPctStr}% shift`}
              </span>
            </span>
          </div>

          {/* Visual Shift flow */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex-1 bg-white p-2 rounded-lg border border-[#E2E6D8] text-center">
              <span className="text-[9.5px] text-[#5F6656] block mb-0.5">{tMix?.overallDigital || "Overall Digital"}</span>
              <strong className="text-[#2E7D32] text-sm">{digitalPct}%</strong>
            </div>

            <ArrowRight className="w-4 h-4 text-[#5F6656] shrink-0" />

            <div className="flex-1 bg-white p-2 rounded-lg border border-[#2E7D32]/20 text-center bg-[#E8F5E9]/10">
              <span className="text-[9.5px] text-[#5F6656] block mb-0.5">{tMix?.recent90D || "Recent 90D"}</span>
              <strong className="text-[#2E7D32] text-sm">{recentDigitalPct}%</strong>
            </div>
          </div>

          <div className="text-[9.5px] text-[#5F6656] text-right font-mono font-medium leading-none">
            {tMix?.recentCashShare || "Recent Cash Share"}: <strong className="text-[#E65100]">{recentCashPct}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
