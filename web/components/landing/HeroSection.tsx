"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { checkIsAuthenticated } from "@/utils/auth";
import { TranslationDictionary } from "@/utils/translations/dictionary";
import { Sparkles, ArrowRight, ShieldCheck, Store } from "lucide-react";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E2E6D8] bg-white text-[11px] font-semibold text-[#1565C0] whitespace-nowrap shadow-2xs">
      <ShieldCheck className="w-3.5 h-3.5 text-[#1565C0]" />
      {text}
    </span>
  );
}

interface HeroSectionProps {
  t: TranslationDictionary;
}

export default function HeroSection({ t }: HeroSectionProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoggedIn(isAuthenticated || checkIsAuthenticated());
    });
  }, [isAuthenticated]);

  const primaryTarget = isLoggedIn ? "/dashboard" : "/login";

  return (
    <div className="lg:col-span-7">
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FDF3D7] text-[#8A6100] text-xs font-semibold border border-[#D84315]/30 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-[#D84315]" />
        {t.land.chip}
      </span>

      <h1 className="font-['Poppins',sans-serif] font-bold text-3xl sm:text-5xl text-[#1A2016] leading-tight mb-3">
        {(() => {
          const w = t.land.welcome;
          const m = w.match(/DHANSETU|धनसेतु|ధనసేతు/);
          if (!m || m.index === undefined) return w;
          const idx = m.index;
          return (
            <>
              {w.slice(0, idx)}
              <span className="text-[#2E7D32]">{m[0]}</span>
              {w.slice(idx + m[0].length)}
            </>
          );
        })()}
      </h1>

      <p className="text-base sm:text-lg text-[#5F6656] leading-relaxed mb-4">
        {t.land.subtitle}
      </p>

      <div className="text-xs text-[#5F6656] mb-1">{t.land.whoFor}</div>
      <div className="text-xs font-bold text-[#1565C0] mb-6">{t.land.poweredBy}</div>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={primaryTarget}
          className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-[#2E7D32] hover:bg-[#236327] shadow-lg shadow-[#2E7D32]/20 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <span>{t.land.cta}</span>
        </Link>
        <a
          href="https://dhansetu-merchant.piresearchlabs.com/login"
          target="_blank"
          rel="noopener noreferrer"
          className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-[#2E7D32] hover:bg-[#236327] shadow-lg shadow-[#2E7D32]/20 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <Store className="w-4 h-4 text-white" />
          <span>{t.land.merchantCta}</span>
        </a>
      </div>

      <div className="flex flex-wrap gap-2.5 mt-8">
        <Badge text="DPDP Act 2023 · consent-first" />
        <Badge text="ISO 27001-aligned" />
        <Badge text="SOC 2-ready" />
      </div>
    </div>
  );
}
