"use client";

import { useTranslation } from "@/utils/translations/useTranslation";
import HeroSection from "@/components/landing/HeroSection";
import NetworkIllustration from "@/components/landing/NetworkIllustration";
import BacktestSection from "@/components/landing/BacktestSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import StakeholdersBar from "@/components/landing/StakeholdersBar";
import Footer from "@/components/landing/Footer";
import { Globe } from "lucide-react";

export default function LandingPage() {
  const { t, currentLanguage, changeLanguage, availableLanguages } = useTranslation();

  return (
    <div className="bg-[#F4F5F0] text-[#1A2016] min-h-screen flex flex-col font-sans">
      {/* Top Header with Gov Badge & Lang Selector */}
      <header className="border-b border-[#E2E6D8] bg-white/70 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center border border-[#E2E6D8]">
              <span className="text-xs font-bold text-[#2E7D32]">DS</span>
            </div>
            <div>
              {/* <p className="text-[9px] font-bold text-[#5F6656] tracking-wider uppercase leading-none">Government of India</p> */}
              <h1 className="text-sm font-bold text-[#1D261F] leading-tight mt-0.5">{t.nav.welcomeMerchant}</h1>
            </div>
          </div>

          {/* Lang Selector Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-[#FAFBF6] border border-[#E2E6D8] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#5F6656] hover:bg-[#FAFBF6]/85 transition-all">
            <Globe className="w-3.5 h-3.5 text-[#2E7D32]" />
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1 font-semibold text-[#1A2016]"
            >
              {availableLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <HeroSection t={t} />
          <div className="lg:col-span-5 flex justify-center">
            <NetworkIllustration t={t} />
          </div>
        </section>

        {/* Backtest Section */}
        <BacktestSection t={t} />

        {/* Features Grid */}
        <FeaturesGrid t={t} />

        {/* Stakeholders Overview */}
        <StakeholdersBar t={t} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
