"use client";

import { TrendingUp, AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { TranslationDictionary } from "@/utils/translations/dictionary";

interface FeaturesGridProps {
  t: TranslationDictionary;
}

export default function FeaturesGrid({ t }: FeaturesGridProps) {
  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block text-xs font-bold tracking-widest text-[#2E7D32] bg-[#E8F5E9] px-3.5 py-1 rounded-full uppercase mb-2">
            {t.land.secEyebrow}
          </div>
          <h2 className="font-['Poppins',sans-serif] font-bold text-2xl sm:text-3xl text-[#1A2016] leading-tight mb-2">
            {t.land.secTitle}
          </h2>
          <p className="text-sm text-[#5F6656] leading-relaxed">
            {t.land.secIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="featcard bg-[#FAFBF6] border border-[#E2E6D8] p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-sm mb-3">
              <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <h3 className="font-bold text-sm text-[#1A2016] mb-1.5">
              {t.land.features.f1Title}
            </h3>
            <p className="text-xs text-[#5F6656] leading-relaxed">
              {t.land.features.f1Desc}
            </p>
          </div>

          <div className="featcard bg-[#FAFBF6] border border-[#E2E6D8] p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#FBE9E7] text-[#D84315] flex items-center justify-center font-bold text-sm mb-3">
              <AlertTriangle className="w-5 h-5 text-[#D84315]" />
            </div>
            <h3 className="font-bold text-sm text-[#1A2016] mb-1.5">
              {t.land.features.f2Title}
            </h3>
            <p className="text-xs text-[#5F6656] leading-relaxed">
              {t.land.features.f2Desc}
            </p>
          </div>

          <div className="featcard bg-[#FAFBF6] border border-[#E2E6D8] p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center font-bold text-sm mb-3">
              <CreditCard className="w-5 h-5 text-[#1565C0]" />
            </div>
            <h3 className="font-bold text-sm text-[#1A2016] mb-1.5">
              {t.land.features.f3Title}
            </h3>
            <p className="text-xs text-[#5F6656] leading-relaxed">
              {t.land.features.f3Desc}
            </p>
          </div>

          <div className="featcard bg-[#FAFBF6] border border-[#E2E6D8] p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#E65100] flex items-center justify-center font-bold text-sm mb-3">
              <ShieldCheck className="w-5 h-5 text-[#E65100]" />
            </div>
            <h3 className="font-bold text-sm text-[#1A2016] mb-1.5">
              {t.land.features.f4Title}
            </h3>
            <p className="text-xs text-[#5F6656] leading-relaxed">
              {t.land.features.f4Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
