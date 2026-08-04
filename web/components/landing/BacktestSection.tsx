"use client";

import { TrendingUp } from "lucide-react";

interface BacktestSectionProps {
  t: any;
}

export default function BacktestSection({ t }: BacktestSectionProps) {
  return (
    <section className="bg-white border-y border-[#E2E6D8] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#2E7D32] bg-[#E8F5E9] px-3.5 py-1 rounded-full uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            {t.land.backtestTitle}
          </div>
          <p className="text-xs text-[#5F6656] mt-1.5">{t.land.backtestSub}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-[#F4F5F0] border border-[#E2E6D8]">
            <div className="text-2xl font-mono font-bold text-[#2E7D32]">29.2%</div>
            <div className="text-xs text-[#5F6656] mt-1">90-Day Error Reduction</div>
          </div>
          <div className="p-4 rounded-xl bg-[#F4F5F0] border border-[#E2E6D8]">
            <div className="text-2xl font-mono font-bold text-[#D84315]">57.5%</div>
            <div className="text-xs text-[#5F6656] mt-1">180-Day Error Reduction</div>
          </div>
          <div className="p-4 rounded-xl bg-[#F4F5F0] border border-[#E2E6D8]">
            <div className="text-2xl font-mono font-bold text-[#1565C0]">98.6%</div>
            <div className="text-xs text-[#5F6656] mt-1">90D Directional Accuracy</div>
          </div>
          <div className="p-4 rounded-xl bg-[#F4F5F0] border border-[#E2E6D8]">
            <div className="text-2xl font-mono font-bold text-[#2E7D32]">100.0%</div>
            <div className="text-xs text-[#5F6656] mt-1">180D Directional Accuracy</div>
          </div>
        </div>
      </div>
    </section>
  );
}
