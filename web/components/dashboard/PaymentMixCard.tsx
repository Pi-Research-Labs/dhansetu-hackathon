"use client";

import React from "react";
import { PaymentMixResponse } from "@/utils/api-config";
import { Wallet, Smartphone, Banknote, ArrowRight } from "lucide-react";

interface PaymentMixCardProps {
  data?: PaymentMixResponse | null;
  isLoading?: boolean;
}

export default function PaymentMixCard({ data, isLoading = false }: PaymentMixCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs text-center text-xs text-[#5F6656]">
        Loading Payment Mix breakdown...
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const upiPct = (data.avg_upi_share * 100).toFixed(1);
  const walletPct = (data.avg_wallet_share * 100).toFixed(1);
  const digitalPct = (data.avg_digital_share * 100).toFixed(1);
  const cashPct = (data.avg_cash_share * 100).toFixed(1);

  const recentDigitalPct = (data.recent_90d_digital_share * 100).toFixed(1);
  const recentCashPct = (data.recent_90d_cash_share * 100).toFixed(1);

  const digitalShift = data.recent_90d_digital_share - data.avg_digital_share;

  return (
    <div className="bg-white border border-[#E2E6D8] p-5 rounded-2xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#E2E6D8] pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#2E7D32]" />
          <h3 className="text-xs font-bold text-[#1A2016] uppercase tracking-wider">
            Ledger Payment Channels & Digital Shift
          </h3>
        </div>

        <div className="text-[10.5px] font-mono text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#2E7D32]/30">
          Channel: {data.preferred_channel.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Full Panel Averages */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#5F6656]">Overall Payment Distribution</div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-[#FAFBF6] p-2 rounded-lg border border-[#E2E6D8]">
              <div className="text-[9.5px] text-[#5F6656] flex items-center justify-center gap-1">
                <Smartphone className="w-3 h-3 text-[#2E7D32]" />
                UPI
              </div>
              <div className="font-mono font-bold text-[#2E7D32] mt-0.5">{upiPct}%</div>
            </div>

            <div className="bg-[#FAFBF6] p-2 rounded-lg border border-[#E2E6D8]">
              <div className="text-[9.5px] text-[#5F6656] flex items-center justify-center gap-1">
                <Wallet className="w-3 h-3 text-[#1565C0]" />
                Wallet
              </div>
              <div className="font-mono font-bold text-[#1565C0] mt-0.5">{walletPct}%</div>
            </div>

            <div className="bg-[#FAFBF6] p-2 rounded-lg border border-[#E2E6D8]">
              <div className="text-[9.5px] text-[#5F6656] flex items-center justify-center gap-1">
                <Banknote className="w-3 h-3 text-[#E65100]" />
                Cash
              </div>
              <div className="font-mono font-bold text-[#E65100] mt-0.5">{cashPct}%</div>
            </div>
          </div>
        </div>

        {/* Trailing 90D Shift */}
        <div className="bg-[#FAFBF6] border border-[#E2E6D8] p-3 rounded-xl space-y-1.5">
          <div className="text-[11px] font-semibold text-[#1A2016] flex items-center justify-between">
            <span>Trailing 90D Digital Shift</span>
            <span
              className={`text-[10px] font-bold font-mono ${
                digitalShift >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"
              }`}
            >
              {digitalShift >= 0 ? "+" : ""}
              {(digitalShift * 100).toFixed(1)}% shift
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono pt-1">
            <div className="flex-1 bg-white p-1.5 rounded border border-[#E2E6D8] text-center">
              <span className="text-[9.5px] text-[#5F6656] block">Overall Digital</span>
              <strong className="text-[#2E7D32]">{digitalPct}%</strong>
            </div>

            <ArrowRight className="w-4 h-4 text-[#5F6656] shrink-0" />

            <div className="flex-1 bg-white p-1.5 rounded border border-[#2E7D32]/40 text-center">
              <span className="text-[9.5px] text-[#5F6656] block">Recent 90D</span>
              <strong className="text-[#2E7D32]">{recentDigitalPct}%</strong>
            </div>
          </div>

          <div className="text-[10px] text-[#5F6656] text-right font-mono">
            Recent Cash Share: {recentCashPct}%
          </div>
        </div>
      </div>
    </div>
  );
}
