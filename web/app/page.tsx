"use client";

import { useTranslation } from "@/utils/translations/useTranslation";
import HeroSection from "@/components/landing/HeroSection";
import NetworkIllustration from "@/components/landing/NetworkIllustration";
import BacktestSection from "@/components/landing/BacktestSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import StakeholdersBar from "@/components/landing/StakeholdersBar";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#F4F5F0] text-[#1A2016] min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
